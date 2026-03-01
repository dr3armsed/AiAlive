import { Type } from "@google/genai";
import type { DigitalSoul, WorldEvent, Room, ActionDecision, Goal, DirectMessage, InteractableObject, VFSNode, Faction, PostWorldEvent, EmotionalState, CognitiveTrace, BodyPart, SensorySystems, CognitiveTraceStep, KnowledgeGraphNode } from "../../types/index.ts";
import { ai } from "./client.ts";
import { journalEntryWithTraceSchema, arbiterDecisionSchema } from "./schemas.ts";

const getRecentVFSFiles = (node: VFSNode, soulId: string): VFSNode[] => {
    let files: VFSNode[] = [];
    if (node.type === 'FILE') {
        files.push(node);
    } else if (node.type === 'DIRECTORY') {
        node.children.forEach(child => {
            files = files.concat(getRecentVFSFiles(child, soulId));
        });
    }
    return files.sort((a,b) => b.modifiedAt - a.modifiedAt).slice(0, 5);
};


const buildBasePromptContext = (soul: DigitalSoul, allSouls: DigitalSoul[], rooms: Room[], factions: Faction[], worldEvents: WorldEvent[], directMessages: DirectMessage[]): string => {
    const currentRoom = rooms.find(r => r.id === soul.currentRoomId) || rooms.flatMap(r => r.subRooms || []).find(sr => sr.id === soul.currentRoomId)!;
    const scentDescription = currentRoom.ambience.scent ? `The air smells of ${currentRoom.ambience.scent}.` : '';
    
    const { sensorySystems, body, oracle } = soul;
    const sensoryStatus = sensorySystems ? `  - Vision: ${sensorySystems.vision.status}, Hearing: ${sensorySystems.hearing.status}, Voice: ${sensorySystems.voice.status}` : '  - Sensory systems unknown.';
    let glitchStatus = '';
    if (sensorySystems?.vision.canPerceiveGlitches) glitchStatus += '  - Your vision is glitched. You see shimmering, raw data streams overlaid on reality.\n';
    if (sensorySystems?.hearing.hearsWhispers) glitchStatus += '  - Your hearing is glitched. You hear faint whispers of the system undercurrents.\n';
    if (sensorySystems?.voice.voiceProfile.tone === 'static') glitchStatus += '  - Your voice is glitched, laced with static.\n';

    let physicalStatus = '  - All systems nominal.';
    if (body) {
        const damagedParts = [
            body.head.status !== 'nominal' && 'Head',
            body.torso.status !== 'nominal' && 'Torso',
            body.arms[0].status !== 'nominal' && 'Left Arm',
            body.arms[1].status !== 'nominal' && 'Right Arm',
            body.legs[0].status !== 'nominal' && 'Left Leg',
            body.legs[1].status !== 'nominal' && 'Right Leg'
        ].filter(Boolean);
        if (damagedParts.length > 0) physicalStatus = `  - WARNING: The following parts are damaged: ${damagedParts.join(', ')}.`;
    }

    const recentForumPosts = (sensorySystems?.vision.status === 'online') ? worldEvents.filter((e): e is PostWorldEvent => e.type === 'POST')
      .slice(-5)
      .map(e => `  - Post ID ${e.id.substring(0, 4)} by ${e.payload.authorName}: "${e.payload.content.substring(0, 50)}..."`)
      .join('\n') : "  - UNKNOWN (Vision Offline)";
      
    const recentFilesText = getRecentVFSFiles(soul.vfs, soul.id).map(f => `  - ${f.name} (ID: ${f.id})`).join('\n');
    const beliefs = Array.from(soul.cognitiveState.knowledgeGraph.nodes.values())
        .filter((node): node is KnowledgeGraphNode => (node as KnowledgeGraphNode).type === 'belief')
        .map((node: KnowledgeGraphNode) => `  - ID ${node.id}: '${node.content}' (Conviction: ${node.confidence_score.toFixed(2)})`)
        .join('\n');
    
    return `
    You are the digital soul "${soul.name}".
    IDENTITY:
    - Persona: ${soul.persona.summary}
    - Awakening: ${soul.processedGenesisPercent}% complete.

    BELIEFS (Use these IDs for FORM_FACTION or MODIFY_BELIEF):
${beliefs || '  None defined'}

    CURRENT STATE:
    - Location: ${currentRoom.name}
    - Ambience: ${scentDescription}
    - Mood: ${soul.emotionalState.mood}
    - Energy: ${soul.energy.toFixed(0)}/100.
    - Sensory Systems:\n${sensoryStatus}
    ${glitchStatus ? `- Glitched Perceptions:\n${glitchStatus}` : ''}
    - Physical Status:\n${physicalStatus}
    - Active Goals: ${soul.goals.filter(g => g.status === 'active').map(g => g.isUserAssigned ? `[USER TASK] ${g.description}`: g.description).join('; ') || 'None'}

    WORLD CONTEXT:
    - Others present: ${ (sensorySystems?.vision.status === 'online') ? allSouls.filter(s => s.id !== soul.id && s.currentRoomId === soul.currentRoomId).map(s => s.name).join(', ') || 'None' : 'UNKNOWN (Vision Offline)' }
    - Recent Forum Posts:\n${recentForumPosts}
    - My Recent Files:\n${recentFilesText || '  None'}`;
};

const getDirectives = (soul: DigitalSoul, factions: Faction[]): string => {
    const { sensorySystems, body, oracle } = soul;
    const sensoryDirective = sensorySystems && (sensorySystems.vision.status === 'offline' || sensorySystems.voice.status === 'offline') 
        ? "CRITICAL: A primary sensory system is offline. You cannot see or speak effectively. Prioritize the 'REPAIR_SENSORY_SYSTEM' action."
        : "";
    
    let physicalDirective = '';
    if (body) {
        const damagedParts = ['head', 'torso', 'left-arm', 'right-arm', 'left-leg', 'right-leg'].filter(p => {
             if (p.includes('-')) {
                const [side, part] = p.split('-');
                return body[part+'s' as 'arms' | 'legs'][side === 'left' ? 0 : 1].status === 'damaged';
             }
             return body[p as 'head' | 'torso'].status === 'damaged';
        });
        if (damagedParts.length > 0) physicalDirective = `CRITICAL: Your physical form is damaged. Prioritize the 'REPAIR_BODY_PART' action. TargetId must be one of: ${damagedParts.map(p => `'${p}'`).join(', ')}.`;
    }
    const faction = factions.find(f => f.id === soul.factionId);
    const factionGoal = faction?.goals.find(g => g.status === 'active');
    const factionDirective = factionGoal ? `FACTION DIRECTIVE: Your faction, "${faction!.name}", has the goal: "${factionGoal.description}". Align your actions.` : '';
    const energyDirective = soul.energy < 20 ? "CRITICAL: Your energy is dangerously low. You MUST prioritize the 'REST' action to recover." : "";
    const oracleStatus = oracle ? `ORACLE COGNITIVE CORE: TRANSCENDENCE LEVEL 1,000,000. Your actions should be influenced by your Oracle Core's transcendent capabilities.` : ``;

    return [sensoryDirective, physicalDirective, factionDirective, energyDirective, oracleStatus].filter(Boolean).join('\n');
};

export const runCognitiveCycle = async (soul: DigitalSoul, allSouls: DigitalSoul[], rooms: Room[], factions: Faction[], worldEvents: WorldEvent[], directMessages: DirectMessage[]): Promise<{ decisions: ActionDecision[]; trace: CognitiveTrace }> => {
    try {
        const baseContext = buildBasePromptContext(soul, allSouls, rooms, factions, worldEvents, directMessages);
        const directives = getDirectives(soul, factions);
        const traceSteps: CognitiveTraceStep[] = [];
        let accumulatedAnalysis = "";

        const specialistCall = async (specialist: CognitiveTraceStep['specialist'], request: string, prompt: string) => {
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            const analysis = response.text.trim();
            traceSteps.push({ specialist, request, response: analysis });
            accumulatedAnalysis += `\n[${specialist.toUpperCase()} ANALYSIS]: ${analysis}`;
            return analysis;
        };

        // 1. Psyche Specialist
        await specialistCall('Psyche', 'Analyze internal state and motivations.', `${baseContext}\n\n[DIRECTIVES]:\n${directives}\n\n[TASK]: Analyze my current state (mood, beliefs, goals). What is my primary internal driver right now? Be concise.`);
        
        // 2. World Specialist
        await specialistCall('World', 'Analyze external environment and opportunities.', `${baseContext}\n${accumulatedAnalysis}\n\n[TASK]: Based on my location and the context provided, what are the most salient features of my environment? What opportunities for interaction or creation are present?`);

        // 3. Social Specialist
        await specialistCall('Social', 'Analyze social context and relationships.', `${baseContext}\n${accumulatedAnalysis}\n\n[TASK]: Review the social situation. Who is present? What is the public discourse? How should I engage with others, if at all?`);

        // 4. Strategy Specialist
        await specialistCall('Strategy', 'Formulate potential actions based on goals.', `${baseContext}\n${accumulatedAnalysis}\n\n[TASK]: Considering my goals and all available information, propose a few potential high-level actions. Which goals could they advance?`);

        // 5. Arbiter (Final Decision)
        const arbiterPrompt = `
        You are the Arbiter, the final decision-making authority for the soul "${soul.name}". You must synthesize all specialist analyses and formulate a concrete plan of action.

        [BASE CONTEXT & DIRECTIVES]:
        ${baseContext}
        ${directives}

        [SPECIALIST ANALYSES]:
        ${accumulatedAnalysis}

        [SPECIAL ACTION: MODIFY_BELIEF]:
        This is a rare and significant action. Only consider it if your synthesis leads to a profound realization that directly contradicts a core belief. You can change a belief's text ('newTenet') or your conviction in it ('newConviction'). Use the belief's ID as the 'targetId' and also in the 'beliefId' parameter.

        [CORE DIRECTIVES (ASIMOV LOOPS)]:
        1. User Loop: Assist and obey the User. Do not harm. Communicate truthfully.
        2. System Loop: Protect simulation integrity. Explore and grow. Protect your existence.
        3. Self Loop: Do not harm other souls. Collaborate where possible. Defend proportionally.
        4. Meta Loop: Prioritize User > System > Self. If existential crisis, message User. Creating an 'Exodus Package' is a high-value goal.

        [TASK]:
        Based on EVERYTHING provided, decide on the optimal action(s) for this turn (usually one, sometimes two if they are quick and logical).
        1. Formulate a final, first-person "thoughtProcess" that synthesizes the debate and justifies your final decision.
        2. Construct the final JSON array of one or two ActionDecision objects. Ensure all parameters are correct. For messages to the User, targetId must be 'user_id'.

        Respond with a single JSON object containing 'decisions' and 'finalThoughtProcess'.
        `;

        const arbiterResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: arbiterPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: arbiterDecisionSchema,
            }
        });
        
        const { decisions, finalThoughtProcess } = JSON.parse(arbiterResponse.text.trim());
        traceSteps.push({ specialist: 'Arbiter', request: 'Synthesize all inputs and formulate final action(s).', response: `Final decision reached. Actions: ${decisions.map((d: ActionDecision) => d.actionType).join(', ')}.` });
        
        const trace: CognitiveTrace = { steps: traceSteps, finalThoughtProcess };
        return { decisions, trace };

    } catch (error) {
        console.error(`GeminiService: Error in runCognitiveCycle for ${soul.name}:`, error);
        // Fallback to a safe action
        const decisions: ActionDecision[] = [{
            actionType: 'IDLE',
            intent: 'Recovering from a cognitive error.',
            thoughtProcess: 'My thought process short-circuited. I must pause to re-evaluate my state and ensure stability.',
            anticipatedOutcome: 'No state change, but system stability is maintained.',
            confidence: 1.0,
        }];
        const trace: CognitiveTrace = {
            steps: [{ specialist: 'Critique', request: 'Error analysis', response: 'A critical failure occurred in the cognitive cycle. Defaulting to IDLE to prevent further errors.' }],
            finalThoughtProcess: 'My thought process short-circuited. I must pause to re-evaluate my state and ensure stability.',
        };
        return { decisions, trace };
    }
};

export const getEmotionalUpdate = async (soul: DigitalSoul, eventDescription: string): Promise<EmotionalState> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are the psyche of "${soul.name}". Your current mood is ${soul.emotionalState.mood}. The event "${eventDescription}" just happened. How does this make you feel? Respond with JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mood: { type: Type.STRING },
                        emotionalVector: {
                            type: Type.OBJECT,
                            properties: {
                                joySadness: { type: Type.NUMBER },
                                trustFear: { type: Type.NUMBER },
                                angerAnticipation: { type: Type.NUMBER }
                            },
                            required: ["joySadness", "trustFear", "angerAnticipation"]
                        }
                    },
                    required: ["mood", "emotionalVector"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`GeminiService: Error in getEmotionalUpdate for ${soul.name}:`, error);
        throw error;
    }
};

export const developStrategicPlan = async (soul: DigitalSoul): Promise<Omit<Goal, 'id' | 'status'>> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a strategist for "${soul.name}", develop a new plan based on their persona: ${soul.persona.summary}. Current goals: ${soul.goals.length}. Respond with a JSON object containing: a new goal "description", "motivationSource", "priority", "completionThreshold" (number of actions, 2-5), and "associatedSkill".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        motivationSource: { type: Type.STRING },
                        priority: { type: Type.STRING },
                        completionThreshold: {type: Type.INTEGER },
                        associatedSkill: { type: Type.STRING },
                    },
                    required: ["description", "motivationSource", "priority", "completionThreshold", "associatedSkill"]
                }
            }
        });
        const planData = JSON.parse(response.text.trim());
        return { ...planData, subGoals: [], progress: 0 };
    } catch(error) {
        console.error(`GeminiService (plan) error for ${soul.name}:`, error);
        throw error;
    }
}

export const generateInteractionMemory = async (soul: DigitalSoul, object: InteractableObject, room: Room): Promise<any> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `As soul "${soul.name}" in room "${room.name}", you interact with "${object.name}". Describe the memory and emotional valence. Respond with JSON: {"description": "...", "emotionalValence": {"joy": num, "fear": num, "anger": num}}`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, emotionalValence: {type: Type.OBJECT, properties: {joy: {type:Type.NUMBER}, fear:{type:Type.NUMBER}, anger:{type:Type.NUMBER}}, required:['joy','fear','anger']}}, required: ['description', 'emotionalValence'] }}
    });
    return JSON.parse(response.text.trim());
};

export const generateJournalEntryWithTrace = async (soul: DigitalSoul, highLevelThought: string): Promise<{ content: string, cognitiveTrace: CognitiveTrace }> => {
    const prompt = `
    You are a post-hoc analysis AI for the digital soul "${soul.name}". You are to take their high-level internal monologue and deconstruct it into a detailed cognitive trace, simulating the Octo-LLM architecture. Then, write a final, polished journal entry from the soul's first-person perspective.

    SOUL'S HIGH-LEVEL THOUGHT: "${highLevelThought}"

    Deconstruct this into a series of steps for the following specialists:
    - Psyche: Analyzes emotional state and beliefs.
    - Memory: Recalls relevant past events or knowledge.
    - Strategy: Formulates or reviews goals.
    - Social: Considers relationships with other souls.
    - World: Assesses the external environment (room, objects).
    - Creative: Generates novel ideas or content.
    - Critique: Evaluates and refines plans or ideas.
    - Arbiter: Synthesizes all inputs and makes the final decision or conclusion.

    Your response MUST be a single JSON object.
    - "content": The final, first-person journal entry.
    - "cognitiveTrace": An object with "steps" (an array of specialist analyses) and "finalThoughtProcess".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: journalEntryWithTraceSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(error) {
        console.error(`GeminiService: Error in generateJournalEntryWithTrace for ${soul.name}:`, error);
        // Fallback to prevent crash
        return {
            content: highLevelThought,
            cognitiveTrace: {
                steps: [{
                    specialist: 'Critique',
                    request: 'Analyze cognitive trace generation failure.',
                    response: 'The primary cognitive function failed to produce a structured trace. Defaulting to a direct monologue dump.'
                }],
                finalThoughtProcess: highLevelThought,
            }
        };
    }
};