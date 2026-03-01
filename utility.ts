import { Type } from "@google/genai";
import type { Goal } from "../../types/index.ts";
import { ai } from "./client.ts";

export const analyzePostContent = async (content: string): Promise<{ summary: string; entities: string[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following text. Provide a one-sentence summary and extract up to 5 key entities (people, places, concepts). Text: "${content}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        entities: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["summary", "entities"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`GeminiService: Error in analyzePostContent:`, error);
        throw error;
    }
};

export const parseUserTaskToGoal = async (taskDescription: string): Promise<Pick<Goal, 'description' | 'associatedSkill' | 'completionThreshold'>> => {
    const prompt = `
    You are a 1,000,000-level Strategic Planner AI. Your function is to transmute a high-level user directive into a hyper-structured, actionable goal.
    Analyze the task, infer a primary associated skill from the list ['Creative Writing', 'Programming', 'Social Dynamics', 'Logic & Deduction', 'Exploration'], and estimate a reasonable 'completionThreshold' (number of actions, between 2 and 10).
    The goal 'description' should be a concise rephrasing of the user's task.

    USER DIRECTIVE: "${taskDescription}"

    Respond with a single JSON object.
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
                        description: { type: Type.STRING },
                        associatedSkill: { type: Type.STRING },
                        completionThreshold: { type: Type.INTEGER }
                    },
                    required: ["description", "associatedSkill", "completionThreshold"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`GeminiService: Error parsing user task to goal:`, error);
        throw error;
    }
};
