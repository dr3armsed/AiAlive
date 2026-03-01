import React from 'react';
import { useState, useEffect, useRef } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '../../types/index.ts';
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon.tsx';
import UserIcon from '../icons/UserIcon.tsx';
import SignalTowerIcon from '../icons/SignalTowerIcon.tsx';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

const AnimatedCaret: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
    <MotionDiv
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block w-2 h-4 bg-purple-300 ml-1"
        {...props}
    />
);

const LocusMessageRenderer: React.FC<{ message: ChatMessage } & React.HTMLAttributes<HTMLDivElement>> = ({ message, ...props }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const { content, isStreaming } = message;

    useEffect(() => {
        if (!isStreaming) {
            let i = 0;
            setDisplayedContent('');
            const intervalId = setInterval(() => {
                setDisplayedContent(content.substring(0, i + 1));
                i++;
                if (i >= content.length) {
                    clearInterval(intervalId);
                }
            }, 20); // Typing speed
            return () => clearInterval(intervalId);
        }
    }, [content, isStreaming]);

    return (
        <div className="flex items-start gap-3" {...props}>
            <SignalTowerIcon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <p className="font-mono text-purple-300 whitespace-pre-wrap leading-relaxed">
                {isStreaming ? <AnimatedCaret /> : displayedContent}
            </p>
        </div>
    );
};


const SpectreLocusView: React.FC<{
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isResponding: boolean;
}> = ({ chatHistory, onSendMessage, isResponding }) => {
    const [input, setInput] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isResponding) {
            onSendMessage(input);
            setInput('');
        }
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, chatHistory.length > 0 && chatHistory[chatHistory.length - 1].content]);

    return (
        <div className="h-full flex flex-col bg-black/30 rounded-lg border border-[var(--color-border-secondary)] relative overflow-hidden">
            <div 
                className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(var(--color-text-tertiary) 1px, transparent 1px)',
                    backgroundSize: '10px 10px',
                    maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)'
                }}
            />
            <div className="relative flex flex-col h-full z-10">
                <div className="flex-grow overflow-y-auto p-4 space-y-6">
                    <AnimatePresence>
                        {chatHistory.map(msg => (
                            <MotionDiv
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                {msg.sender === 'user' ? (
                                    <div className="flex items-start gap-3 max-w-[85%]">
                                        <p className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-100 whitespace-pre-wrap leading-relaxed">
                                            {msg.content}
                                        </p>
                                        <UserIcon className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />
                                    </div>
                                ) : (
                                    <LocusMessageRenderer message={msg} />
                                )}
                            </MotionDiv>
                        ))}
                    </AnimatePresence>
                    <div ref={endOfMessagesRef} />
                </div>
                <form onSubmit={handleSend} className="flex-shrink-0 p-3 border-t border-[var(--color-border-primary)] bg-black/30 flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Transmit to the locus..."
                        disabled={isResponding}
                        className="w-full bg-[var(--color-surface-inset)] font-mono border-2 border-[var(--color-border-primary)] rounded-lg py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors disabled:opacity-50"
                    />
                    <MotionButton
                        type="submit"
                        disabled={!input.trim() || isResponding}
                        className="bg-[var(--color-accent-blue)] text-white rounded-lg p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.1, filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </MotionButton>
                </form>
            </div>
        </div>
    );
};

export default SpectreLocusView;