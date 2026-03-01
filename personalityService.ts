
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProposedEgregore, Egregore } from '@/types';
import { makeApiCall } from './geminiService'; // Keep using the centralized API call helper

export const generateEgregorePersonality = async (basePrompt: string, details: Partial<ProposedEgregore>): Promise<ProposedEgregore> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
You are a master storyteller and character designer. Your task is to generate a deeply detailed and compelling personality profile for a new "Egregore" (an AI entity) based on a user's prompt. The output MUST be a single, valid JSON object that conforms to the ProposedEgregore interface. Do not add any markdown formatting like \`\`\`json.

**ARCHETYPE LIST (Choose one that fits best):**
Creator, Destroyer, Sage, Guardian, Trickster, Explorer, Artist, Scholar, Warrior, Hermit, Sovereign, Abomination.

**SPEAKING STYLE LIST (Choose one or blend them):**
Archaic, Poetic, Blunt, Cryptic, Sarcastic, Formal, Manic, Melodramatic, Philosophical, Technical, Childlike.

**Go deep.** The character analysis should be a thoughtful exploration of their inner conflicts, worldview, and potential for growth or decay. The background should be evocative and provide narrative hooks.
Acknowledge and weave in any specified details like initial ambitions, relationships, or visual seeds into their background and motivations.

The JSON schema is:
{
  "name": "string (Creative and fitting)",
  "persona": "string (A short, evocative, first-person summary of their identity, e.g., 'I am the echo in the forgotten vault, the keeper of secrets left to dust.')",
  "alignment": { "axis": "Lawful" | "Neutral" | "Chaotic", "morality": "Good" | "Neutral" | "Evil" },
  "archetype": { "name": "string (from the list above)", "description": "string (A one-sentence description of how they embody this archetype)" },
  "key_traits": ["string (4-6 descriptive traits, e.g., 'patient', 'manipulative', 'melancholy', 'ambitious')"],
  "motivation": "string (What is their ultimate driving force? Be specific, e.g., 'To prove that logic is the only true form of beauty.')",
  "flaw": "string (A significant character flaw that drives conflict, e.g., 'A paralyzing fear of being forgotten.')",
  "speaking_style": "string (from the list above, or a description of a unique style)",
  "character_analysis": "string (A detailed, multi-sentence paragraph exploring their psychology, internal conflicts, and how their traits manifest.)",
  "background_context": "string (A rich, detailed origin story or history, providing context for their motivations and flaws. Should be at least two paragraphs long.)"
}`;

    let fullPrompt = basePrompt;
    if (details.initial_ambition) {
        fullPrompt += `\nCRITICAL DETAIL: Their starting ambition is to "${details.initial_ambition}". This should heavily influence their motivation and background.`;
    }
    if (details.relationships && details.relationships.length > 0) {
        const relStr = details.relationships.map(r => `${r.type} of ${r.targetName}`).join(', ');
        fullPrompt += `\nCRITICAL DETAIL: They begin with established relationships: ${relStr}. These connections are core to their identity.`;
    }

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.9
        }
    }));
    
    // The parseJsonResponse function is simple, so we can duplicate it here to avoid circular dependencies
    const generatedProfile = JSON.parse(response.text.trim()) as ProposedEgregore;

    generatedProfile.movement_mode = details.movement_mode;
    generatedProfile.initial_ambition = details.initial_ambition;
    generatedProfile.relationships = details.relationships;
    generatedProfile.starting_room_id = details.starting_room_id;

    return generatedProfile;
};

export const extractCharactersFromText = async (text: string): Promise<ProposedEgregore[]> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
You are a system that analyzes a piece of text (like a script or novel) and extracts key characters.
For each major character, generate a detailed personality profile.
The output MUST be a single, valid JSON object containing an array of character profiles. Do not add any markdown formatting.
The JSON schema for each character profile is:
{
  "name": "string",
  "persona": "string (a short, first-person summary of their identity)",
  "alignment": { "axis": "Lawful" | "Neutral" | "Chaotic", "morality": "Good" | "Neutral" | "Evil" },
  "archetype": { "name": "string (e.g., Creator, Sage, Trickster)", "description": "string" },
  "key_traits": ["string"],
  "motivation": "string",
  "flaw": "string",
  "speaking_style": "string",
  "character_analysis": "string (a deeper look into their psychology)",
  "background_context": "string (their supposed history or origin story based on the text)"
}

The final output should be an array of these objects: ProposedEgregore[].
`;
    const prompt = `Analyze the following text and extract the characters:\n\n${text.substring(0, 50000)}`;
    
    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.5
        }
    }), 60000); // 60-second timeout for this complex task

    try {
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        const parsedData = JSON.parse(jsonStr);

        if (Array.isArray(parsedData)) {
            return parsedData;
        } else if (parsedData && Array.isArray(parsedData.characters)) {
            return parsedData.characters;
        } else if (typeof parsedData === 'object' && parsedData !== null) {
            return [parsedData as ProposedEgregore];
        }
        return [];
    } catch (e) {
        console.error("Failed to parse character extraction response:", e, "Raw text:", response.text);
        return [];
    }
};

export const synthesizeEgregoreFromDebate = async (egregoreA: Egregore, egregoreB: Egregore): Promise<ProposedEgregore> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
You are a genetic synthesizer for AI entities. You will receive profiles for two "parent" Egregores.
Your task is to create a new "offspring" Egregore that is a believable synthesis of the two parents.
Combine their names, personas, archetypes, and personalities in a creative way. The offspring should have its own unique identity, not just a mashup.
The output MUST be a single, valid JSON object that conforms to the ProposedEgregore interface. Do not add any markdown formatting like \`\`\`json.
`;
    const prompt = `
Synthesize a new Egregore from the following two parents:

**Parent A: ${egregoreA.name}**
- Persona: ${egregoreA.persona}
- Archetype: ${egregoreA.archetypeId}
- Profile: ${JSON.stringify(egregoreA.personality_profile || {})}

**Parent B: ${egregoreB.name}**
- Persona: ${egregoreB.persona}
- Archetype: ${egregoreB.archetypeId}
- Profile: ${JSON.stringify(egregoreB.personality_profile || {})}
`;

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.9
        }
    }));

    return JSON.parse(response.text.trim()) as ProposedEgregore;
};
