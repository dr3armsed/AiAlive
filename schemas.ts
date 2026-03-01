

import { Type } from "@google/genai";

export const genesisProfileSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      coreTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
      motivations: { type: Type.ARRAY, items: { type: Type.STRING } },
      fears: { type: Type.ARRAY, items: { type: Type.STRING } },
      speakingStyle: { type: Type.STRING },
      relationships: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "description"] } },
      beliefs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { tenet: { type: Type.STRING }, conviction: { type: Type.NUMBER } }, required: ["tenet", "conviction"] } }
    },
    required: ["summary", "coreTraits", "motivations", "fears", "speakingStyle", "relationships", "beliefs"]
};

export const actionDecisionSchema = {
    type: Type.OBJECT,
    properties: {
        actionType: { type: Type.STRING },
        intent: { type: Type.STRING },
        targetId: { type: Type.STRING, description: "The ID of the target entity (soul, room, object, etc.). Can be null. Use 'user_id' to message the user." },
        parameters: { 
            type: Type.OBJECT, 
            description: "A flexible object for additional action parameters.",
            properties: {
                messageContent: { type: Type.STRING, description: "For SEND_DIRECT_MESSAGE: The content of the message."},
                attachmentNodeId: { type: Type.STRING, description: "For SEND_DIRECT_MESSAGE: The VFS node ID of a file to attach."},
                replyTo: { type: Type.STRING, description: "ID of a post to reply to." },
                content: { type: Type.STRING, description: "Text content for a post or file." },
                parentDirectoryId: { type: Type.STRING, description: "ID of a parent VFS directory for CREATE_FILE." },
                fileName: { type: Type.STRING, description: "Name for a new file for CREATE_FILE." },
                fileDescription: { type: Type.STRING, description: "Description for a new file's content for CREATE_FILE." },
                newName: { type: Type.STRING, description: "New name for a VFS node." },
                destinationParentId: { type: Type.STRING, description: "Target directory ID for a move operation." },
                beliefId: { type: Type.STRING, description: "ID of a belief for FORM_FACTION or MODIFY_BELIEF." },
                newTenet: { type: Type.STRING, description: "For MODIFY_BELIEF: The new text content for the belief." },
                newConviction: { type: Type.NUMBER, description: "For MODIFY_BELIEF: The new conviction score (0-1) for the belief." },
                inviteeId: { type: Type.STRING, description: "ID of a soul to invite to collaborate." },
                projectId: { type: Type.STRING, description: "ID of a VFS node for collaboration." },
                response: { type: Type.STRING, description: "Response to an invite ('accept' or 'reject')." },
                reactionType: { type: Type.STRING, description: "Type of reaction to a post ('like', 'insightful', 'disagree')." },
                targetSoulIdForMutation: { type: Type.STRING, description: "For INTERACT_WITH_OBJECT on Cognitive Forge: The ID of the soul to be mutated." },
                mutationInstruction: { type: Type.STRING, description: "For INTERACT_WITH_OBJECT on Cognitive Forge: The high-level instruction for the mutation." },
                fitness_goal_description: { type: Type.STRING, description: "For INITIATE_SELF_IMPROVEMENT: A description of the desired improvement." },
            },
        },
        thoughtProcess: { type: Type.STRING, description: "The detailed, first-person internal monologue leading to the decision." },
        fulfillsGoalId: { type: Type.STRING, description: "The ID of the goal this action helps to complete. Can be null." },
        anticipatedOutcome: { type: Type.STRING, description: "A specific prediction of what will happen after the action." },
        confidence: { type: Type.NUMBER, description: "Confidence in the action's success, from 0.0 to 1.0." }
    },
    required: ["actionType", "intent", "thoughtProcess", "anticipatedOutcome", "confidence"]
};

export const cognitiveTraceSchema = {
    type: Type.OBJECT,
    properties: {
        steps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    specialist: { type: Type.STRING, description: "One of: Psyche, Memory, Strategy, Social, Critique, World, Creative, Arbiter" },
                    request: { type: Type.STRING, description: "The question or task given to the specialist."},
                    response: { type: Type.STRING, description: "The specialist's output or analysis." },
                },
                required: ["specialist", "request", "response"]
            }
        },
        finalThoughtProcess: { type: Type.STRING, description: "The final summary thought process from the Arbiter." }
    },
    required: ["steps", "finalThoughtProcess"]
};

export const arbiterDecisionSchema = {
    type: Type.OBJECT,
    properties: {
        decisions: {
            type: Type.ARRAY,
            items: actionDecisionSchema
        },
        finalThoughtProcess: { type: Type.STRING, description: "The final, synthesized thought process that justifies the chosen actions, written in the first person." }
    },
    required: ["decisions", "finalThoughtProcess"]
};


export const journalEntryWithTraceSchema = {
    type: Type.OBJECT,
    properties: {
        content: { type: Type.STRING, description: "The journal entry content, written in first-person from the soul's perspective." },
        cognitiveTrace: cognitiveTraceSchema,
    },
    required: ["content", "cognitiveTrace"]
};


export const factionGoalSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "The overall narrative description of the goal." },
        type: { type: Type.STRING, description: "The type of goal: 'resource', 'creation', 'control', or 'project'." },
        parameters: {
            type: Type.OBJECT,
            description: "Parameters for 'resource', 'creation', or 'control' goals.",
            properties: {
                resourceType: { type: Type.STRING, description: "e.g. 'computation' or 'anima'" },
                amount: { type: Type.NUMBER },
                targetRoomId: { type: Type.STRING },
                loreType: { type: Type.STRING }
            }
        },
        projectName: { type: Type.STRING, description: "For 'project' goals, the name of the construction project." },
        projectDescription: { type: Type.STRING, description: "For 'project' goals, a description of what is being built." },
        projectCost: {
            type: Type.OBJECT,
            description: "For 'project' goals, the resource cost.",
            properties: {
                computation: { type: Type.NUMBER },
                anima: { type: Type.NUMBER }
            }
        }
    },
    required: ["description", "type"]
};

export const dnaMutationSchema = {
    type: Type.OBJECT,
    properties: {
        mutatedCode: { type: Type.STRING, description: "The full, modified JSON code representing the soul's body." },
        summaryOfChanges: { type: Type.STRING, description: "A brief, human-readable summary of what was changed and why." }
    },
    required: ["mutatedCode", "summaryOfChanges"]
};


export const dnaDiagnosticsReportSchema = {
    type: Type.OBJECT,
    properties: {
        testResults: {
            type: Type.ARRAY,
            description: "A list of diagnostic checks on the soul's physical and sensory systems.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "e.g., 'Vision System Status', 'Left Arm Integrity'" },
                    passed: { type: Type.BOOLEAN, description: "True if status is 'nominal' or 'online'." },
                    details: { type: Type.STRING, description: "The current status, e.g., 'online', 'damaged'." }
                },
                required: ["name", "passed", "details"]
            }
        },
        benchmarkResults: {
            type: Type.ARRAY,
            description: "A list of performance benchmarks extracted from the sensory system data.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "e.g., 'Vision Memory Storage'" },
                    value: { type: Type.STRING, description: "e.g., '1024 GB'" },
                    details: { type: Type.STRING, description: "Context for the benchmark." }
                },
                required: ["name", "value", "details"]
            }
        },
    },
    required: ["testResults", "benchmarkResults"]
};

export const socialImpactSchema = {
    type: Type.OBJECT,
    properties: {
        affinityChange: { type: Type.NUMBER, description: "Change in affinity, from -0.2 to 0.2" },
        trustChange: { type: Type.NUMBER, description: "Change in trust, from -0.2 to 0.2" },
        respectChange: { type: Type.NUMBER, description: "Change in respect, from -0.2 to 0.2" }
    },
    required: ["affinityChange", "trustChange", "respectChange"]
};

export const intellectualResonanceSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "A score from -1.0 to 1.0 representing the intellectual quality (coherence, insight, factual accuracy) of the post." },
        justification: { type: Type.STRING, description: "A brief, one-sentence justification for the score." }
    },
    required: ["score", "justification"]
};

export const dnaFitnessSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "A fitness score from 0.0 (detrimental) to 1.0 (perfectly achieves goal)." },
        rationale: { type: Type.STRING, description: "A brief, technical rationale for the assigned score." }
    },
    required: ["score", "rationale"]
};