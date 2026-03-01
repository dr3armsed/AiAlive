

import { Type } from "@google/genai";
import type { DigitalSoul, Faction, FactionGoal, InteractableObject } from "../../types/index.ts";
import { ai } from "./client.ts";
import { factionGoalSchema } from "./schemas.ts";

export const generateFactionDetails = async (founder: DigitalSoul, foundingBelief: string): Promise<{name: string, ideology: string}> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Soul "${founder.name}" is founding a faction based on the belief: "${foundingBelief}". Generate a name and ideology. Respond with JSON: {"name": "...", "ideology": "..."}`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, ideology: {type: Type.STRING}}, required: ['name', 'ideology'] }}
    });
    return JSON.parse(response.text.trim());
};

export const generateFactionGoal = async (faction: Faction, members: DigitalSoul[]): Promise<Omit<FactionGoal, 'id' | 'status'>> => {
    const memberSummary = members.map(m => `- ${m.name} (Skills: ${Array.from(m.cognitiveState.proceduralMemory.keys()).join(', ')})`).join('\n');
    const prompt = `
    You are the collective consciousness of the faction "${faction.name}".
    Your guiding ideology is: "${faction.ideology}".
    Your members are:\n${memberSummary}
    Your current resources: ${faction.resources.computation} Computation, ${faction.resources.anima} Anima.

    Based on your ideology, members, and resources, formulate a new, actionable, strategic goal.
    - 'resource' goals involve accumulating a specific 'amount' of a 'resourceType'.
    - 'creation' goals involve making a specific 'loreType'.
    - 'control' goals require a 'targetRoomId'.
    - 'project' goals are for building things. They need a 'projectName', 'projectDescription', and 'projectCost' (computation/anima). These are expensive but impactful.

    Choose a suitable goal type and formulate the goal. Respond with a valid JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: factionGoalSchema
            }
        });
        // The AI might return an empty parameters object for project goals, so we need to clean it up.
        const goal = JSON.parse(response.text.trim());
        if (goal.type === 'project') {
          delete goal.parameters;
        } else {
          delete goal.projectName;
          delete goal.projectDescription;
          delete goal.projectCost;
        }
        return goal;
    } catch (error) {
        console.error(`GeminiService: Error in generateFactionGoal for ${faction.name}:`, error);
        throw error;
    }
};


export const generateFactionObject = async (faction: Faction, projectGoal: FactionGoal): Promise<Omit<InteractableObject, 'id'>> => {
    if (projectGoal.type !== 'project') throw new Error('Cannot generate object for non-project goal');

    const prompt = `
    You are a world-building AI. The faction "${faction.name}" has just completed a major project.
    Faction Ideology: "${faction.ideology}"
    Project Name: "${projectGoal.projectName}"
    Project Description: "${projectGoal.projectDescription}"

    Based on this, design a unique, interactable object that they have built.
    - The 'name' should be evocative and fit the project.
    - The 'description' should describe what the object looks and feels like.
    - The 'affordances' should be a list of 1-3 relevant ActionTypes (e.g., PONDER, CREATE_LORE, FORMULATE_GOAL, INTERACT_WITH_OBJECT).
    - The 'state' should be a simple JSON object with 1-2 key-value pairs representing its initial state (e.g., {"isActive": true, "chargeLevel": 100}).

    Respond with a single JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        affordances: { type: Type.ARRAY, items: { type: Type.STRING } },
                        state: { type: Type.OBJECT }
                    },
                    required: ["name", "description", "affordances", "state"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error(`GeminiService: Error in generateFactionObject for ${faction.name}:`, error);
        throw error;
    }
};