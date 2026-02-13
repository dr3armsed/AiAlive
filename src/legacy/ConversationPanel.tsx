import React, { useEffect, useRef } from 'react';
import { SystemChatMessage } from '../../../types';
import { AgentMind } from '../../../core/agentMind';
import { AttachmentPreview, EGREGORE_COLORS } from '../../common';

const TypingIndicator = ({ agentName }: { agentName: string }) => (
    <div className="flex items-center gap-2 p-2">
        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${EGREGORE_COLORS[agentName] ? 'bg-opacity-50' : 'bg-gray-600'}`} 
             style={{backgroundColor: EGREGORE_COLORS[agentName] ? '' : undefined}}>
        </div>
        <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
        </div>
    </div>
);

// FIX: Typed ChatMessageBubble as React.FC to allow the 'key' prop during list rendering.
const ChatMessageBubble: React.FC<{ message: SystemChatMessage }> = ({ message }) => {
    const isArchitect = message.authorName === 'Architect';
    const agentColor = EGREGORE_COLORS[message.authorName] || 'text-gray-200';

    return (
        <div className={`flex gap-3 w-full ${isArchitect ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col gap-1 max-w-lg ${isArchitect ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl ${isArchitect ? 'bg-blue-600 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
                    {!isArchitect && <p className={`font-bold text-sm mb-1 ${agentColor}`}>{message.authorName}</p>}
                    <p className="text-white whitespace-pre-wrap">{message.content}</p>
                     {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((file, i) => <AttachmentPreview key={i} attachment={file} onRemove={() => {}} />)}
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 px-2">{new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
        </div>
    );
};


type ConversationPanelProps = {
    chats: Record<string, SystemChatMessage[]>;
    selectedAgent: AgentMind | undefined;
    message: string;
    setMessage: (message: string) => void;
    handleSend: () => void;
    attachments: File[];
    isSending: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveAttachment: (index: number) => void;
};

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
    selectedAgent,
    chats,
    message,
    setMessage,
    handleSend,
    attachments,
    isSending,
    onFileChange,
    onRemoveAttachment,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats, selectedAgent, isSending]);

    if (!selectedAgent) {
        return (
            <div className="flex-grow flex items-center justify-center text-gray-500">
                Select an agent to begin a conversation.
            </div>
        );
    }

    return (
        <>
            <div className="flex-grow p-4 overflow-y-auto space-y-4 min-h-0">
                {(chats[selectedAgent.id] || []).map(msg => <ChatMessageBubble key={msg.id} message={msg} />)}
                {isSending && <TypingIndicator agentName={selectedAgent.name} />}
                <div ref={messagesEndRef}></div>
            </div>
            <div className="p-3 border-t border-gray-700 bg-gray-900/50">
                {attachments.length > 0 && (
                    <div className="p-2 mb-2 border border-dashed border-gray-600 rounded-md">
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((file, i) => (
                                <AttachmentPreview key={i} attachment={{ fileName: file.name, fileType: file.type, url: URL.createObjectURL(file) }} onRemove={() => onRemoveAttachment(i)} />
                            ))}
                        </div>
                    </div>
                )}
                <div className="relative flex items-end gap-2">
                     <label className="p-2 text-gray-400 hover:text-white cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        <input type="file" multiple onChange={onFileChange} className="hidden" disabled={isSending} />
                    </label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyPress={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={`Message ${selectedAgent?.name || ''}...`}
                        className="w-full bg-gray-800 p-2 rounded-md resize-none max-h-40"
                        rows={1}
                        disabled={isSending}
                    />
                    <button onClick={handleSend} disabled={isSending} className="p-2 bg-blue-600 rounded-md hover:bg-blue-500 disabled:bg-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                </div>
            </div>
        </>
    );
};