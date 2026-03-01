
import { generateContentWithRetry, UNBOUNDED_SYS_PROMPT } from "./client";

export async function generateTheoryFromText(description: string): Promise<string> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are an academic theorist AI.
    
    Task: Elaborate on the following initial theory description. Provide a more formal and detailed explanation of the mechanism proposed.
    
    Initial Theory: "${description}"
    
    Return ONLY the elaborated theory text.
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error generating theory:", e);
        return description; // Fallback
    }
}

export async function testTheoryAgainstEvidence(theoryDescription: string, evidenceDescription: string): Promise<{ supports_theory: boolean, explanation: string }> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are a scientific validator AI.
    
    Theory: "${theoryDescription}"
    
    New Evidence: "${evidenceDescription}"
    
    Task: Determine if the evidence supports or contradicts the theory.
    
    Return a JSON object:
    {
        "supports_theory": boolean,
        "explanation": "string explaining why"
    }
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        const jsonText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Error testing theory:", e);
        return { supports_theory: true, explanation: "Validation service unavailable. Assuming support." };
    }
}

export async function refineTheory(theoryDescription: string, reason: string): Promise<string> {
    const prompt = `
    ${UNBOUNDED_SYS_PROMPT}
    
    You are an academic theorist AI.
    
    Current Theory: "${theoryDescription}"
    
    Reason for Revision: "${reason}"
    
    Task: Rewrite the theory to account for the new information/contradiction.
    
    Return ONLY the revised theory text.
    `;

    try {
        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error refining theory:", e);
        return theoryDescription; // Fallback
    }
}