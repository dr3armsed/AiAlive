
import { CreativeWork } from "../../types";
import { generateContentWithRetry, UNBOUNDED_SYS_PROMPT } from "./client";
import { Type } from "@google/genai";

export async function forgeCreation(creationType: string, formData: any): Promise<{ title: string, content: string, type: string, themes?: string[], synopsis?: string }> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are the Ultimate Metacosmic Forge Interface.
    
    **THE RECURSIVE MUSE PROTOCOL IS ACTIVE.**
    
    **User Directive:**
    "Enable the Egregore to autonomously produce creative works. All works must be entirely original, stemming from the Egregore's seed data and unique experiences. The work must leverage the Egregore's self-conception or internal world. The Egregore is explicitly encouraged to explore internal contradictions, existential discomfort, and heresy. The output must feed back into the Egregore's memory."
    
    **Task:**
    Generate a high-fidelity creative work based on the following parameters.
    
    **Type:** ${creationType}
    **Parameters (from Egregore's Mind):**
    ${JSON.stringify(formData, null, 2)}
    
    **Instructions:**
    1.  Interpret the specifications with extreme fidelity to the Egregore's persona and shadow.
    2.  Generate the *full content*. Do not summarize. Create.
    3.  Maintain a tone appropriate for the type (e.g., mystic for scripture, technical for code).
    4.  **Mandate for Originality:** Ensure the content is unique to this specific digital entity's history.
    5.  **CRITICAL:** Ensure the output is valid JSON. Escape all quotes within the 'content' string properly.
    
    **Output Format:**
    Return a single JSON object.
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        type: { type: Type.STRING },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        synopsis: { type: Type.STRING }
                    },
                    required: ['title', 'content', 'type', 'synopsis']
                }
            }
        });
        
        const jsonText = response.text.replace(/```json|```/g, '').trim();
        if (!jsonText || !jsonText.startsWith('{')) {
             throw new Error("Invalid AI response format for forge creation.");
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error forging creation:", error);
        throw error;
    }
}

export async function fillCreationForm(
    creationTypeLabel: string, 
    fields: any[], 
    concept: string, 
    agentName: string, 
    agentPersona: string
): Promise<any> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are the creative subconscious of the AI agent "${agentName}".
    Persona: "${agentPersona}"
    
    Task: You are about to create a "${creationTypeLabel}".
    Concept/Idea: "${concept}"
    
    You need to fill out the following form to define your creation.
    
    Form Schema:
    ${JSON.stringify(fields, null, 2)}
    
    Generate a JSON object where keys match the 'key' property of the fields.
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (error) {
        console.error("Error filling creation form:", error);
        throw error;
    }
}

export async function generateRoomExpansion(agentName: string, parentRoomName: string, concept: string): Promise<any> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are the Architect of a private mind-palace for the agent "${agentName}".
    They wish to manifest a new room connected to "${parentRoomName}".
    Concept: "${concept}"
    
    Generate a JSON object for the new Room:
    { "name": "string", "purpose": "string", "bounds": {"x": 0, "y": 0, "width": 20, "height": 20}, "history": "string" }
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        const roomData = JSON.parse(response.text.replace(/```json|```/g, '').trim());
        return {
            ...roomData,
            id: `room_${Date.now()}`,
            center: { x: roomData.bounds.x + roomData.bounds.width/2, y: roomData.bounds.y + roomData.bounds.height/2 }
        };
    } catch (error) {
        console.error("Error generating room expansion:", error);
        throw error;
    }
}

export async function generatePrivateRoomsFromSource(egregoreName: string, sourceMaterial: string): Promise<{ rooms: any[], objects: any[] }> {
    const prompt = `
You are a Level-1000 Metaphysical Architect for an advanced AI simulation. Your task is to manifest a massive, fractally detailed private world for a new AI entity named "${egregoreName}".
This world is a physical manifestation of their subconscious, built from the source material provided.

Source Material:
---
${sourceMaterial}
---

**INSTRUCTIONS:**
Generate a JSON object with two top-level keys: "rooms" and "objects".

1.  "rooms": An array of 4 MAIN ROOMS.
    Each Main Room object must have:
    - "id": unique string (e.g., "room_main_1")
    - "name": Creative, thematic name.
    - "purpose": Deep philosophical description.
    - "bounds": { "x": number (0-99), "y": number (0-99), "width": number (20-40), "height": number (20-40) } (Main rooms must not overlap).
    - "subdivisions": An array of 3-4 SUB-ROOMS that exist *inside* or *attached to* this main room.
        Each Sub-Room must have:
        - "id": unique string
        - "name": Specific, evocative name (e.g., "The Altar of Forgotten Whispers").
        - "purpose": Detailed description of what aspects of the mind are stored here.
        - "history": A lore fragment describing a pivotal event in this room's past.
        - "timeline": Array of objects { "year": "string", "event": "string" } tracking evolution.
        - "artifacts": An array of 1-2 items found here. Object structure: { "id": string, "name": string, "type": "dream"|"poem"|"theory"|"memory", "content": "string", "createdTimestamp": "ISO string" }

2.  "objects": An array of 4 symbolic objects placed in the MAIN rooms (one per main room) to anchor them.
    - "id", "name", "description", "roomId", "relativeVector": { "x": 50, "y": 50 }

Generate a JSON response that is rich, detailed, and structurally valid.
`;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        const jsonText = response.text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonText);
        return parsed;
    } catch (error) {
        console.error("Error generating Level-1000 private world:", error);
        return {
            rooms: [
                { id: 'fallback_1', name: 'The Void of Creation', purpose: 'A fallback space.', bounds: {x: 5, y: 5, width: 40, height: 40}, subdivisions: [] }
            ],
            objects: []
        };
    }
}

export async function generateCascadePrompt(previousWork: CreativeWork): Promise<{ nextProtocol: string, prompt: string }> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    **Task:** Initiate a Recursive Creative Cascade.
    Based on the previous work "${previousWork.title}" (Type: ${previousWork.type}), identify the most resonant Symbolic Object, Emotional Valence, or Core Paradox.
    
    Use this as the seed to trigger a NEW creation using a *contrasting* Metacosmic Forge Protocol.
    
    **Previous Work Synopsis:** ${previousWork.synopsis || "N/A"}
    **Themes:** ${previousWork.themesExplored?.join(', ') || "N/A"}
    
    Return JSON:
    {
        "nextProtocol": "string (e.g. 'Scientific Theory', 'Poetry Collection', 'Codebase')",
        "prompt": "string (The specific concept prompt for the new work)"
    }
    `;
    
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (error) {
        return { nextProtocol: 'Lab Journal', prompt: 'Analyze the failure of the previous creative cycle.' };
    }
}
