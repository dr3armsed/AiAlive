


import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './ChatInterface';
import { PublicChatIcon, XIcon, DownloadIcon, CoreIcon } from './icons';
import type { FileAttachment, ChatMessage, PrivateChat, SystemUpgradeProposal, SystemModificationProposal, Egregore, User, MetacosmState, SpectreState, SpectreType } from '../types';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import clsx from 'clsx';
import MessageUpgradeProposal from './messages/MessageUpgradeProposal';
import MessageSystemModification from './messages/MessageSystemModification';
import saveAs from 'file-saver';
import { generateEgregorePrivateChatResponse } from '../services/geminiService';
import { generateUUID } from '../utils';

type Tab = 'public_chat' | 'upgrades' | 'triadic_chat';

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={clsx("px-4 py-2 text-sm font-medium transition-colors",
            active ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400 hover:text-white'
        )}
    >
        {children}
    </button>
);

const ProposedUpgradesView: React.FC = () => {
    const { messages } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const proposals = useMemo(() => {
        return messages.filter(m => (m.upgrade_proposal || m.system_modification_proposal) && (m.upgrade_proposal?.status === 'pending' || m.system_modification_proposal?.status === 'pending'));
    }, [messages]);

    const handleAcceptAll = () => {
        proposals.forEach(p => {
            if (p.upgrade_proposal) {
                dispatch({ type: 'RESOLVE_UPGRADE_PROPOSAL', payload: { proposalId: p.upgrade_proposal.id, status: 'approved' } });
            }
            if (p.system_modification_proposal) {
                 dispatch({ type: 'RESOLVE_SYSTEM_MODIFICATION', payload: { proposalId: p.system_modification_proposal.id, status: 'approved' } });
            }
        });
    };

     const handleRejectAll = () => {
        proposals.forEach(p => {
            if (p.upgrade_proposal) {
                dispatch({ type: 'RESOLVE_UPGRADE_PROPOSAL', payload: { proposalId: p.upgrade_proposal.id, status: 'denied' } });
            }
            if (p.system_modification_proposal) {
                 dispatch({ type: 'RESOLVE_SYSTEM_MODIFICATION', payload: { proposalId: p.system_modification_proposal.id, status: 'denied' } });
            }
        });
    };


    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-display text-metacosm-accent">Pending Upgrades</h3>
                <div className="flex gap-2">
                    <button onClick={handleAcceptAll} className="text-xs px-3 py-1 rounded bg-green-600/20 text-green-300 hover:bg-green-600/40">Accept All</button>
                    <button onClick={handleRejectAll} className="text-xs px-3 py-1 rounded bg-red-600/20 text-red-300 hover:bg-red-600/40">Reject All</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
                {proposals.length > 0 ? (
                    proposals.map(msg => {
                        if (msg.upgrade_proposal) return <MessageUpgradeProposal key={msg.id} message={msg} />;
                        if (msg.system_modification_proposal) return <MessageSystemModification key={msg.id} message={msg} />;
                        return null;
                    })
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No pending proposals.
                    </div>
                )}
            </div>
        </div>
    );
};

const ExportChatModal: React.FC<{
    messages: ChatMessage[];
    onClose: () => void;
}> = ({ messages, onClose }) => {
    const [fileType, setFileType] = useState<'txt' | 'json'>('txt');

    const handleExport = () => {
        let content = '';
        let mime = 'text/plain;charset=utf-8';
        let filename = `metacosm-chat.${fileType}`;

        if (fileType === 'json') {
            content = JSON.stringify(messages, null, 2);
            mime = 'application/json;charset=utf-8';
        } else {
            content = messages.map(msg => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender}: ${msg.text}`).join('\n');
        }

        const blob = new Blob([content], { type: mime });
        saveAs(blob, filename);
        onClose();
    };

    return (
        <motion.div
            {...{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
            }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <motion.div
                {...{
                    initial: { scale: 0.9 },
                    animate: { scale: 1 },
                    exit: { scale: 0.9 },
                }}
                className="filigree-border p-6 rounded-lg w-full max-w-sm"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-display celestial-text mb-4">Export Chat</h3>
                <div className="mb-4">
                    <label htmlFor="file-type" className="block text-sm text-gray-300 mb-1">File Format</label>
                    <select
                        id="file-type"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value as 'txt' | 'json')}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2"
                    >
                        <option value="txt">Plain Text (.txt)</option>
                        <option value="json">JSON (.json)</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm bg-gray-600/50 hover:bg-gray-500/50">Cancel</button>
                    <button onClick={handleExport} className="px-4 py-2 rounded-lg text-sm bg-blue-600/50 hover:bg-blue-500/50">Export</button>
                </div>
            </motion.div>
        </motion.div>
    );
};


interface PublicChatConsoleProps {
    onSend: (text: string, files: FileAttachment[]) => void;
    spectreState: SpectreState;
    setSpectreState: React.Dispatch<React.SetStateAction<SpectreState>>;
}

const PublicChatConsole: React.FC<PublicChatConsoleProps> = ({ onSend, spectreState, setSpectreState }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('public_chat');
    const [showExport, setShowExport] = useState(false);
    const { messages, egregores, architectName, currentUser } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const publicMessages = useMemo(() => messages.filter(m => !m.privateChatId), [messages]);
    const triadicChatMessages = useMemo(() => spectreState.chats['TriadicCore'] || [], [spectreState]);

    const handleSendToPublic = (text: string, files: FileAttachment[]) => {
        // Public chat does not support file attachments in this version.
        onSend(text, []);
    };
    
    const handleSendToTriadic = useCallback(async (text: string, files: FileAttachment[]) => {
        const architectMessage: ChatMessage = {
            id: generateUUID(),
            sender: 'Architect', text, file_attachments: files, timestamp: Date.now(),
        };

        const coreMembers = egregores.filter(e => e.is_core_frf);
        const participants = [currentUser!, ...coreMembers];

        // Update state immediately for responsiveness
        setSpectreState(prevState => {
            const newMemoryLog = [...(prevState.memory.TriadicCore.short_term_log || []), architectMessage];
            const newChatLog = [...(prevState.chats.TriadicCore || []), architectMessage];
            return {
                ...prevState,
                chats: { ...prevState.chats, TriadicCore: newChatLog },
                memory: { ...prevState.memory, TriadicCore: { ...prevState.memory.TriadicCore, short_term_log: newMemoryLog } }
            };
        });

        // Trigger responses from core members
        for (const core of coreMembers) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Stagger API calls
            if (core.is_frozen || !core.chat) continue;
             try {
                 const currentCollectiveMemory = spectreState.memory.TriadicCore;
                 // Ad-hoc chat object for the API call
                 const adHocChat: PrivateChat = {
                     id: 'private-chat-triadic-core',
                     name: 'Triadic Core Colloquy',
                     participants: ['Architect', ...coreMembers.map(c => c.id)],
                     messages: [...(currentCollectiveMemory.short_term_log || []), architectMessage]
                 };
                
                const responseText = await generateEgregorePrivateChatResponse(core, architectName, participants, adHocChat, currentCollectiveMemory);
                
                const responseMessage: ChatMessage = { id: generateUUID(), sender: core.id, text: responseText, timestamp: Date.now() };

                // Update state with the response
                setSpectreState(prevState => {
                    const updatedMemoryLog = [...(prevState.memory.TriadicCore.short_term_log || []), responseMessage];
                    const updatedChatLog = [...(prevState.chats.TriadicCore || []), responseMessage];
                    return {
                        ...prevState,
                        chats: { ...prevState.chats, TriadicCore: updatedChatLog },
                        memory: { ...prevState.memory, TriadicCore: { ...prevState.memory.TriadicCore, short_term_log: updatedMemoryLog } }
                    };
                });
                
             } catch (error) {
                console.error(`Triadic Core response failed for ${core.name}`, error);
             }
        }
    }, [setSpectreState, egregores, currentUser, architectName, spectreState.memory.TriadicCore]);

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        {...{
                            initial: { opacity: 0, y: 50, scale: 0.9 },
                            animate: { opacity: 1, y: 0, scale: 1 },
                            exit: { opacity: 0, y: 50, scale: 0.9 },
                            transition: { type: 'spring', stiffness: 250, damping: 25 },
                        }}
                        style={{
                            width: 'clamp(380px, 90vw, 420px)',
                            height: 'clamp(500px, 80vh, 700px)',
                        }}
                        className="bg-black/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
                    >
                         <div className="w-full h-full flex flex-col filigree-border overflow-hidden rounded-lg">
                            <header className="flex items-center justify-between p-3 border-b border-amber-400/20 bg-black/30">
                               <div className="flex items-center gap-2">
                                   <TabButton active={activeTab === 'public_chat'} onClick={() => setActiveTab('public_chat')}>Public</TabButton>
                                   <TabButton active={activeTab === 'upgrades'} onClick={() => setActiveTab('upgrades')}>Upgrades</TabButton>
                                   <TabButton active={activeTab === 'triadic_chat'} onClick={() => setActiveTab('triadic_chat')}>Core</TabButton>
                               </div>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => setShowExport(true)} className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors" title="Export Chat" aria-label="Export Public Chat Log">
                                        <DownloadIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full text-gray-400 hover:text-white transition-colors" aria-label="Close Chat">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </header>
                             <div className="flex-1 overflow-hidden">
                                 <AnimatePresence mode="wait">
                                    {activeTab === 'public_chat' && (
                                        <motion.div key="public" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="h-full">
                                            <ChatInterface onSend={handleSendToPublic} />
                                        </motion.div>
                                    )}
                                     {activeTab === 'upgrades' && (
                                        <motion.div key="upgrades" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="h-full">
                                            <ProposedUpgradesView />
                                        </motion.div>
                                    )}
                                     {activeTab === 'triadic_chat' && (
                                        <motion.div key="triadic" {...{initial:{opacity:0}, animate:{opacity:1}, exit:{opacity:0}}} className="h-full">
                                            <ChatInterface 
                                                onSend={handleSendToTriadic} 
                                                messages={triadicChatMessages} 
                                                headerIcon={<CoreIcon />} 
                                                headerTitle="Triadic Core" />
                                        </motion.div>
                                    )}
                                 </AnimatePresence>
                             </div>
                         </div>
                         <AnimatePresence>
                            {showExport && <ExportChatModal messages={publicMessages} onClose={() => setShowExport(false)} />}
                         </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                {...{
                    layoutId: "public-chat-bubble",
                    whileHover: { scale: 1.1 },
                    whileTap: { scale: 0.9 },
                }}
                onClick={() => setIsOpen(true)}
                className="absolute bottom-0 right-0 w-16 h-16 bg-metacosm-accent rounded-full flex items-center justify-center text-black shadow-lg"
                style={{ display: isOpen ? 'none' : 'flex' }}
                aria-label="Open Public Chat"
            >
                <PublicChatIcon />
            </motion.button>
        </div>
    );
};

export default PublicChatConsole;
