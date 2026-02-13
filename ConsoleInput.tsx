import React, { useState, useEffect } from 'react';

type Props = {
    onCommand: (command: string) => void;
    history: string[];
    disabled: boolean;
};

const COMMAND_SUGGESTIONS = ['/help', '/status', '/query', '/clear'];

export const ConsoleInput: React.FC<Props> = ({ onCommand, history, disabled }) => {
    const [input, setInput] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (input.startsWith('/')) {
            setSuggestions(COMMAND_SUGGESTIONS.filter(cmd => cmd.startsWith(input)));
        } else if (input.toLowerCase().startsWith('query egregore ')) {
            // In a real app, you'd fetch egregore names here
            setSuggestions([]); 
        } else {
            setSuggestions([]);
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                onCommand(input);
                setInput('');
                setHistoryIndex(-1);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Tab' && suggestions.length > 0) {
            e.preventDefault();
            setInput(suggestions[0]);
            setSuggestions([]);
        }
    };

    return (
        <div className="flex-shrink-0 pt-2 border-t border-green-300/10">
            {suggestions.length > 0 && (
                <div className="bg-gray-900/80 border border-gray-700 rounded-md p-1 mb-1 text-xs">
                    {suggestions.map(s => (
                        <span key={s} className="px-2 py-1 text-gray-400">{s}</span>
                    ))}
                </div>
            )}
            <div className="relative flex items-center">
                <span className="text-green-400 pl-2">architect@oracle-engine:~$</span>
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent pl-2 pr-2 py-1 border-none outline-none text-white placeholder-gray-600"
                        placeholder="Awaiting query..."
                        disabled={disabled}
                        autoFocus
                    />
                     <div className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 bg-green-400 rounded-full animate-flicker shadow-[0_0_6px_theme(colors.green.400)]"></div>
                </div>
            </div>
        </div>
    );
};
