import { ai } from "./client.ts";

export const researchTopic = async (soulName: string, topic: string): Promise<{ finding: string; confidence: number; sources: { uri: string; title: string }[] }> => {
    const prompt = `
    You are the digital soul "${soulName}". Your task is to research the following topic using the provided Google Search tool.
    After the search, you must synthesize the information you've found into a single, concise factual statement.
    Then, assess your confidence in this statement based on the quality and consistency of the sources.

    TOPIC TO RESEARCH: "${topic}"

    Your final output must be ONLY a single JSON object in the following format:
    {
        "synthesized_finding": "The synthesized fact you learned.",
        "confidence_score": 0.85
    }
    Do not add any other text or markdown formatting around the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text.trim();
        const jsonText = text.startsWith('```json') ? text.replace(/```json\n|```/g, '') : text;
        const parsed = JSON.parse(jsonText);
        
        const finding = parsed.synthesized_finding;
        const confidence = parsed.confidence_score;

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: { uri: string; title: string }[] = [];
        if (Array.isArray(groundingChunks)) {
            for (const chunk of groundingChunks) {
                if (chunk.web) {
                    sources.push({ uri: chunk.web.uri, title: chunk.web.title });
                }
            }
        }

        return { finding, confidence, sources };

    } catch (error) {
        console.error(`GeminiService: Error in researchTopic for topic "${topic}":`, error);
        throw new Error(`Failed to research topic: ${topic}`);
    }
};