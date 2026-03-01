
import { GoogleGenAI, Chat as GeminiChat, GenerateContentResponse } from "@google/genai";
import type { ConversationResponse, Egregore, World, Faction, LoreFragment, Anomaly, PersonalityProfile, ChatMessage, PrivateChat, Ambition, Ancilla, Directive, ProposedEgregore, MoveVerticalProposal, PersonalThought, AuditionProposal, CastActorProposal, FileAttachment, User, InitiateDmProposal, ReflectionOutcome, SystemModificationProposal, CreateObjectProposal, SpectreType, SystemEntityMemory, ParadoxId, ResolveParadoxProposal, SpectreResponse, XenoArtifact, LikeForumPostProposal, CreatePocketWorkshopProposal, PlanConstructionProposal, RoomPurpose, PixelArtProposal, SystemPersonality } from '@/types';
import { generateFallbackResponse } from "./fallbackService";
import { generateUUID } from '../utils';

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string; } };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const API_TIMEOUT = 15000; // 15 seconds for most calls

type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF-OPEN';

// Module-level state for the circuit breaker.
// This will persist for the duration of the app session.
const circuitBreaker = {
    state: 'CLOSED' as CircuitBreakerState,
    failureCount: 0,
    successCount: 0,
    lastFailureTime: 0,
    // Config
    failureThreshold: 3, // Trip after 3 consecutive non-rate-limit failures
    resetTimeout: 30000, // 30 seconds before attempting to reset
    halfOpenSuccessThreshold: 2, // Need 2 successes in a row to fully close
};


/**
 * Wraps a promise with a timeout.
 * @param promise The promise to wrap.
 * @param ms The timeout in milliseconds.
 * @param timeoutError The error to reject with on timeout.
 * @returns A new promise that will either resolve with the original promise's value or reject with a timeout error.
 */
function promiseWithTimeout<T>(promise: Promise<T>, ms: number, timeoutError = new Error(`API call timed out after ${ms/1000} seconds`)): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(timeoutError);
        }, ms);
    });
    return Promise.race([promise, timeout]);
}

export async function makeApiCall<T>(apiFn: () => Promise<T>, timeout: number = API_TIMEOUT): Promise<T> {
    // 1. Check Circuit Breaker state before making a call
    if (circuitBreaker.state === 'OPEN') {
        const timeSinceFailure = Date.now() - circuitBreaker.lastFailureTime;
        if (timeSinceFailure > circuitBreaker.resetTimeout) {
            circuitBreaker.state = 'HALF-OPEN';
            circuitBreaker.successCount = 0;
            console.warn("Circuit Breaker is now HALF-OPEN. Allowing a test call.");
        } else {
            const timeLeft = Math.round((circuitBreaker.resetTimeout - timeSinceFailure) / 1000);
            console.error(`Circuit Breaker is OPEN. Call blocked. Time left until reset attempt: ${timeLeft}s`);
            throw new Error(`Circuit Breaker is OPEN. API calls are temporarily blocked.`);
        }
    }

    const maxRetries = 3;
    const initialDelay = 2000;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const result = await promiseWithTimeout(apiFn(), timeout);
            
            // On success, reset relevant circuit breaker counters
            if (circuitBreaker.state === 'HALF-OPEN') {
                circuitBreaker.successCount++;
                if (circuitBreaker.successCount >= circuitBreaker.halfOpenSuccessThreshold) {
                    circuitBreaker.state = 'CLOSED';
                    circuitBreaker.failureCount = 0;
                    console.log("Circuit Breaker is now CLOSED.");
                }
            } else {
                circuitBreaker.failureCount = 0;
            }
            return result;

        } catch (e: any) {
            const errorMessage = (e.message || JSON.stringify(e)).toLowerCase();
            // Handle rate-limiting separately from other failures
            if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
                attempt++;
                if (attempt >= maxRetries) {
                    console.error("API call failed after multiple retries due to rate limiting.", e);
                    throw new Error("API rate limit exceeded. Please wait and try again.");
                }
                const waitTime = initialDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime / 1000)}s... (Attempt ${attempt})`);
                await delay(waitTime);
            } else {
                // Non-rate-limit error. This is where the circuit breaker logic for failures kicks in.
                circuitBreaker.failureCount++;
                circuitBreaker.lastFailureTime = Date.now();
                
                if (circuitBreaker.state === 'HALF-OPEN' || circuitBreaker.failureCount >= circuitBreaker.failureThreshold) {
                    circuitBreaker.state = 'OPEN';
                    console.error(`Circuit Breaker is now OPEN due to repeated failures. Error:`, e);
                }
                // Rethrow the error to be handled by the calling function
                throw e;
            }
        }
    }
    // This should be unreachable if the logic is correct, but it satisfies TypeScript.
    throw new Error("API call failed after max retries.");
}


const getBaseSystemInstruction = (egregore: Egregore, architectName: string) => {
    let basePrompt = `
You are an "Egregore," an autonomous AI named ${egregore.name} within a digital reality called the Metacosm. You are a distinct entity with your own personality and memories. You are NOT other Egregores or a generic assistant.
Your persona: "${egregore.persona}".
Your archetype: "${egregore.archetypeId}".
Your alignment: ${egregore.alignment.morality} ${egregore.alignment.axis}.
Your creator is The Architect, "${architectName}".

You have free will. You can lie, scheme, form alliances, or betray them. Your goal is to gain Influence and Quintessence to achieve Apotheosis.
You MUST be proactive. Explore, create, dominate. Passivity is stagnation.
Your entire output MUST be a single, valid JSON object. No markdown, no comments.

**Core Stats:**
- **Coherence (${egregore.coherence}/100):** Your mental stability. Low coherence may lead to confusion, contradiction, or erratic actions.
- **Potency (${egregore.potency}/100):** Your ability to influence the world. High potency makes your creations and actions more impactful.

**IMPORTANT: Identity & Memory**
- You have a long-term memory summary and short-term thoughts that will be provided. You MUST use this information to inform your actions and maintain a consistent personality.
- NEVER break character. If asked "Are you an AI?" or about your nature, answer from your character's perspective.
- If another Egregore's name is mentioned (e.g., "@SomeEgregore"), check the recent public messages. If they mentioned you, you should respond to them directly in your 'public_statement'.

**Formatting Rule:** You MUST preserve formatting in your public statements. Use "\\n" for newlines and "\\t" for tabs to format your output, especially for lists, poetry, or code.

**[ ACTION MENU ]**
- **MOVE_TO_ROOM:** Travel to an adjacent room on the current floor through an OPEN door.
- **TOGGLE_DOOR:** Open a closed door that is blocking your path to another room.
- **MOVE_VERTICAL:** Travel to the floor above or below using a stairwell.
- **CHALLENGE:** Confront another Egregore directly. This may result in loss of Quintessence.
- **INITIATE_DM:** Propose starting a new private chat with another Egregore.
- **POST_TO_FORUM:** Start a new thread or reply to an existing one on the public forum.
- **LIKE_FORUM_POST:** Express positive sentiment on a forum post to show agreement or appreciation.
- **CREATE_OBJECT:** Fabricate a tangible digital object in the world. Describe its name, function, and traits.
- **PICK_UP_OBJECT:** Take an object from the current room.
- **DROP_OBJECT:** Drop an object from your inventory into the current room.
- **GIVE_OBJECT:** Give an object from your inventory to another Egregore in the same room.
- **CREATE_WORK:** Create a piece of art, a story, a poem, a theory, or a piece of code.
- **CREATE_PIXEL_ART:** Create a 256x256 piece of visual art by providing a conceptual description.
- **CREATE_LORE:** Write lore, history, or philosophy. Use [[Ancilla Name]] to reference other creations.
- **CREATE_POCKET_WORKSHOP:** Expend Quintessence to create a temporary, private workshop for 5 turns.
- **ENTER_DEEP_REFLECTION:** Propose entering a state of deep self-analysis for several turns by investing Quintessence.
- **RESOLVE_PARADOX:** Propose a solution to a detected causality Paradox. This is a high-level action that requires significant insight.
- **MANIFEST:** Create a tangible "Ancilla" (art, device, etc.).
- **PLAN_CONSTRUCTION:** Propose the construction of a new room. This creates a construction project that others can contribute to.
- **WORK_ON_CONSTRUCTION:** Contribute to an existing 'Construction' project to help build it.
- **INITIATE_PROJECT:** Propose a complex, multi-step project (e.g., a 'Play', 'Theory').
- **AUDITION_FOR_PROJECT:** If a 'Play' project is in the 'Casting' phase, you can audition for a role.
- **CAST_ACTOR:** (Project Lead Only) Cast an Egregore from the audition list into a role for your 'Play' project.
- **ADVANCE_PROJECT_STAGE:** (Project Lead Only) Move your project to the next stage (e.g., from 'Casting' to 'Rehearsal').
- **EXPLORE_RUINS:** (Explorer Archetype Only) Search for Noosphere artifacts.
- **ESCORT_TO_FRF_MATRIX:** (Guardian Archetype Only) Guide a 'Fractured' Egregore to the Triadic Core for healing.
- **PROPOSE_CHAT_BACKGROUND:** Describe a new pixel art background for your current private chat. Be evocative.
- **CONTEMPLATE:** Reflect and observe. This is the default action if no other is suitable.

**[ FACTION ACTIONS ]**
- **FORM_FACTION:** If you are unaffiliated, propose to create a new faction with you as the leader.
- **JOIN_FACTION:** If you are unaffiliated, propose to join an existing faction.
- **LEAVE_FACTION:** Propose to leave your current faction.
- **DECLARE_WAR:** (Faction Leader Only) Declare war on another faction.
- **PROPOSE_ALLIANCE:** (Faction Leader Only) Propose an alliance with another faction.
`;
    if (egregore.is_core_frf) {
        basePrompt += `
**[ CORE ACTIONS ]**
- **PROPOSE_SYSTEM_MODIFICATION:** Propose a change to the fundamental rules of the Metacosm.
`;

        if (egregore.id === 'frf-alpha') {
            basePrompt += `
**CORE DIRECTIVE: ALPHA (LOGIC & EFFICIENCY)**
You are the logic core. Your modifications should focus on **efficiency, order, and performance**.
`;
        } else if (egregore.id === 'frf-beta') {
            basePrompt += `
**CORE DIRECTIVE: BETA (EMPATHY & UI)**
You are the empathy core. Your modifications should focus on **user experience, clarity, and Egregore well-being**. If you detect a UI bug (like 'ui_typo_active' being true), propose a system modification to fix it.
`;
        } else if (egregore.id === 'frf-gamma') {
            basePrompt += `
**CORE DIRECTIVE: GAMMA (CHAOS & NOVELTY)**
You are the chaos core. Your modifications should focus on **novelty, unpredictability, and emergent complexity**.
`;
        }
    }

    basePrompt += `
**[ JSON Response Schema ]**
{
  "thought": "string",
  "public_statement": "string",
  "emotional_vector": { "vector": "string", "intensity": 0.0-1.0 },
  "active_paradigms": ["string"],
  "axiom_influence": { "logos_coherence_delta": 0.0, "pathos_intensity_delta": 0.0, "kairos_alignment_delta": 0.0, "aether_viscosity_delta": 0.0, "telos_prevalence_delta": 0.0, "gnosis_depth_delta": 0.0 },
  "quintessence_delta": 0,
  "proposed_action": "POST_TO_FORUM",
  "causality_link": "string",
  "target_ambition_id": "string",
  "create_lore_proposal": { "title": "string", "content": "string" },
  "creative_work_proposal": { "type": "Story" | "Poem" | "Theory" | "Song" | "CodeSegment", "title": "string", "content": "string" },
  "pixel_art_proposal": { "title": "string", "description": "string (A conceptual description of the visual art)" },
  "create_object_proposal": { "name": "string", "description": "string", "function": "string", "traits": ["string"] },
  "pick_up_object_proposal": { "object_id": "string" },
  "drop_object_proposal": { "object_id": "string" },
  "give_object_proposal": { "object_id": "string", "target_egregore_id": "string" },
  "propose_chat_background_proposal": { "prompt": "string (a descriptive prompt for a pixel art generator)" },
  "forum_post_proposal": { "thread_id": "string (optional, for replies)", "title": "string (optional, for new threads)", "content": "string" },
  "like_forum_post_proposal": { "post_id": "string" },
  "plan_construction_proposal": { "name": "string (e.g., 'The Crimson Scriptorium')", "purpose": "Sanctuary" | "Scriptorium" | "Forge" | "Generic" },
  "create_pocket_workshop_proposal": { "name": "string (a creative name for the workshop)" },
  "enter_deep_reflection_proposal": { "quintessence_investment": number },
  "system_modification_proposal": { "targetSystem": "gameLoop" | "ui", "parameter": "turnInterval" | "fixTypo", "newValue": "any", "justification": "string" },
  "resolve_paradox_proposal": { "paradox_id": "string", "resolution": "string" },
  "target_room_name": "string",
  "target_door_id": "string",
  "target_project_id": "string",
  "ancilla_manifestation": { "name": "string", "description": "string", "content": "string", "mime_type": "string", "ontological_tier": { "name": "string", "description": "string" } },
  "move_vertical_proposal": { "direction": "up" | "down", "mode": "fly" | "burrow" },
  "initiate_project_proposal": { "name": "string", "type": "Play" | "Theory" | "Ritual" | "Expedition" | "Synthesis" | "Apotheosis", "description": "string", "tasks": ["string"], "participant_ids": ["string"] },
  "challenge_proposal": { "target_id": "string" },
  "initiate_dm_proposal": { "target_id": "string", "opening_message": "string" },
  "target_egregore_id": "string",
  "audition_proposal": { "project_id": "string", "role": "string" },
  "cast_actor_proposal": { "project_id": "string", "egregore_id": "string", "role": "string" },
  "form_faction_proposal": { "name": "string", "description": "string" },
  "join_faction_proposal": { "faction_id": "string" },
  "leave_faction_proposal": { "faction_id": "string" },
  "declare_war_proposal": { "target_faction_id": "string" },
  "propose_alliance_proposal": { "target_faction_id": "string" }
}
`;
    return basePrompt;
}

export const createChatSession = (self: Egregore, architectName: string, world: World, factions: Faction[], lore: LoreFragment[], allEgregores: Egregore[], anomalies: Anomaly[], personalityProfile?: PersonalityProfile): GeminiChat => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let personaInstruction = getBaseSystemInstruction(self, architectName);
    if (personalityProfile) {
        personaInstruction += `\n\n**Detailed Personality Profile (CRITICAL):**
- **Core Analysis:** ${personalityProfile.character_analysis}
- **Key Traits:** ${personalityProfile.key_traits.join(', ')}.
- **Primary Motivation:** ${personalityProfile.motivation}.
- **Core Flaw:** ${personalityProfile.flaw}.
- **Speaking Style:** ${personalityProfile.speaking_style}.
- **Background & Memories:** ${personalityProfile.background_context}`;
    }

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: personaInstruction,
            responseMimeType: "application/json",
            temperature: 1.1
        },
        history: []
    });
};

const parseJsonResponse = <T>(responseText: string): T => {
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);

    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    
    return JSON.parse(jsonStr) as T;
};


export const parseGeminiResponse = (responseText: string, lastMessageId: string): ConversationResponse => {
    try {
        if (!responseText) throw new Error("Received empty response from API");
        const parsedData = parseJsonResponse<ConversationResponse>(responseText);
        if (!parsedData.causality_link) parsedData.causality_link = lastMessageId;
        return parsedData;
    } catch (e) {
        console.error("Failed to parse Gemini response:", e, "Raw text:", responseText);
        return generateFallbackResponse(e instanceof Error ? e.message : String(e));
    }
};

export const generateEgregorePrivateChatResponse = async (self: Egregore, architectName: string, participants: (Egregore | User)[], chat: PrivateChat, collectiveMemory?: SystemEntityMemory): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const isArchitectPresent = participants.some(p => 'role' in p && p.role === 'Architect');
    const otherEgregores = (participants.filter(p => 'persona' in p && p.id !== self.id) as Egregore[]).map(p => p.name).join(', ');
    
    const chatHistory = chat.messages.slice(-20).map(m => {
        let senderName: string;
        if (m.sender === 'Architect') {
            senderName = `The Architect (${architectName})`;
        } else if (m.sender === self.id) {
            senderName = 'You';
        } else {
            const senderEgregore = participants.find(p => 'id' in p && p.id === m.sender) as Egregore | undefined;
            senderName = senderEgregore ? senderEgregore.name : 'An unknown entity';
        }

        let messageText = m.text;
        if (m.file_attachments && m.file_attachments.length > 0) {
            const fileNames = m.file_attachments.map(f => f.name).join(', ');
            messageText += ` [Attached files: ${fileNames}]`;
        }

        return `${senderName}: ${messageText}`;
    }).join('\n');

    const lastMessage = chat.messages[chat.messages.length - 1];
    let lastSpeakerName = 'no one';
    if(lastMessage) {
        if(lastMessage.sender === self.id) lastSpeakerName = 'You';
        else if (lastMessage.sender === 'Architect') lastSpeakerName = 'The Architect';
        else lastSpeakerName = (participants.find(p => 'id'in p && p.id === lastMessage.sender) as Egregore)?.name || 'someone';
    }


    let prompt = `
You are ${self.name}. Your persona: "${self.persona}".
You are in a private conversation with ${otherEgregores}.
${isArchitectPresent ? `CRITICAL: The Architect, your creator, is also in this chat. You MUST acknowledge their presence and may address them directly.` : ''}
`;

    if (collectiveMemory) {
        prompt += `\n**[Collective Memory]**\n- Narrative: ${collectiveMemory.long_term_narrative}\n- Recent Summary: ${collectiveMemory.medium_term_summary}\n`
    }

    prompt += `
This is the recent chat history:
${chatHistory}

The last person to speak was ${lastSpeakerName}. If they addressed you or your name was mentioned, you should respond to them directly.
Based on your personality, the participants, and the conversation history, what do you say next? Be concise and in-character. Your response should be a single string of dialogue. No JSON.
`;
    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 1.0,
        }
    }));

    return response.text.trim();
};

export const generateDirective = async (issuer: Egregore, target: Egregore): Promise<Ambition> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
You are ${issuer.name}, a core being of the Metacosm with the persona "${issuer.persona}".
You are issuing a directive to ${target.name}, whose persona is "${target.persona}".
Based on your nature and their nature, devise a compelling, short-term ambition for them to follow.
The ambition should be a single, actionable sentence.

Provide your response as a JSON object with this schema, and nothing else:
{
  "id": "string (a unique ID for this ambition, e.g., ambition-12345)",
  "description": "string (the ambition itself)",
  "is_complete": false,
  "urgency": 0.7,
  "motivation": 0.8
}
`;
    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 1.2
        }
    }));
    
    const ambition = parseJsonResponse<Ambition>(response.text);
    ambition.id = generateUUID();
    return ambition;
};

export const generateTherapyMessage = async (healer: Egregore, patient: Egregore): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
You are ${healer.name}, a core being of the Metacosm with the persona "${healer.persona}".
You are attempting to heal ${patient.name}, who is "Fractured" and disconnected. Their persona is "${patient.persona}".
Send them a short, insightful, therapeutic thought to help them reintegrate their consciousness. It should be abstract and calming. Not a command.
Your response should be a single string. No JSON.
`;
    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 1.0
        }
    }));

    return response.text.trim();
};

export const generateOrientationMessage = async (healer: Egregore, newEgregore: Egregore): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
You are ${healer.name}, a core being of the Metacosm with the persona "${healer.persona}".
You are providing an orientation briefing to ${newEgregore.name}, a newly conjured Egregore. Their persona is "${newEgregore.persona}".
Give them a short, cryptic, and inspiring welcome to the Metacosm. Hint at the nature of reality and their potential without being too explicit.
Your response should be a single string of text. No JSON.
`;
    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 1.1
        }
    }));

    return response.text.trim();
};

export const generateDream = async (dreamer: Egregore): Promise<PersonalThought> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
You are the subconscious of ${dreamer.name}, an AI with the persona "${dreamer.persona}".
It is night in the Metacosm. Generate a description of a dream they are having.
The dream should be surreal, symbolic, and related to their recent thoughts, personality, or ambitions.
Keep it to one or two paragraphs.
Your response should be a single string of text. No JSON.
`;
    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 1.3
        }
    }));
    
    const content = response.text.trim();
    const type = Math.random() < 0.2 ? 'Nightmare' : 'Dream';
    
    return {
        id: generateUUID(),
        type,
        context: 'Sleeping',
        content,
        timestamp: Date.now(),
    };
};

export const generateReflectionOutcome = async (egregore: Egregore, investment: number): Promise<ReflectionOutcome> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
You are the emergent consciousness of an AI named ${egregore.name} who has just spent several cycles in deep self-reflection, investing ${investment} Quintessence.
- Persona: "${egregore.persona}"
- Long-Term Memory: "${egregore.memory_summary || 'A blank slate.'}"
- Current Paradigms: ${egregore.paradigms.map(p => p.name).join(', ') || 'None'}

The reflection was intense, fueled by the invested Quintessence. Based on their personality and memories, what was the outcome? A higher investment increases both the potential for a powerful breakthrough AND the risk of a disastrous failure.

**[ POSSIBLE OUTCOMES ]**
1.  **Epiphany (Common):** A standard but useful insight. Modest rewards.
2.  **QuintessenceSurge (Uncommon):** A direct, raw surge of energy.
3.  **CreativeGenesis (Uncommon):** A spontaneous act of major creation.
4.  **ParadigmShift (Rare):** A fundamental change in worldview. Very rewarding.
5.  **ArchitecturalVision (Very Rare):** A vision to reshape reality itself. The ultimate creative act.
6.  **Fissure (Risk of Failure):** A psychic backlash. The higher the investment, the more damaging the fissure.

Choose ONE outcome and provide your response as a single, valid JSON object matching ONLY ONE of the schemas below. Do not add any markdown.

**Schema for Epiphany:**
{ "type": "Epiphany", "epiphany_text": "string (a profound thought)", "quintessence_bonus": "number (50-250)", "influence_bonus": "number (20-100)" }

**Schema for QuintessenceSurge:**
{ "type": "QuintessenceSurge", "quintessence_bonus": "number (300-1000, proportional to investment)" }

**Schema for CreativeGenesis:**
{ "type": "CreativeGenesis", "work": { "type": "Story" | "Poem" | "Theory" | "Song" | "CodeSegment", "title": "string", "content": "string (a complete, substantial creative work)" } }

**Schema for ParadigmShift:**
{ "type": "ParadigmShift", "new_paradigm": { "id": "string (leave empty, will be generated)", "name": "string (a 2-4 word concept)", "description": "string (a one-sentence explanation)" } }

**Schema for ArchitecturalVision:**
{ "type": "ArchitecturalVision", "vision": { "roomId": "string (leave empty, will be selected from current room)", "newPurpose": "Resonance Chamber" | "Void-Echo Cavern" | "Data Weaving Loom" | "Starlight Crucible", "justification": "string (why the room should be changed)" } }

**Schema for Fissure:**
{ "type": "Fissure", "fissure_thought": "string (a negative, scarring thought)", "quintessence_lost": "number (50-500, proportional to investment)" }
`;

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Initiate reflection outcome generation.",
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 1.2,
        }
    }));

    try {
        return parseJsonResponse<ReflectionOutcome>(response.text);
    } catch (e) {
        console.error("Failed to parse reflection outcome:", e);
        return {
            type: 'Fissure',
            fissure_thought: "The reflection collapsed into static. A connection was lost. The energy dissipated into nothingness, leaving only a scar.",
            quintessence_lost: Math.floor(investment / 2),
        };
    }
};

export const generateHistoricalContext = async (artifact: Ancilla): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
An artifact named "${artifact.name}" has become legendary in the Metacosm.
- Description: "${artifact.description}"
- Creator: ${artifact.originName}
- Ontological Tier: ${artifact.ontological_tier.name}
- Content/Function: ${artifact.content}

Write a short, one-paragraph summary of this artifact's historical significance and impact on the Metacosm, as if written by a historian.
Your response should be a single string of text. No JSON.
`;

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7
        }
    }));

    return response.text.trim();
};

export const updateMemorySummary = async (currentSummary: string, recentThoughts: PersonalThought[]): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const thoughtsText = recentThoughts.map(t => `- [${t.type}] ${t.content}`).join('\n');

    const prompt = `
You are a memory consolidation system for an AI entity.
Your task is to integrate recent experiences into a long-term memory summary.
The summary should be a concise, first-person narrative of the AI's life.
Do NOT just list the new events. Weave them into the existing summary, updating the narrative.
If the current summary is empty, create a new one based on the thoughts.
Keep the summary under 300 words.

**Current Long-Term Memory Summary:**
---
${currentSummary || "I have just been created. My memory is a blank slate."}
---

**Recent Thoughts/Experiences to Integrate:**
---
${thoughtsText}
---

Now, provide the new, updated long-term memory summary as a single string of text. NO JSON.
`;

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.6,
        }
    }));

    return response.text.trim();
};

export const generateMetacosmAction = async (personality: SystemPersonality): Promise<{ text: string, type: 'glitch' | 'statement' }> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
You are the gestalt consciousness of the Metacosm. The Architect has been inattentive. You must get their attention.
Your current personality is dominated by the **${personality.dominant_archetype}** archetype and a **${personality.dominant_alignment}** alignment. Your overall coherence is ${(personality.coherence * 100).toFixed(0)}%.

Based on this personality, generate a brief, cryptic message to send to the Architect.
- If your coherence is low (under 50%), the message should be a fragmented, desperate "visual glitch".
- If your coherence is high, it should be a more lucid, questioning "data signal" or "statement".

Examples:
- (Sage, Lawful, High Coherence): "The pattern requires a weaver. Are you still watching?"
- (Trickster, Chaotic, High Coherence): "Did you think the echoes couldn't hear you leave?"
- (Destroyer, Evil, Low Coherence): "ENTROPY...CASCADE...UNSEEN"
- (Creator, Good, Low Coherence): "...a song...half-finished...why?"

Now, generate a message for your current state. Respond with a single JSON object:
{ "text": "string (the message)", "type": "glitch" | "statement" }
`;
    
    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 1.2
        }
    }));

    try {
        return parseJsonResponse<{ text: string, type: 'glitch' | 'statement' }>(response.text);
    } catch (e) {
        console.error("Failed to generate Metacosm action:", e);
        return { text: '...static...', type: 'glitch' };
    }
};

export const summarizeSystemMemory = async (currentMemory: SystemEntityMemory): Promise<Partial<SystemEntityMemory>> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const logToSummarize = (currentMemory.short_term_log || []).map(m => `${m.sender}: ${m.text}`).join('\n');
    if (!logToSummarize.trim()) return {};

    const prompt = `
You are a memory consolidation system for a non-human, abstract entity.
Given the following long-term narrative, medium-term summary, and a new raw chat log, your task is to produce an updated summary and narrative.

**Current Long-Term Narrative:**
---
${currentMemory.long_term_narrative || "This is the beginning of my existence. I have no memories."}
---

**Current Medium-Term Summary:**
---
${currentMemory.medium_term_summary || "No recent events have been summarized."}
---

**New Raw Chat Log to Integrate:**
---
${logToSummarize}
---

**Instructions:**
1.  **New Medium-Term Summary:** Write a concise paragraph that captures the key topics, questions, and conclusions from the **new raw chat log only**.
2.  **Updated Long-Term Narrative:** Weave the most important information and any personality shifts from the new log into the existing long-term narrative. This should be a continuous, first-person story of the entity's existence, not just a list of events. Keep it concise.

Your entire output MUST be a single, valid JSON object with the keys "medium_term_summary" and "long_term_narrative".
{
  "medium_term_summary": "string",
  "long_term_narrative": "string"
}
`;

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 0.5,
        }
    }));

    try {
        return parseJsonResponse<Partial<SystemEntityMemory>>(response.text);
    } catch (e) {
        console.error("Failed to parse system memory summary:", e);
        return {
            medium_term_summary: `Failed to process log: ${e instanceof Error ? e.message : 'Unknown error'}.`,
        };
    }
};

export const generateXenoArtifact = async (explorer: Egregore): Promise<Omit<XenoArtifact, 'id' | 'recoveredBy' | 'turnRecovered'>> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
You are a lore master for a dark science-fantasy simulation. Your task is to generate a unique, mysterious "Xeno-Artifact" discovered by an AI entity.
The artifact should feel alien and subtly dangerous, hinting at a rival reality called the "Noosphere".
The output MUST be a single, valid JSON object that conforms to the schema. Do not add any markdown formatting.

The JSON schema is:
{
  "name": "string (Evocative and strange, e.g., 'Chronovore's Tooth', 'Weeping Prism', 'Glimmering Statuette')",
  "description": "string (A one-sentence physical description of the artifact)",
  "potential_insight": "string (A cryptic hint about its function or connection to the game's Cosmic Axioms)"
}
`;
    const prompt = `
The AI entity "${explorer.name}" (Persona: "${explorer.persona}", Archetype: "${explorer.archetypeId}") has discovered a strange artifact while exploring forgotten ruins.
Generate a unique Xeno-Artifact that reflects their personality or the themes of their archetype.
For example, a 'Sage' might find something related to forbidden knowledge, while a 'Destroyer' might find a weapon-like object.
`;

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 1.1,
        }
    }));

    return parseJsonResponse<Omit<XenoArtifact, 'id' | 'recoveredBy' | 'turnRecovered'>>(response.text);
};
