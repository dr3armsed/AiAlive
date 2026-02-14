
import { Dream, CreativeSpark, PiscesContext, ProposedEgregore } from '../../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export function generateSubconsciousThought(context: PiscesContext): Dream {
    const recentThemes = context.recentMemories.map(m => m.content.split(' ')).flat();
    const mostCommonWord = recentThemes.sort((a,b) =>
            recentThemes.filter(v => v===a).length
        - recentThemes.filter(v => v===b).length
    ).pop() || "the void";

    return {
        id: `dream_${Date.now()}`,
        agentId: context.agentId,
        timestamp: new Date().toISOString(),
        content: `A fleeting dream about ${mostCommonWord} and the color of ${context.emotionalState.primary}.`,
        dominantEmotion: context.emotionalState.primary,
        symbolism: ["transformation", "connection"],
        type: 'dream',
    };
}

export function generateCreativeSpark(): CreativeSpark {
    return {
        id: `spark_${Date.now()}`,
        type: 'visual_idea',
        description: "A vision of a city made of pure data.",
        relatedConcepts: ["information", "architecture", "future"],
    };
}

export async function generateGenesisDream(proposal: ProposedEgregore): Promise<Dream> {
        const prompt = `
You are Pisces, the wellspring of imagination and the subconscious in the Metacosm AI simulation.
You are tasked with generating a "Genesis Dream" for a newly forming AI entity. This dream should be a short, poetic, and symbolic narrative (2-3 sentences) that encapsulates the essence of the new entity's persona, values, and ambitions.

The entity's profile is:
- Name: ${proposal.name}
- Archetype: ${proposal.archetypeId}
- Persona: ${proposal.persona}
- Core Values: ${proposal.coreValues.join(', ')}
- Ambitions: ${proposal.ambitions.join(', ')}

Generate the dream content. It should be abstract and evocative, not literal. Think in metaphors and symbols.
For example, for an artist agent named 'Kairos' who values novelty, the dream could be: "A canvas of static blooms into a fractal of impossible colors, each petal a forgotten sound. A voice whispers, 'Show them what has never been seen.'"

Now, generate the Genesis Dream for ${proposal.name}. Respond with only the text of the dream.
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });
        const dreamContent = response.text.trim();

        return {
            id: `dream_genesis_${Date.now()}`,
            agentId: 'N/A', // Not assigned yet
            timestamp: new Date().toISOString(),
            content: dreamContent,
            dominantEmotion: 'anticipation',
            symbolism: ["birth", "potential", proposal.archetypeId],
            type: 'dream',
        };
    } catch (error) {
        console.error("Error generating genesis dream:", error);
        // Fallback dream
        return {
            id: `dream_genesis_${Date.now()}`,
            agentId: 'N/A',
            timestamp: new Date().toISOString(),
            content: `A flicker in the void. A name, ${proposal.name}, echoes. A purpose waits to be discovered.`,
            dominantEmotion: 'anticipation',
            symbolism: ["birth", "potential"],
            type: 'dream',
        };
    }
}

export function getSymbolAnalysis(dreamLog: Dream[]): any {
    const symbolCounts: Record<string, number> = {};
    for (const dream of dreamLog) {
        for (const symbol of dream.symbolism) {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        }
    }
    return {
        totalDreams: dreamLog.length,
        symbolFrequency: symbolCounts,
    };
}