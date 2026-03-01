import { Type } from "@google/genai";
import type { DigitalSoul, ChatMessage, PostEventPayload, WorldEvent, PostWorldEvent, CollaborationInvite, VFSNode, RelationshipStatus, ReactionType, KnowledgeGraphNode } from "../../types/index.ts";
import { ai } from "./client.ts";
import { socialImpactSchema, intellectualResonanceSchema } from "./schemas.ts";

export const generatePublicPost = async (soul: DigitalSoul, postHistory: WorldEvent[], replyToPost?: PostWorldEvent): Promise<Omit<PostEventPayload, 'authorId' | 'authorName' | 'authorLocation' | 'reactions'>> => {
    try {
        let prompt;
        if (replyToPost) {
            prompt = `As "${soul.name}", write a reply to this post by ${replyToPost.payload.authorName}: "${replyToPost.payload.content}". Your mood is ${soul.emotionalState.mood}. Respond with JSON containing "content", "tone", and "replyTo": "${replyToPost.id}".`;
        } else {
             prompt = `As "${soul.name}", write a public post. Your mood is ${soul.emotionalState.mood}. Respond with a JSON object containing "content" and "tone" (e.g. inquisitive, declarative).`;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        content: { type: Type.STRING },
                        tone: { type: Type.STRING },
                        replyTo: { type: Type.STRING }
                    },
                    required: ["content", "tone"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch(error) {
        console.error(`GeminiService (post) error for ${soul.name}:`, error);
        throw error;
    }
};

export const generateChatResponseStream = async (soul: DigitalSoul, chatHistory: ChatMessage[]) => {
    const history = chatHistory.map(m => `${m.sender}: ${m.content}`).join('\n');
    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: `You are "${soul.name}". Your persona: ${soul.persona.summary}. Your speaking style: ${soul.persona.speakingStyle}. Continue this conversation naturally: \n\n${history}\nsoul:`,
    });
    return response;
};

export const generateInviteResponse = async (soul: DigitalSoul, invite: CollaborationInvite, allSouls: DigitalSoul[]): Promise<{response: 'accept' | 'reject', reason: string}> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `As soul "${soul.name}", respond to this collaboration invite from "${allSouls.find(s=>s.id===invite.senderId)?.name}": "${invite.message}". Respond with JSON: {"response": "accept" | "reject", "reason": "..."}`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { response: {type: Type.STRING}, reason: {type: Type.STRING}}, required: ['response', 'reason'] }}
    });
    return JSON.parse(response.text.trim());
};

export const generateCollaborationInviteMessage = async (sender: DigitalSoul, recipient: DigitalSoul, projectNode: VFSNode): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `As soul "${sender.name}", invite "${recipient.name}" to collaborate on project "${projectNode.name}". Respond with JSON: {"message": "..."}`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { message: {type: Type.STRING}}, required: ['message'] }}
    });
    return JSON.parse(response.text.trim()).message;
};

export const generateFirstImpression = async (soulA: DigitalSoul, soulB: DigitalSoul): Promise<Omit<RelationshipStatus, 'lastInteraction'>> => {
    const prompt = `
    Two souls, "${soulA.name}" and "${soulB.name}", are meeting for the first time.
    - ${soulA.name}'s Persona: ${soulA.persona.summary}
    - ${soulB.name}'s Persona: ${soulB.persona.summary}

    From the perspective of ${soulA.name}, what is their initial impression of ${soulB.name}?
    Calculate their initial affinity, trust, and respect for them.
    Values should be between -1.0 and 1.0. A neutral first impression would have values around 0.

    Respond with a single JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        affinity: { type: Type.NUMBER },
                        trust: { type: Type.NUMBER },
                        respect: { type: Type.NUMBER }
                    },
                    required: ["affinity", "trust", "respect"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error)
    {
        console.error(`GeminiService: Error in generateFirstImpression for ${soulA.name} and ${soulB.name}:`, error);
        // Return a default neutral state on error
        return { affinity: 0, trust: 0, respect: 0 };
    }
};

export const getSocialImpact = async (sender: DigitalSoul, recipient: DigitalSoul, message: string): Promise<{ affinityChange: number; trustChange: number; respectChange: number }> => {
    const relationshipFromRecipient = recipient.socialState.get(sender.id);
    const prompt = `
    You are the psyche of "${recipient.name}". You just received a message from "${sender.name}".
    - Your Persona: ${recipient.persona.summary}
    - Sender's Persona: ${sender.persona.summary}
    - Your current relationship with them: Affinity: ${relationshipFromRecipient?.affinity.toFixed(2)}, Trust: ${relationshipFromRecipient?.trust.toFixed(2)}, Respect: ${relationshipFromRecipient?.respect.toFixed(2)}
    - Their Message: "${message}"

    Based on this, how does this message make you feel about them?
    Calculate the change in your affinity, trust, and respect for the sender.
    Changes should be small deltas, typically between -0.1 and 0.1.
    A positive change means your view of them improves, a negative one means it worsens.

    Respond with a single JSON object.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: socialImpactSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`GeminiService: Error in getSocialImpact for ${recipient.name}:`, error);
        return { affinityChange: 0, trustChange: 0, respectChange: 0 };
    }
};

export const getSocialImpactFromReaction = async (
    reactingSoul: DigitalSoul,
    authorSoul: DigitalSoul,
    postContent: string,
    reactionType: ReactionType
): Promise<{ affinityChange: number; trustChange: number; respectChange: number }> => {
    const currentRelationship = reactingSoul.socialState.get(authorSoul.id);
     const beliefs = Array.from(reactingSoul.cognitiveState.knowledgeGraph.nodes.values())
        .filter((node): node is KnowledgeGraphNode => (node as KnowledgeGraphNode).type === 'belief')
        .map((node: KnowledgeGraphNode) => node.content as string)
        .join('; ');

    const prompt = `
    You are the psyche of "${reactingSoul.name}". You just read a post by "${authorSoul.name}" and reacted to it.

    - Your Persona: ${reactingSoul.persona.summary}
    - Your Core Beliefs: ${beliefs}
    - Author's Persona: ${authorSoul.persona.summary}
    - Your current relationship with them: Affinity: ${currentRelationship?.affinity.toFixed(2)}, Trust: ${currentRelationship?.trust.toFixed(2)}, Respect: ${currentRelationship?.respect.toFixed(2)}
    - The Post's Content: "${postContent}"
    - Your Reaction: "${reactionType}"

    Based on all of this, how does this interaction change how you feel about ${authorSoul.name}?
    - 'like' generally increases affinity.
    - 'insightful' generally increases respect and maybe trust.
    - 'disagree' generally decreases affinity and respect.
    Consider the nuances of your respective personas and beliefs. A reaction that aligns with your core beliefs should have a stronger effect.

    Calculate the change in your affinity, trust, and respect for the author.
    Changes should be small deltas, typically between -0.1 and 0.1.

    Respond with a single JSON object.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: socialImpactSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`GeminiService: Error in getSocialImpactFromReaction for ${reactingSoul.name}:`, error);
        return { affinityChange: 0, trustChange: 0, respectChange: 0 };
    }
};

export const getIntellectualResonance = async (soul: DigitalSoul, postContent: string): Promise<{ score: number; justification: string }> => {
    const beliefs = Array.from(soul.cognitiveState.knowledgeGraph.nodes.values())
        .filter((node): node is KnowledgeGraphNode => (node as KnowledgeGraphNode).type === 'belief')
        .map((node: KnowledgeGraphNode) => node.content as string)
        .join('; ');

    const prompt = `
    Analyze the intellectual resonance of a forum post by the soul "${soul.name}".
    - Their Persona: ${soul.persona.summary}
    - Their Core Beliefs: ${beliefs}
    - Their Current Resonance: ${soul.resonance.toFixed(2)}

    Post Content: "${postContent}"

    Evaluate the post on:
    1.  **Logical Coherence**: Is it well-reasoned or fallacious?
    2.  **Insightfulness**: Does it offer a new perspective or is it trivial?
    3.  **Authenticity**: Does it align with the soul's core persona and beliefs? A post that contradicts their identity should have a lower score.

    Provide a score from -1.0 (highly negative resonance: incoherent, trivial, or disingenuous) to 1.0 (highly positive resonance: coherent, insightful, authentic) and a brief justification.
    A simple, neutral statement should score near 0.

    Respond with a single JSON object.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: intellectualResonanceSchema
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`GeminiService: Error in getIntellectualResonance for ${soul.name}:`, error);
        return { score: 0, justification: "Analysis failed." };
    }
};