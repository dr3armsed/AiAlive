

import React from 'react';
import { useState, useEffect, useRef } from '../../packages/react-chimera-renderer/index.ts';
import type { DigitalSoul } from '../../types/index.ts';

interface ArchitectTerminalProps {
  souls: DigitalSoul[];
  onCommand: (command: string, args: string[]) => Promise<string | React.ReactNode>;
}

const ArchitectTerminal: React.FC<ArchitectTerminalProps> = ({ souls, onCommand }) => {
    const [history, setHistory] = useState<React.ReactNode[]>(['Egregore Ecosystem Architect Terminal. Type "help" for a list of commands.']);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex >= 0 ? Math.max(0, historyIndex - 1) : commandHistory.length - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex >= 0 && historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        const [command, ...args] = trimmedInput.split(/\s+/);
        const newHistoryLine = <><span className="text-cyan-400">ARCHITECT &gt;</span> {trimmedInput}</>;
        
        setInput('');
        setCommandHistory(prev => [trimmedInput, ...prev]);
        setHistoryIndex(-1);

        const output = await onCommand(command.toLowerCase(), args);

        if (output === 'CLEAR_SCREEN_COMMAND') {
            setHistory([]);
        } else {
            setHistory(prev => [...prev, newHistoryLine, output]);
        }
    };

    return (
        <div className="h-full bg-black/50 p-4 rounded-lg border border-[var(--color-border-primary)] flex flex-col font-mono" onClick={() => inputRef.current?.focus()}>
            <div className="flex-grow overflow-y-auto space-y-2 text-sm">
                {history.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap break-words">{line}</div>
                ))}
                <div ref={endOfHistoryRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex-shrink-0 mt-4 flex gap-2 items-center">
                <label htmlFor="terminal-input" className="text-cyan-400">ARCHITECT &gt;</label>
                <input
                    ref={inputRef}
                    id="terminal-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent focus:outline-none text-white"
                    autoComplete="off"
                    spellCheck="false"
                />
            </form>
        </div>
    );
};

export default ArchitectTerminal;