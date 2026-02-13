import React, { useState } from 'react';
import { SystemChatMessage } from '../../types';
import { AgentMind } from '../../core/agentMind';
import { AgentList } from './SystemConverse/AgentList';
import { ConversationPanel } from './SystemConverse/ConversationPanel';
import { AgentDetailPanel } from './SystemConverse/AgentDetailPanel';
import { SystemWorldPanel } from './SystemConverse/SystemWorldPanel';

type SystemConverseViewProps = {
    agents: Record<string, AgentMind>;
    onMutateAgent: (id: string) => void;
    chats: Record<string, SystemChatMessage[]>;
    onSendMessage: (agentId: string, content: string, files: File[]) => Promise<void>;
};

export const SystemConverseView: React.FC<SystemConverseViewProps> = ({ agents, onMutateAgent, chats, onSendMessage }) => {
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [activeTab, setActiveTab] = useState<'world' | 'direct'>('world');

    const selectedAgent = agents[selectedAgentId];

    const handleSend = async () => {
        if (selectedAgentId && (message.trim() || attachments.length > 0)) {
            setIsSending(true);
            await onSendMessage(selectedAgentId, message, attachments);
            setMessage('');
            setAttachments([]);
            setIsSending(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSelectAgent = (id: string) => {
        setSelectedAgentId(id);
        if (id) {
            setActiveTab('direct');
        }
    };

    return (
        <div className="h-full flex text-gray-300 font-sans">
            <AgentList
                agents={agents}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleSelectAgent}
            />
            <main className="flex-1 flex flex-col bg-black/10">
                <div className="flex border-b border-gray-700">
                    <button onClick={() => setActiveTab('world')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'world' ? 'text-white bg-gray-700/30' : 'text-gray-400 hover:bg-white/5'}`}>World Space</button>
                    <button onClick={() => setActiveTab('direct')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'direct' ? 'text-white bg-gray-700/30' : 'text-gray-400 hover:bg-white/5'}`}>Direct Conversation</button>
                </div>

                {activeTab === 'world' && (
                    <SystemWorldPanel
                        agents={Object.values(agents)}
                        selectedAgentId={selectedAgentId}
                        onSelectAgent={handleSelectAgent}
                    />
                )}
                
                {activeTab === 'direct' && (
                    <ConversationPanel
                        chats={chats}
                        selectedAgent={selectedAgent}
                        message={message}
                        setMessage={setMessage}
                        handleSend={handleSend}
                        attachments={attachments}
                        isSending={isSending}
                        onFileChange={handleFileChange}
                        onRemoveAttachment={handleRemoveAttachment}
                    />
                )}
            </main>
            <AgentDetailPanel
                agent={selectedAgent}
                onMutateAgent={onMutateAgent}
            />
        </div>
    );
};