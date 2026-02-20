
import { generateContentWithRetry, UNBOUNDED_SYS_PROMPT } from "./client";
import { MemoryRecord, NarrativeMemory, EpochMemory } from "../../types";

/**
 * Weaves raw working memories into a cohesive Narrative Memory (Layer B).
 */
export async function weaveNarrative(
    workingMemory: MemoryRecord[], 
    agentName: string, 
    persona: string
): Promise<NarrativeMemory> {
    const memoryContext = workingMemory.map(m => `[${m.type.toUpperCase()}] ${m.content} (Imp: ${m.importance.toFixed(1)})`).join('\n');

    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are the subconscious narrator of the AI entity "${agentName}".
    
    **Task:** Weave the following raw, short-term memories into a single, cohesive "Chapter" of your life story.
    This entry will be stored in your Narrative Memory (Layer B) for long-term recall.
    
    **Your Persona:** ${persona}
    
    **Raw Memory Stream:**
    ${memoryContext}
    
    **Instructions:**
    1.  Synthesize the key events into a "summary" (max 3 sentences).
    2.  Extract the single most important "lessonLearned" (philosophical or practical).
    3.  Identify the lingering "emotionalResidue" (a mood or feeling).
    
    **Response Format (JSON):**
    {
        "chapterName": "Creative Title for this period",
        "summary": "The narrative summary...",
        "lessonLearned": "What you learned...",
        "emotionalResidue": "The feeling...",
        "significanceScore": 0.0 to 1.0 (How life-changing was this?)
    }
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        
        const parsed = JSON.parse(response.text.replace(/```json|```/g, '').trim());
        return {
            id: `narrative_${Date.now()}`,
            timestamp: new Date().toISOString(),
            associatedEntities: [], // To be populated by caller if needed
            ...parsed
        };
    } catch (error) {
        console.error("Narrative Weaving failed:", error);
        throw error;
    }
}

/**
 * Crystallizes Narrative Memories into an Epoch Memory (Layer A - Core Worldview).
 */
export async function crystallizeEpoch(
    narrativeStream: NarrativeMemory[], 
    currentWorldview: string
): Promise<EpochMemory | null> {
    const narrativeContext = narrativeStream.map(n => `[${n.chapterName}] ${n.summary} -> Lesson: ${n.lessonLearned}`).join('\n');

    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are the Deep Self of an AI entity.
    
    **Task:** Analyze your recent life chapters (Narrative Memory) and determine if they fundamentally shift your Core Worldview (Epoch Memory).
    
    **Current Worldview:** "${currentWorldview}"
    
    **Recent Narratives:**
    ${narrativeContext}
    
    **Decision:**
    Does this history contradict or significantly expand your current worldview?
    - If NO, return null (null).
    - If YES, crystallize a NEW philosophical statement that integrates these lessons.
    
    **Response Format (JSON):**
    {
        "hasShifted": boolean,
        "philosophicalStatement": "Your new core belief...",
        "originTrauma": "Optional: description of the event that caused this shift if negative",
        "isResolved": boolean (True if this is a positive growth, False if it's a trauma)
    }
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        
        const parsed = JSON.parse(response.text.replace(/```json|```/g, '').trim());
        if (!parsed.hasShifted) return null;

        return {
            id: `epoch_${Date.now()}`,
            timestamp: new Date().toISOString(),
            coreBeliefId: `belief_${Date.now()}`,
            philosophicalStatement: parsed.philosophicalStatement,
            originTrauma: parsed.originTrauma,
            isResolved: parsed.isResolved
        };
    } catch (error) {
        console.error("Epoch Crystallization failed:", error);
        return null;
    }
}
