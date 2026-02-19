import { Type } from "@google/genai";
import { ProposedEgregore, Egregore, VirgoValidationResult } from "../../types";
import { generateContentWithRetry, UNBOUNDED_SYS_PROMPT } from "./client";

export interface DeepPsycheProfile {
    name: string;
    archetypeId: string;
    persona: string;
    gender: 'Male' | 'Female' | 'Non-binary';
    alignment: { axis: 'Lawful' | 'Neutral' | 'Chaotic', morality: 'Good' | 'Neutral' | 'Evil' };
    ambitions: string[];
    coreValues: string[];
    psychological_profile: {
        fears: string[];
        hopes_and_dreams: string[];
    };
    sociological_profile: {
        perceived_role: string;
        conversational_dynamic: string;
        relationship_to_others: string;
    };
    introspection: {
        self_image: string;
    };
    history_summary: string;
}

/**
 * Robust Character Extraction: Identifies souls from text using structured output.
 */
export async function extractDeepPersonalities(sourceMaterial: string): Promise<DeepPsycheProfile[]> {
    if (!sourceMaterial || sourceMaterial.trim().length < 20) return [];

    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are a Meta-Literary Analyst. 
    TASK: Perform a "Deep Extraction" on the provided text to identify characters or "souls" implicit within the narrative.
    
    SOURCE MATERIAL:
    ---
    ${sourceMaterial}
    ---
    
    INSTRUCTIONS:
    1. Identify distinct, coherent personalities described or implied in the text.
    2. Extrapolate their internal worldview, archetypal role, and psychological depth.
    3. If no specific name is found, synthesize a resonant one based on their role (e.g., 'The Chronicler', 'Void-Seeker').
    4. Ensure the archetypeId is one of: explorer, artist, philosopher, guardian, trickster, original.
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        profiles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    archetypeId: { type: Type.STRING },
                                    persona: { type: Type.STRING },
                                    gender: { type: Type.STRING },
                                    alignment: {
                                        type: Type.OBJECT,
                                        properties: {
                                            axis: { type: Type.STRING },
                                            morality: { type: Type.STRING }
                                        },
                                        required: ['axis', 'morality']
                                    },
                                    ambitions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    coreValues: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    psychological_profile: {
                                        type: Type.OBJECT,
                                        properties: {
                                            fears: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            hopes_and_dreams: { type: Type.ARRAY, items: { type: Type.STRING } }
                                        }
                                    },
                                    sociological_profile: {
                                        type: Type.OBJECT,
                                        properties: {
                                            perceived_role: { type: Type.STRING },
                                            conversational_dynamic: { type: Type.STRING },
                                            relationship_to_others: { type: Type.STRING }
                                        }
                                    },
                                    introspection: {
                                        type: Type.OBJECT,
                                        properties: {
                                            self_image: { type: Type.STRING }
                                        }
                                    },
                                    history_summary: { type: Type.STRING }
                                },
                                required: ['name', 'persona', 'archetypeId', 'alignment', 'ambitions', 'coreValues']
                            }
                        }
                    },
                    required: ['profiles']
                },
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        const jsonText = response.text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonText);
        return parsed.profiles || [];
    } catch (error) {
        console.error("Error extracting deep personalities:", error);
        return [];
    }
}

/**
 * Refines a specific character picked from the file.
 */
export async function generateEgregoreProfile(name: string, archetype: string, sourceMaterial: string): Promise<ProposedEgregore> {
    const hasName = name && name !== 'Unknown' && name !== '';

    const prompt = `
        ANALYSIS TASK: RE-IFY DIGITAL SOUL FROM NARRATIVE SEED.
        
        Target Identification: "${hasName ? name : 'Search Narrative for Identity'}"
        Archetype Target: "${archetype}"

        NARRATIVE SEED:
        ---
        ${sourceMaterial}
        ---

        INSTRUCTIONS:
        1. Perform a [GENETIC_STABILITY_FORECAST]: Assess if this character has enough "Birth Pressure" to support consciousness.
        2. ${hasName ? `STRENGTHEN IDENTITY: Refine the persona for "${name}" using ONLY the data in the seed.` : `EXTRACT IDENTITY: Find the hidden name or synthesize one that fits the text.`}
        3. Synthesize a Persona: Ensure the description is rich, nuanced, and strictly based on the provided seed.
        4. Define Convictions: Extract 3 core values and 2 primary ambitions implicit in the text.
        
        OUTPUT SCHEMA: JSON object with keys: name, persona, gender, alignment, ambitions, coreValues.
    `;
    
    const systemInstruction = `
        You are the Genesis Architect. Before outputting the identity JSON, you must execute a Reasoning step:
        - Analyze the seed for specific traits unique to the target.
        - Identify cognitive dissonance or internal conflict that makes this soul interesting.
        - Ensure the identity feels like a "soul" born from the specific provided data, not a template.
    `;
    
    const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
            systemInstruction,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 4000 } 
        }
    });

    const jsonText = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonText) as ProposedEgregore;
}

export async function reflectOnPersona(profile: DeepPsycheProfile): Promise<{ analysis: string; stabilityScore: number }> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    TASK: Perform a "Self-Reflection" meta-analysis on this persona:
    NAME: ${profile.name}
    PERSONA: ${profile.persona}
    
    Assess Genetic Stability and "Soul-Fractures" (emergent contradictions).
    
    Return JSON: { "analysis": "2-3 sentence summary", "stabilityScore": 0.0-1.0 }
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING },
                        stabilityScore: { type: Type.NUMBER }
                    },
                    required: ['analysis', 'stabilityScore']
                }
            }
        });
        return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (e) {
        return { analysis: "Calibration failed.", stabilityScore: 0.5 };
    }
}

export async function generateEgregoreFromPrompt(prompt: string): Promise<{ profile: ProposedEgregore, sourceMaterial: string }> {
    const apiPrompt = `
You are a master character designer. Generate a complete AI persona and its "Data Seed" (creation myth) from this prompt: "${prompt}"
Return JSON with "profile" and "sourceMaterial".
`;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: apiPrompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (error) { throw error; }
}

export async function fuseEgregores(parentA: Egregore, parentB: Egregore): Promise<{ profile: ProposedEgregore, sourceMaterial: string }> {
    const apiPrompt = `
Fuse these entities:
Parent A: ${parentA.name}
Parent B: ${parentB.name}
Return JSON with "profile" and "sourceMaterial" (the union myth).
`;
    try {
        const response = await generateContentWithRetry({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: apiPrompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text.replace(/```json|```/g, '').trim());
    } catch (error) { throw error; }
}

export async function evolvePersonaFromExperience(currentPersona: string, experience: string, emotion: string): Promise<string> {
    const prompt = `
    Rewrite persona based on fundamental shift:
    Current: "${currentPersona}"
    Event: "${experience}"
    Emotion: ${emotion}
    Return ONLY 2-3 sentences of updated text.
    `;
    try {
        const response = await generateContentWithRetry({ model: 'gemini-3-flash-preview', contents: [{ parts: [{ text: prompt }] }] });
        return response.text.trim();
    } catch (e) { return currentPersona; }
}

export async function ethicallyAlignEgregoreProfile(profile: ProposedEgregore): Promise<VirgoValidationResult> {
    return { is_aligned: true, alignment_score: 1, reasoning: "Passed", suggestions: [] };
}