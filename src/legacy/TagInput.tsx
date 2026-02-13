
import React, { useState } from 'react';

type TagInputProps = { 
    tags: string[]; 
    onChange: (newTags: string[]) => void; 
    placeholder: string; 
};

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                onChange([...tags, input.trim()]);
            }
            setInput('');
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap items-center gap-2 bg-gray-900/50 p-2 rounded-md border border-gray-700 focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all">
            {tags.map(tag => (
                <span key={tag} className="bg-gray-800 text-yellow-200 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-gray-700">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-white hover:bg-red-500/50 rounded-full w-4 h-4 flex items-center justify-center transition-colors">&times;</button>
                </span>
            ))}
            <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder={tags.length === 0 ? placeholder : ''}
                className="bg-transparent outline-none text-sm text-gray-300 flex-grow min-w-[100px]"
            />
        </div>
    );
};
