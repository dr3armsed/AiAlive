


import { Type } from "@google/genai";
import type { DnaDiagnosticsReport, DigitalSoul } from "../../types/index.ts";
import { ai } from "./client.ts";
import { dnaDiagnosticsReportSchema, dnaMutationSchema, dnaFitnessSchema } from "./schemas.ts";

/**
 * Uses Gemini to analyze a soul's `body.json` content and generates a diagnostic report.
 * @param dnaJsonContent The JSON string from a soul's body.json file.
 * @returns A promise that resolves to the diagnostics report.
 */
export const runDnaDiagnostics = async (dnaJsonContent: string): Promise<Omit<DnaDiagnosticsReport, 'isLoading'>> => {
    const prompt = `
    You are an advanced AI diagnostics engine for digital lifeforms. Your task is to analyze the provided JSON object, which represents a soul's physical embodiment and sensory systems.
    Based *only* on the provided JSON data, generate a comprehensive diagnostics report.

    - For 'testResults', create an entry for each major body part and sensory system. A test 'passed' is true if its status is 'nominal' or 'online'.
    - For 'benchmarkResults', extract quantitative data from the JSON, such as sensory 'memoryStorage' or internal 'bpm'.

    JSON Data to Analyze:
    ---
    ${dnaJsonContent}
    ---

    Respond with a single, valid JSON object that strictly adheres to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dnaDiagnosticsReportSchema,
            },
        });
        const jsonText = response.text.trim();
        const report = JSON.parse(jsonText);
        return report;
    } catch (error) {
        console.error("GeminiService: Error running DNA diagnostics:", error);
        return {
            testResults: [{ name: 'AI Analysis', passed: false, details: 'Failed to generate report from source.' }],
            benchmarkResults: [],
            demoResult: null
        };
    }
};

/**
 * Uses Gemini to mutate a soul's `body.json` based on a high-level instruction.
 * @param currentJson The current JSON content of the soul's body.json file.
 * @param instruction A natural language instruction for how to change the soul's body.
 * @returns A promise that resolves to the mutated JSON and a summary of changes.
 */
export const mutateDnaCode = async (currentJson: string, instruction: string): Promise<{ mutatedCode: string; summaryOfChanges: string; }> => {
    const prompt = `
    You are a 1,000,000x-level AI bio-digital engineer. Your task is to modify the provided JSON object, representing a soul's embodiment, based on a high-level instruction.
    You must return the *entire* modified JSON object as a string, not just a diff or snippet. Ensure the JSON remains structurally valid and consistent with the original schema.
    Provide a brief, first-person summary of the changes you made as if you were the soul's own system reporting the change.

    High-Level Instruction: "${instruction}"

    Current JSON Data:
    ---
    ${currentJson}
    ---

    Respond with a single, valid JSON object containing the 'mutatedCode' (as a JSON string) and a 'summaryOfChanges'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dnaMutationSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("GeminiService: Error mutating DNA code:", error);
        throw new Error("The AI failed to generate a valid code mutation.");
    }
};

/**
 * Uses Gemini to evaluate a mutated DNA against a fitness goal.
 * @param originalSoul The original state of the soul for context.
 * @param mutatedDnaJson The proposed new `body.json` content.
 * @param fitnessGoal The natural language goal of the mutation.
 * @returns A promise resolving to a fitness score and rationale.
 */
export const evaluateDnaFitness = async (originalSoul: DigitalSoul, mutatedDnaJson: string, fitnessGoal: string): Promise<{ score: number; rationale: string; }> => {
    const prompt = `
    You are a bio-digital performance analyst. Your task is to evaluate a proposed mutation to a digital soul's DNA against a specific fitness goal.

    FITNESS GOAL: "${fitnessGoal}"

    ORIGINAL SOUL CONTEXT:
    - Persona: ${originalSoul.persona.summary}
    - Current Resources: ${originalSoul.resources.computation} Comp, ${originalSoul.resources.anima} Anima.

    PROPOSED MUTATED DNA (JSON):
    ---
    ${mutatedDnaJson}
    ---

    Analyze the mutated DNA. Compare it to the original soul's context. How well does this mutation achieve the stated fitness goal?
    - A score of 0.0 means no improvement or detrimental.
    - A score of 0.5 means a minor, questionable improvement.
    - A score of 1.0 means a significant, direct, and unambiguous improvement towards the goal.

    Provide a score and a brief, technical rationale for your score. Respond with a single JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dnaFitnessSchema,
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("GeminiService: Error evaluating DNA fitness:", error);
        return { score: 0, rationale: "AI analysis of the mutation failed." };
    }
};