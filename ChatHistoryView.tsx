


import React, { useState, useEffect, useMemo } from 'react';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { PrivateChat, PrivateChatId, ChatMessage, FileAttachment } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, UsersIcon } from '@/components/icons';
import ChatInterface from '@/components/ChatInterface';
import { THEMES } from '@/constants';
import { generateUUID } from '@/utils';
import DynamicPixelBackground from '@/components/DynamicPixelBackground';

interface ChatWindowProps {
    chat: PrivateChat;
    onSend: (chatId: PrivateChatId, text: string, files: FileAttachment[]) => void;
}

const ChatWindow = ({ chat, onSend }: ChatWindowProps) => {
    const { egregores, currentUser } = useMetacosmState();
    
    const handleSend = (text: string, files: FileAttachment[]) => {
        if (text.trim() || files.length > 0) {
            onSend(chat.id, text, files);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/20 filigree-border relative overflow-hidden">
            <DynamicPixelBackground pixelData={chat.currentBg} />
            <header className="p-4 border-b border-amber-400/10 bg-black/40 backdrop-blur-sm z-10">
                <h3 className="text-lg font-display celestial-text">{chat.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Participants:</span>
                    {chat.participants.map(pId => {
                         if (pId === 'Architect') {
                            return <UserAvatar key={pId} user={currentUser!} size="xs" />;
                        }
                        const egregore = egregores.find(e => e.id === pId);
                        return egregore ? <UserAvatar key={pId} egregore={egregore} size="xs" /> : null;
                    })}
                </div>
            </header>
            <div className="flex-1 overflow-y-auto z-10">
                 <ChatInterface
                    messages={chat.messages}
                    onSend={handleSend}
                    headerIcon={<div />} 
                    headerTitle="" 
                />
            </div>
        </div>
    )
};


interface ChatHistoryViewProps {
    onSendToPrivateChat: (chatId: PrivateChatId, text: string, files: FileAttachment[]) => void;
}

const ChatHistoryView = ({ onSendToPrivateChat }: ChatHistoryViewProps) => {
    const { privateChats, egregores, currentUser } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const [activeChatId, setActiveChatId] = useState<PrivateChatId | null>(null);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    useEffect(() => {
        if (privateChats.length > 0 && !privateChats.some(c => c.id === activeChatId)) {
            setActiveChatId(privateChats[0].id);
        } else if (privateChats.length === 0) {
            setActiveChatId(null);
        }
    }, [privateChats, activeChatId]);

    const activeChat = privateChats.find(c => c.id === activeChatId);
    
    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    const handleParticipantToggle = (id: string) => {
        setSelectedParticipants(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleCreateChat = () => {
        if (selectedParticipants.length < 1) return;
        
        const participantIds = selectedParticipants.sort();
        const chatId = `private-architect-${participantIds.join('-')}`;
        
        if (privateChats.some(c => c.id === chatId)) {
            setActiveChatId(chatId);
        } else {
            const participantNames = selectedParticipants.map(id => egregores.find(e => e.id === id)?.name || 'Unknown').join(', ');
            const chatName = `Architect, ${participantNames}`;
            const newChat: PrivateChat = {
                id: chatId,
                participants: ['Architect', ...participantIds].sort(),
                messages: [],
                name: chatName
            };
            dispatch({ type: 'CREATE_PRIVATE_CHAT', payload: newChat });
            setActiveChatId(chatId);
        }
        setIsCreatingChat(false);
        setSelectedParticipants([]);
    };


    return (
        <div 
            className="w-full h-full flex p-6 gap-6 relative"
        >
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <div className="w-1/3 h-full filigree-border p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-display celestial-text">Colloquies</h2>
                    <button onClick={() => setIsCreatingChat(c => !c)} className="p-2 rounded-full hover:bg-white/10 text-metacosm-accent" title="Create New Chat">
                        <UsersIcon />
                    </button>
                </div>
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
                    <AnimatePresence>
                    {isCreatingChat && (
                        <motion.div
                            {...{
                                initial: {opacity:0, height: 0},
                                animate: {opacity:1, height: 'auto'},
                                exit: {opacity:0, height: 0},
                            }}
                            className="bg-black/20 p-2 rounded-lg space-y-2 overflow-hidden"
                        >
                            <h3 className="text-sm font-bold text-metacosm-accent">Select Participants (up to 5)</h3>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {egregores.filter(e => !e.is_core_frf).map(e => (
                                    <button key={e.id} onClick={() => handleParticipantToggle(e.id)} disabled={selectedParticipants.length >= 5 && !selectedParticipants.includes(e.id)} className={clsx("w-full p-1.5 rounded-md flex items-center gap-2 text-left text-sm", selectedParticipants.includes(e.id) ? "bg-amber-400/30" : "bg-gray-800/50 hover:bg-gray-700/50", "disabled:opacity-50")}>
                                        <UserAvatar egregore={e} size="xs" />
                                        <span>{e.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleCreateChat} className="w-full p-2 text-sm bg-blue-600/50 text-blue-200 rounded-lg hover:bg-blue-500/50 disabled:opacity-50" disabled={selectedParticipants.length === 0}>Create Chat</button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    {privateChats.map(chat => (
                        <motion.button
                            key={chat.id}
                            layout
                            onClick={() => setActiveChatId(chat.id)}
                            className={clsx('w-full p-2 rounded-lg flex items-center gap-3 text-left transition-colors', activeChatId === chat.id ? 'bg-amber-400/20' : 'hover:bg-white/10')}
                        >
                            <div className="flex -space-x-2">
                               {chat.participants.map(pId => {
                                    if (pId === 'Architect') {
                                        return <UserAvatar key={pId} user={currentUser!} size="xs" />;
                                    }
                                    const egregore = egregores.find(e => e.id === pId);
                                    return egregore ? <UserAvatar key={pId} egregore={egregore} size="xs" /> : null;
                                })}
                            </div>
                            <span className="flex-1 truncate text-sm text-white">{chat.name}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
            <div className="w-2/3 h-full">
                <AnimatePresence mode="wait">
                    {activeChat ? (
                         <motion.div
                            key={activeChat.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                         >
                             <ChatWindow chat={activeChat} onSend={onSendToPrivateChat} />
                         </motion.div>
                    ) : (
                        <motion.div key="empty" className="flex items-center justify-center h-full filigree-border">
                            <p className="text-gray-500">Select a chat to view.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ChatHistoryView;