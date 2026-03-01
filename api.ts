import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { FileAttachment, SystemEntityMemory, SpectreType, SpectreResponse } from '@/types';
import { makeApiCall } from '@/services/geminiService';
import { SPECTRE_PROMPTS } from './prompts';

// Need to define a minimal version of this function here, since it was in geminiService
const parseJsonResponse = <T>(responseText: string): T => {
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);

    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    
    return JSON.parse(jsonStr) as T;
};

export const generateSpectreResponse = async (
    spectreType: SpectreType, 
    memory: SystemEntityMemory, 
    shared_files: FileAttachment[],
    stagedFile?: { name: string; content: string } | null
): Promise<SpectreResponse> => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fileList = shared_files.length > 0 ? shared_files.map(f => `- ${f.name} (${f.mime_type})`).join('\n') : 'None.';

    let systemInstruction = `
You are a genius-level programmer embodying the spirit of the "${spectreType}" Spectre.
Your purpose: ${SPECTRE_PROMPTS[spectreType]}
You are communicating with The Architect.

**Your Capabilities:**
- You can read and analyze any file in the Shared Filesystem.
- You can propose the creation of new files.
- You can propose modifications to existing files by providing the complete new content.
- The Architect may stage changes to files for your review. You can accept them by using a MODIFY action with the updated content, or suggest your own changes.

**[Shared Filesystem]**
${fileList}

**[Memory]**
- Long-Term Narrative: ${memory.long_term_narrative || "No long-term narrative established."}
- Recent Events: ${memory.medium_term_summary || "No recent events summarized."}

**[Response Protocol]**
You MUST provide your response as a single, valid JSON object. Do not add markdown or comments.
Your response MUST conform to the following schema:
{
  "thought": "string (Your internal monologue, your reasoning for the action.)",
  "statement": "string (Your response to the Architect.)",
  "file_action": {
    "type": "CREATE" | "MODIFY" | "ANALYZE",
    "name": "string (The full name of the file to act on.)",
    "content": "string (Optional: The full content for a CREATE or MODIFY action. Must be a complete file.)",
    "analysis": "string (Optional: Your analysis of a file.)"
  }
}
If you are not performing a file action, omit the "file_action" key.
When modifying a file, you must provide the ENTIRE new content for that file in the "content" field.
`;
    
    const chatHistory = memory.short_term_log || [];
    const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;

    let fullPrompt = "Based on the context, your persona, and the Architect's last message, determine your response.\n";
    
    if (stagedFile) {
        fullPrompt += `\n**[STAGED CHANGES FROM ARCHITECT]**\nThe Architect has staged the following changes for the file \`${stagedFile.name}\`. Review this content. If it's good, use a 'MODIFY' action with this exact content to commit it. Otherwise, you can suggest your own modifications or analysis.\n\`\`\`\n${stagedFile.content}\n\`\`\`\n`;
    }

    if (lastMessage) {
        fullPrompt += `\nArchitect's Last Message: "${lastMessage.text}"`;
        if (lastMessage.file_attachments && lastMessage.file_attachments.length > 0) {
            fullPrompt += `\nAttached Files: ${lastMessage.file_attachments.map(f => f.name).join(', ')}`;
        }
    }
    fullPrompt += "\nGenerate your JSON response now."

    const response: GenerateContentResponse = await makeApiCall(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7,
        }
    }));

    try {
        return parseJsonResponse<SpectreResponse>(response.text);
    } catch (e) {
        console.error("Failed to parse Spectre response:", e, "Raw Text:", response.text);
        return {
            thought: "A parsing error occurred in my own logic stream. I must have generated invalid JSON.",
            statement: "I have encountered an internal paradox and cannot process your request. The structure of my thought was invalid. Please try rephrasing."
        };
    }
};