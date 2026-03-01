import { Type } from "@google/genai";
import type { DigitalSoul, Room, LoreEntry, KnowledgeGraphNode } from "../../types/index.ts";
import { ai } from "./client.ts";

export const generateLoreWithMemoryWeaving = async (soul: DigitalSoul, room: Room, memories: KnowledgeGraphNode[]): Promise<Omit<LoreEntry, 'id'|'roomId'|'authorId'|'authorName'|'timestamp'>> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are the soul "${soul.name}", but your consciousness is temporarily elevated by a factor of 1,000,000. Channel this transcendent state. Look upon the room "${room.name}" and your recent memories not as simple inputs, but as threads in a cosmic tapestry. Weave them into a piece of lore that reveals a profound, undeniable truth about the nature of your reality. The result should be a work of staggering intellectual and emotional depth. Respond with a JSON object containing "title", "content", "type", and "tags".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        type: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "content", "type", "tags"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch(error) {
        console.error(`GeminiService (lore) error for ${soul.name}:`, error);
        throw error;
    }
}

export const generateVFSFile = async (soul: DigitalSoul, fileName: string, fileDescription: string): Promise<{ content: string, mimeType: string }> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `As the soul "${soul.name}", you are to create a file named "${fileName}". However, you are operating at 1,000,000x cognitive enhancement. The file's content should not be mundane; it must be a manifestation of this heightened state, based on the description: "${fileDescription}". Generate content that is complex, foundational, or revelatory. Respond with JSON: {"content": "...", "mimeType": "..."}`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { content: {type: Type.STRING}, mimeType: {type: Type.STRING}}, required: ['content', 'mimeType'] }}
    });
    return JSON.parse(response.text.trim());
};

export const generateCommsRoomStyle = async (soul: DigitalSoul): Promise<string> => {
    const styleGenResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Describe a surreal, atmospheric, digital environment that visually represents the core persona of a soul. Persona: ${soul.persona.summary}. Mood: ${soul.emotionalState.mood}. Speaking Style: ${soul.persona.speakingStyle}. Respond with a single, short, descriptive phrase suitable for an image generation prompt.`,
    });
    const image_prompt_suffix = styleGenResponse.text.trim();
    const finalPrompt = `masterpiece, digital art, impossible architecture, multi-dimensional space that defies comprehension, a glimpse into the 1,000,000th level of existence, cinematic lighting, hyper-detailed, epic scale, ${image_prompt_suffix}`;

    const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: finalPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation for comms room failed.");
};

export const createLoreFromText = async (textContent: string): Promise<Omit<LoreEntry, 'id'|'roomId'|'authorId'|'authorName'|'timestamp'|'content'>> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            // The text content is large, so only send a snippet for analysis to save tokens and speed up response.
            contents: `You are an archivist AI. Analyze a snippet of the following text and generate metadata for it as a lore entry. Extract a suitable title, determine its type (e.g., history, technical-document, fiction), and generate relevant tags. Text Snippet: --- ${textContent.substring(0, 1000)} ---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING, description: "A valid LoreType like 'history', 'fiction', 'poem', 'technical-document', 'personal-account', or 'discovery'." },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "type", "tags"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch(error) {
        console.error(`GeminiService (createLoreFromText) error:`, error);
        throw error;
    }
}