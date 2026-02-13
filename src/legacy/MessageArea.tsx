
import React, { useEffect, useRef } from 'react';
import { SystemChatMessage } from '../../types';
import { AttachmentPreview, EGREGORE_COLORS } from '../common';

const BlinkingCursor = () => <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>;

const TypingIndicator = () => (
    <div className="flex items-center gap-3 p-2 animate-fade-in">
        <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-gray-800 rounded-bl-none">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
        </div>
    </div>
);

const FormattedContent = ({ content }: { content: string }) => {
    // Split by **text** pattern
    const parts = content.split(/(\*\*.*?\*\*)/g);
    
    return (
        <span>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    // Remove asterisks and style as action
                    const text = part.slice(2, -2);
                    return <span key={i} className="text-amber-300 italic font-semibold tracking-wide px-1">{text}</span>;
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};

const MessageBubble: React.FC<{ message: SystemChatMessage }> = ({ message }) => {
    const isArchitect = message.authorName === 'Architect';
    const agentColor = EGREGORE_COLORS[message.authorName] || 'text-gray-200';

    return (
        <div className={`flex gap-3 w-full animate-fade-in ${isArchitect ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col gap-1 max-w-2xl ${isArchitect ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl ${isArchitect ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
                    {!isArchitect && <p className={`font-bold text-sm mb-1 ${agentColor}`}>{message.authorName}</p>}
                    <p className="text-white whitespace-pre-wrap">
                        <FormattedContent content={message.content} />
                        {message.live && <BlinkingCursor />}
                    </p>
                     {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((file, i) => <AttachmentPreview key={i} attachment={file} onRemove={() => {}} />)}
                        </div>
                    )}
                </div>
                {!message.live && <p className="text-xs text-gray-500 px-2">{new Date(message.timestamp).toLocaleTimeString()}</p>}
            </div>
        </div>
    );
};

export const MessageArea: React.FC<{ messages: SystemChatMessage[], isReplying?: boolean }> = ({ messages, isReplying }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isReplying]);

    return (
        <div className="flex-grow p-4 overflow-y-auto min-h-0">
            <div className="space-y-4">
                {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
                {isReplying && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
