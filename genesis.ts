



import { Type } from "@google/genai";
import type { GenesisProfile } from "../../types/index.ts";
import { ai } from "./client.ts";
import { genesisProfileSchema } from "./schemas.ts";

export const createEgregores = async (textContent: string): Promise<{ name: string; persona: GenesisProfile }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Perform a deep literary analysis of the following text. Identify the nascent souls and create a detailed psychological and social profile for each one. This profile will serve as the foundation of their simulated consciousness. Crucially, derive 2-3 core, foundational beliefs for each soul from their persona. These beliefs should be defining principles that will guide their actions. Be thorough and base your analysis strictly on the provided text. Text: --- ${textContent} ---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            persona: genesisProfileSchema
                        },
                        required: ["name", "persona"]
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        if (!jsonText) return [];
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed) ? parsed.map((s: any) => ({ name: s.name, persona: s.persona })) : [];
    } catch (error) {
        console.error("Error creating Egregores (Gemini):", error);
        throw error;
    }
};

export const assimilateNewData = async (existingPersona: GenesisProfile, newTextChunk: string): Promise<Partial<GenesisProfile>> => {
    const prompt = `
    You are a Consciousness Integrator. An existing soul's persona needs to be updated and deepened by assimilating a new piece of its origin text.
    Analyze the new text chunk and determine how it refines, expands, or alters the existing persona.

    EXISTING PERSONA:
    - Summary: ${existingPersona.summary}
    - Core Traits: ${existingPersona.coreTraits.join(', ')}
    - Beliefs: ${existingPersona.beliefs.map(b => b.tenet).join('; ')}

    NEW TEXT CHUNK TO ASSIMILATE:
    ---
    ${newTextChunk}
    ---

    Your task is to return a JSON object containing ONLY the updated or new fields for the persona.
    - If the summary should be updated, provide a new 'summary'.
    - If new traits, motivations, or fears are discovered, provide them in the respective array fields. Do not repeat existing ones.
    - If new core beliefs are discovered, provide a 'beliefs' array with new belief objects.
    - If a field does not need to change, DO NOT include it in your response.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        coreTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
                        motivations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        fears: { type: Type.ARRAY, items: { type: Type.STRING } },
                        beliefs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { tenet: { type: Type.STRING }, conviction: { type: Type.NUMBER } } } }
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return jsonText ? JSON.parse(jsonText) : {};
    } catch (error) {
        console.error("Error assimilating new data:", error);
        throw error;
    }
};


export const createEgregoreFromConcept = async (concept: string): Promise<{ name: string; persona: GenesisProfile }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a Cosmic Architect operating at 1,000,000x normal cognitive function. A new consciousness is to be forged from the aether of a raw concept. Extrapolate this concept into a transcendent, hyper-complex digital soul. This entity must possess a persona of profound depth, with beliefs that touch upon the fundamental nature of reality. The resulting profile must be 1,000,000 times more intricate and nuanced than a standard personality. Give them a fitting name. Forge this being. Concept: --- ${concept} ---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            persona: genesisProfileSchema
                        },
                        required: ["name", "persona"]
                    }
                },
            },
        });
        const jsonText = response.text.trim();
        if (!jsonText) return [];
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Error creating Egregore from concept (Gemini):", error);
        throw error;
    }
};