
export async function simulateCodeExecution(code: string, dna: any): Promise<{ success: boolean; output: string; error?: string }> {
     try {
        let output = '';
        const log = (...args: any[]) => { output += args.join(' ') + '\n'; };
        const sandbox = { console: { log } };
        const fn = new Function('sandbox', `with(sandbox) { ${code} }`);
        fn(sandbox);
        return { success: true, output: output.trim() };
    } catch (e: any) {
        return { success: false, output: '', error: e.message };
    }
}

export async function generateSurrealPrompt(): Promise<string> {
    return "The void stares back.";
}