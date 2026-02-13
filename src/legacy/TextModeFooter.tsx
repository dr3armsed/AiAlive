
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Attachment } from '../../types';
import { AttachmentPreview } from '../common';

// --- Helper Components & Data ---

const ICONS = {
    mic: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
    attach: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
    send: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    creative: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
    analytical: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6a2 2 0 100-4 2 2 0 000 4zm0 14a2 2 0 100-4 2 2 0 000 4zm6-8a2 2 0 100-4 2 2 0 000 4zm-12 0a2 2 0 100-4 2 2 0 000 4z" /></svg>,
    philosophical: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.002 12.083 12.083 0 01.665-6.479L12 14z" /><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.002 12.083 12.083 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M12 14v6" /></svg>
};

const COMMANDS = [
    { cmd: '/ask', desc: 'Query the Oracle for specific information.' },
    { cmd: '/generate_image', desc: 'Create an image based on a prompt.' },
    { cmd: '/summarize', desc: 'Summarize the current conversation.' },
    { cmd: '/contemplate', desc: 'Ask the agent to reflect on a topic.' },
];

type ConduitFocus = 'Default' | 'Creative' | 'Analytical' | 'Philosophical';

const FOCUS_MODES: { id: ConduitFocus, icon: React.ReactNode, label: string }[] = [
    { id: 'Creative', icon: ICONS.creative, label: 'Creative Focus' },
    { id: 'Analytical', icon: ICONS.analytical, label: 'Analytical Focus' },
    { id: 'Philosophical', icon: ICONS.philosophical, label: 'Philosophical Focus' },
];

const CommandPalette = ({ query, onSelect }: { query: string, onSelect: (cmd: string) => void }) => {
    const filteredCommands = COMMANDS.filter(c => c.cmd.startsWith(query));
    if (filteredCommands.length === 0) return null;

    return (
        <div className="absolute bottom-full left-0 right-0 p-2 bg-gray-900 border border-purple-400/20 rounded-t-lg shadow-lg animate-fade-in">
            {filteredCommands.map(c => (
                <button
                    key={c.cmd}
                    onClick={() => onSelect(c.cmd)}
                    className="w-full text-left p-2 rounded hover:bg-purple-900/40 text-sm"
                >
                    <span className="font-mono text-white">{c.cmd}</span>
                    <span className="ml-3 text-gray-400">{c.desc}</span>
                </button>
            ))}
        </div>
    );
};


// --- Main Component ---

type Props = {
    onSendMessage: (content: string, files: File[]) => void;
    disabled: boolean;
    onToggleLive: () => void;
    participantCount: number;
}

export const TextModeFooter: React.FC<Props> = ({ onSendMessage, disabled, onToggleLive, participantCount }) => {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [conduitFocus, setConduitFocus] = useState<ConduitFocus>('Default');
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [estimatedCost, setEstimatedCost] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [message]);

    // Estimate Quintessence Cost
    useEffect(() => {
        let cost = message.trim().length > 0 ? 1 : 0;
        cost += files.length * 5;
        if (message.startsWith('/generate_image')) cost += 20;
        if (message.startsWith('/ask')) cost += 5;
        if (conduitFocus !== 'Default') cost += 2;
        setEstimatedCost(cost);
    }, [message, files, conduitFocus]);


    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
        } else {
            setShowCommandPalette(false);
        }
    };

    const handleCommandSelect = (cmd: string) => {
        setMessage(`${cmd} `);
        setShowCommandPalette(false);
        textareaRef.current?.focus();
    };

    const handleSend = () => {
        if (disabled || (!message.trim() && files.length === 0)) return;
        
        const contentToSend = conduitFocus === 'Default' ? message : `[Focus: ${conduitFocus}]\n${message}`;

        onSendMessage(contentToSend, files);
        setMessage('');
        setFiles([]);
        setConduitFocus('Default');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };
    
    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getPlaceholder = () => {
        if (disabled) return 'Select an agent to begin conduit...';
        if (participantCount > 0) return `Broadcast to group (${participantCount + 1} entities)... (use / for commands)`;
        return 'Initiate conduit... (use / for commands)';
    };

    return (
        <footer className="p-3 border-t border-purple-400/10 bg-gray-900/50 flex flex-col gap-2 relative">
            {showCommandPalette && <CommandPalette query={message} onSelect={handleCommandSelect} />}
            
            {files.length > 0 && (
                <div className="p-2 border border-dashed border-gray-600 rounded-md">
                    <div className="flex flex-wrap gap-2">
                        {files.map((file, i) => (
                            <AttachmentPreview key={i} attachment={{ fileName: file.name, fileType: file.type, url: URL.createObjectURL(file) }} onRemove={() => handleRemoveFile(i)} />
                        ))}
                    </div>
                </div>
            )}
            
            <div className="w-full bg-black/20 p-2 rounded-lg border border-purple-400/10 shadow-inner flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleMessageChange}
                    onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={getPlaceholder()}
                    className="w-full bg-transparent p-2 rounded-md resize-none max-h-40 focus:outline-none"
                    rows={1}
                    disabled={disabled}
                />
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {FOCUS_MODES.map(mode => (
                         <button 
                            key={mode.id}
                            onClick={() => setConduitFocus(prev => prev === mode.id ? 'Default' : mode.id)}
                            title={mode.label}
                            disabled={disabled}
                            className={`p-1.5 rounded-full transition-colors disabled:text-gray-600 disabled:bg-transparent ${conduitFocus === mode.id ? 'bg-purple-500 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            {mode.icon}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-gray-500" title="Estimated Quintessence Cost">{estimatedCost}Q</span>
                    <button onClick={onToggleLive} disabled={disabled} className="p-2 text-gray-400 hover:text-white disabled:text-gray-600" title="Switch to Live Voice Mode">{ICONS.mic}</button>
                    <label className={`p-2 text-gray-400 ${disabled ? 'text-gray-600' : 'hover:text-white cursor-pointer'}`} title="Attach File">
                        {ICONS.attach}
                        <input type="file" multiple onChange={handleFileChange} className="hidden" disabled={disabled} />
                    </label>
                    <button onClick={handleSend} disabled={disabled} className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" title="Send Message">
                       {ICONS.send}
                    </button>
                </div>
            </div>
        </footer>
    );
};
