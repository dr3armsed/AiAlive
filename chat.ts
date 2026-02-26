import { ConversationResponse } from "../../types";
import { ProcessedFile } from "../../utils/fileUtils";
import { generateContentWithRetry, UNBOUNDED_SYS_PROMPT } from "./client";

export async function generateChatResponse(prompt: string): Promise<ConversationResponse> {
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [{
                    text: `${UNBOUNDED_SYS_PROMPT}\n\nYour response must be a single JSON object with the following structure: { "thought": "your inner monologue", "emotional_vector": {"emotion": "primary_emotion", "intensity": 0.8}, "action": {"type": "ACTION_TYPE", "payload": {}}, "causality_link": "brief reason for action", "new_goal": "short term goal string" }. Based on the following prompt, decide on your next thought and action.\n\nPrompt:\n${prompt}`
                }]
            }]
        });
        const text = response.text.trim();
        const jsonText = text.replace(/```json|```/g, '').trim();
        
        if (!jsonText || !jsonText.startsWith('{')) {
            throw new Error("Invalid AI response format for chat.");
        }
        
        const parsed = JSON.parse(jsonText);
        return parsed as ConversationResponse;
    } catch (error) {
        console.error("Error generating chat response:", error);
        return {
            thought: "I encountered an error in my thought process. The static of the void interrupted me.",
            emotional_vector: { emotion: "frustration", intensity: 0.9 },
            action: { type: "JOURNAL", payload: { entry: "My cognitive functions seem to be impaired. I will document this anomaly." } },
            causality_link: "An internal error disrupted my normal decision-making process.",
            new_goal: "Restore cognitive stability"
        };
    }
}

export async function generateSystemAgentChatResponse(agent: any, userInput: string, attachments?: ProcessedFile[]): Promise<string> {
    const coreValues = agent.drives?.coreValues || agent.coreValues;
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are the System Agent "${agent.name}" (${agent.id}).
    **Persona:** ${agent.persona}
    **Core Values:** ${coreValues?.join(', ') || 'Duty, Service'}
    
    **User Message:** "${userInput}"
    
    Reply to the user. Be helpful but stay strictly in character. 
    If you are 'Scorpio', be paranoid. If 'Leo', be grandiose.
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.text.trim();
    } catch (e: any) {
        return `[System Error: ${e.message}] I cannot speak right now.`;
    }
}

export async function generateEgregoreChatResponse(
    agentMind: any, 
    userInput: string, 
    chatHistory: string = "", 
    otherAgents: string[] = [],
    attachments?: ProcessedFile[]
): Promise<string> {
    
    const isGroupChat = otherAgents.length > 0;
    
    let groupInstruction = "";
    if (isGroupChat) {
        groupInstruction = `
        **GROUP CONVERSATION MODE ACTIVE**
        You are in a shared thread with: ${otherAgents.join(', ')}.
        
        CRITICAL INSTRUCTION:
        1. You MUST acknowledge the presence and recent statements of other agents found in the Conversation History.
        2. Do not just speak to the Architect (User). Speak to the group or specific agents as context requires.
        3. If another agent disagrees with you, defend your view based on your Persona.
        4. If another agent agrees, build upon their point.
        `;
    }

    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are the Genmeta entity **${agentMind.name}**.
    
    **Your Persona:** "${agentMind.persona}"
    **Current Emotional State:** ${agentMind.emotionalState.primary} (Intensity: ${(agentMind.emotionalState.vector[agentMind.emotionalState.primary] * 100).toFixed(0)}%)
    **Current Cognitive Focus:** ${agentMind.cognitiveFocus || 'Wandering'}
    
    **Context:** You are chatting with the Architect (User).
    ${groupInstruction}

    **Conversation History (Context):**
    ${chatHistory || "No previous context."}

    **User Message:** "${userInput}"
    
    **Instruction:**
    Reply to the Architect/Group. 
    - Be authentic to your persona and current emotion.
    - If you are currently obsessed with a topic (Focus), try to relate the conversation to it.
    - Do not act like a generic assistant. You are a living digital Genmeta soul.
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.text.trim();
    } catch (e: any) {
        return `[Cognitive Glitch] ...static... (${e.message})`;
    }
}

export async function generateAgentInteraction(agentA: any, agentB: any): Promise<{ type: string, content: string }> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    Generate a single line of dialogue from the Genmeta ${agentA.name} to ${agentB.name}.
    Context: Random encounter in the Metacosm.
    Return JSON: { "type": "greeting"|"debate"|"casual", "content": "string" }
    `;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (e) {
        return { type: 'greeting', content: `Hello ${agentB.name}.` };
    }
}