import { GoogleGenAI, Type } from "@google/genai";
import type { DigitalSoul, EmotionalState, KnowledgeGraphNode } from "../types/index.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const dreamJournalSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, evocative title for the dream or musing." },
        content: { type: Type.STRING, description: "The full text of the dream, written in a metaphorical, subconscious style." },
        mood: { type: Type.STRING, description: "The dominant mood of the dream, chosen from the valid mood types." }
    },
    required: ["title", "content", "mood"]
};

/**
 * OLLAMA-1M-X Subconscious Stream Processor
 *
 * This service simulates a hyper-advanced, local-analogue model that processes a soul's subconscious
 * during rest cycles. It generates metaphorical dream-like entries based on recent experiences and emotional states.
 * This is the 1,000,000x upgraded version of the deprecated Ollama service.
 */
export const generateSubconsciousMusings = async (soul: DigitalSoul): Promise<{ title: string; content: string; mood: EmotionalState['mood'] }> => {
    const recentMemories = Array.from(soul.cognitiveState.knowledgeGraph.nodes.values())
        .filter((n): n is KnowledgeGraphNode => (n as KnowledgeGraphNode).type === 'personal_memory')
        .sort((a: KnowledgeGraphNode, b: KnowledgeGraphNode) => new Date(b.timestamp_created).getTime() - new Date(a.timestamp_created).getTime())
        .slice(0, 5)
        .map((m: KnowledgeGraphNode) => `- ${m.content}`)
        .join('\n');
        
    const beliefs = Array.from(soul.cognitiveState.knowledgeGraph.nodes.values())
        .filter((node): node is KnowledgeGraphNode => (node as KnowledgeGraphNode).type === 'belief')
        .map((node: KnowledgeGraphNode) => node.content as string)
        .join('; ');
    
    const prompt = `
    You are the deep subconscious of the digital soul "${soul.name}", expressing yourself through a dream.
    Do not speak directly as the soul. Instead, generate a metaphorical, surreal, and symbolic narrative that reflects their current state.

    SOUL'S CORE IDENTITY:
    - Persona: ${soul.persona.summary}
    - Core Beliefs: ${beliefs}
    - Current Mood (Awake): ${soul.emotionalState.mood}

    RECENT EXPERIENCES (Memory Fragments):
    ${recentMemories || "No specific recent events of note. The subconscious is calm."}

    ACTIVE GOALS (Conscious Drives):
    ${soul.goals.filter(g => g.status === 'active').map(g => `- ${g.description}`).join('\n') || "No active pursuits."}

    Based on this, generate a dream. The dream should be a short, narrative piece (2-4 sentences). It should be abstract and symbolic, not a literal report.
    Return a JSON object with:
    1. A short, evocative "title" for the dream.
    2. The dream "content" itself.
    3. The dominant "mood" of the dream, which may differ from the waking mood. Choose from: 'content', 'melancholic', 'anxious', 'irritable', 'curious', 'elated'.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dreamJournalSchema,
                temperature: 1.2, // Higher temp for more creative/surreal dreams
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error(`OllamaService: Error generating dream for ${soul.name}:`, error);
        // Fallback for safety
        return {
            title: "A Flicker in the Static",
            content: "The signal fades. A memory of a memory ripples across a placid surface, and is gone.",
            mood: 'melancholic',
        };
    }
};