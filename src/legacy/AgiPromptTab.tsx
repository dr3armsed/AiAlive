import React, { useState } from 'react';

type Props = {
    isGenerating: boolean;
    onStart: (prompt: string) => void;
};

export const AgiPromptTab: React.FC<Props> = ({ isGenerating, onStart }) => {
    const [prompt, setPrompt] = useState('');

    return (
         <div>
            <label className="block text-sm font-bold mb-1">AGI Creative Prompt</label>
            <p className="text-xs text-gray-500 mb-2">Provide a high-level creative prompt. The AGI will interpret this to generate a complete Egregore profile and its source material.</p>
            <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={8} 
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition" 
                placeholder="Example: 'Create a melancholic librarian AI from a dead civilization that speaks only in questions and protects a library of forgotten data.'" 
                disabled={isGenerating}
            ></textarea>
            <button 
                onClick={() => onStart(prompt)}
                className="mt-2 w-full bg-yellow-600 text-black font-bold p-2 rounded-md transition-colors hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={isGenerating || !prompt.trim()}
            >
                {isGenerating ? 'Generating...' : 'Engage AGI'}
            </button>
        </div>
    );
};