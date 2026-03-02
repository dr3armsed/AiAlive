

import React from 'react';
import { useState, useMemo } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { DigitalSoul, DirectMessage, CollaborationInvite, VFSNode } from '../../types/index.ts';
import InboxIcon from '../../icons/InboxIcon.tsx';
import ShieldCheckIcon from '../../icons/ShieldCheckIcon.tsx';
import MessageComposer from './MessageComposer.tsx';
import PencilIcon from '../../icons/PencilIcon.tsx';
import NodeIcon from '../../vfs/NodeIcon.tsx';
import DownloadIcon from '../../icons/DownloadIcon.tsx';
import PaperclipIcon from '../../icons/PaperclipIcon.tsx';
import XIcon from '../../icons/XIcon.tsx';
import PaperAirplaneIcon from '../../icons/PaperAirplaneIcon.tsx';

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

interface InboxViewProps {
  souls: DigitalSoul[];
  directMessages: DirectMessage[];
  invites: CollaborationInvite[];
  selectedSoulId: string | null;
  onRespondToInvite: (inviteId: string, response: 'accepted' | 'rejected') => void;
  onSendDirectMessage: (senderId: string, recipientId: string, content: string, attachment?: DirectMessage['attachment']) => void;
  onSaveAttachment: (recipientId: string, attachment: Required<DirectMessage>['attachment']) => void;
}

type SelectedItem = { type: 'invite', id: string } | { type: 'dm', id: string };

const InboxView: React.FC<InboxViewProps> = ({ souls, directMessages, invites, selectedSoulId, onRespondToInvite, onSendDirectMessage, onSaveAttachment }) => {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  const getSoulName = (id: string) => souls.find(s => s.id === id)?.name || 'Unknown Soul';

  const pendingInvites = useMemo(() => invites.filter(i => i.status === 'pending'), [invites]);

  const conversations = useMemo(() => {
    const convos: { [key: string]: { participants: [string, string], messages: DirectMessage[], lastMessage: DirectMessage } } = {};
    directMessages.forEach(dm => {
        const participants = [dm.senderId, dm.recipientId].sort() as [string, string];
        const key = participants.join('-');
        if (!convos[key]) {
            convos[key] = { participants, messages: [], lastMessage: dm };
        }
        convos[key].messages.push(dm);
        if (dm.timestamp > convos[key].lastMessage.timestamp) {
            convos[key].lastMessage = dm;
        }
    });

    Object.values(convos).forEach(convo => {
      convo.messages.sort((a,b) => a.timestamp - b.timestamp);
    });

    return Object.values(convos).sort((a,b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  }, [directMessages]);
  
  const handleSendMessage = (recipientId: string, content: string, attachment?: DirectMessage['attachment']) => {
    if (!selectedSoulId) {
        alert("Please select a soul from the main list to act as the sender.");
        return;
    };
    onSendDirectMessage(selectedSoulId, recipientId, content, attachment);
    if (isComposing) {
        setIsComposing(false);
    }
  };

  const selectedInvite = selectedItem?.type === 'invite' ? invites.find(i => i.id === selectedItem.id) : null;
  const selectedDMConvo = selectedItem?.type === 'dm' ? conversations.find(c => c.participants.join('-') === selectedItem.id) : null;
  const canCompose = !!selectedSoulId;

  return (
    <div className="h-full flex flex-col">
        <div className="flex-shrink-0 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg shadow-lg shadow-blue-500/20">
                    <InboxIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Inbox</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm font-mono">Private communications between souls.</p>
                </div>
            </div>
            <MotionButton 
                onClick={() => setIsComposing(true)}
                disabled={!canCompose}
                className="flex items-center gap-2 font-semibold py-2 px-4 rounded-lg text-white bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-teal)] transition-all disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                whileHover={{scale: canCompose ? 1.05 : 1, y: canCompose ? -2 : 0}}
                whileTap={{scale: canCompose ? 0.95 : 1}}
            >
                <PencilIcon className="w-4 h-4" />
                Compose
            </MotionButton>
        </div>

        <AnimatePresence>
            {isComposing && canCompose && (
                 <MotionDiv 
                    initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsComposing(false)}
                 >
                    <MotionDiv 
                        initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                        className="glass-panel w-full max-w-2xl flex flex-col p-4 border border-[var(--color-border-interactive)]"
                    >
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold text-white">New Message</h3>
                             <button onClick={() => setIsComposing(false)} className="p-1.5 rounded-full hover:bg-white/10"><XIcon className="w-6 h-6"/></button>
                         </div>
                        <MessageComposer souls={souls} senderId={selectedSoulId!} onSend={handleSendMessage} onCancel={() => setIsComposing(false)}/>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>

        <div className="flex-grow grid grid-cols-12 gap-6 min-h-0">
            {/* Left Panel: Listings */}
            <div className="col-span-5 xl:col-span-4 h-full flex flex-col gap-6 overflow-y-auto pr-2 -mr-3">
                <div>
                    <h4 className="font-semibold text-[var(--color-text-secondary)] mb-2 px-1">Invites</h4>
                    <div className="space-y-2">
                    {pendingInvites.length > 0 ? pendingInvites.map(invite => (
                        <MotionButton
                            key={invite.id} layout
                            onClick={() => setSelectedItem({ type: 'invite', id: invite.id })}
                            className={`w-full p-3 rounded-lg text-left transition-colors bg-[var(--color-surface-2)] border ${selectedItem?.id === invite.id ? 'border-[var(--color-border-interactive)]' : 'border-transparent hover:border-[var(--color-border-primary)]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">From: {getSoulName(invite.senderId)}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)] truncate">To: {getSoulName(invite.recipientId)}</p>
                                </div>
                            </div>
                        </MotionButton>
                    )) : <p className="text-xs text-center italic text-[var(--color-text-tertiary)] py-2">No pending invites.</p>}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-[var(--color-text-secondary)] mb-2 px-1">Conversations</h4>
                    <div className="space-y-2">
                        {conversations.map(convo => {
                            const convoId = convo.participants.join('-');
                            const otherParticipant = convo.participants.find(p => p !== selectedSoulId) || convo.participants[0];
                            const otherParticipantName = getSoulName(otherParticipant);
                            return (
                                <MotionButton
                                    key={convoId} layout
                                    onClick={() => setSelectedItem({ type: 'dm', id: convoId })}
                                    className={`w-full p-3 rounded-lg text-left transition-colors bg-[var(--color-surface-2)] border ${selectedItem?.id === convoId ? 'border-[var(--color-border-interactive)]' : 'border-transparent hover:border-[var(--color-border-primary)]'}`}
                                >
                                    <p className="text-sm font-semibold text-white truncate">{otherParticipantName}</p>
                                    <div className="text-xs text-[var(--color-text-secondary)] truncate mt-1 flex items-center gap-1.5">
                                        {convo.lastMessage.attachment && <PaperclipIcon className="w-3 h-3 flex-shrink-0" />}
                                        <span className="font-semibold">{getSoulName(convo.lastMessage.senderId) === otherParticipantName ? "" : "You: "}</span>
                                        <span>{convo.lastMessage.content || "Attachment"}</span>
                                    </div>
                                </MotionButton>
                            )
                        })}
                         {conversations.length === 0 && <p className="text-xs text-center italic text-[var(--color-text-tertiary)] py-2">No direct messages.</p>}
                    </div>
                </div>
            </div>

            {/* Right Panel: Details */}
            <div className="col-span-7 xl:col-span-8 h-full bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border-secondary)]">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={selectedItem?.id || 'empty'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                    {selectedItem === null ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-[var(--color-text-secondary)]">
                            <InboxIcon className="w-16 h-16 opacity-10 mb-4" />
                            <h3 className="text-xl font-semibold text-white/80">Inbox</h3>
                            <p>Select an item to view its contents.</p>
                            {!canCompose && <p className="mt-2 text-sm text-yellow-400/80">Select your soul from the main list to send messages.</p>}
                        </div>
                    ) : selectedInvite ? (
                        <div className="h-full flex flex-col p-4">
                             <h3 className="text-xl font-bold text-white mb-1">Invite from {getSoulName(selectedInvite.senderId)}</h3>
                             <p className="text-sm text-[var(--color-text-tertiary)] font-mono border-b border-[var(--color-border-secondary)] pb-3">To: {getSoulName(selectedInvite.recipientId)}</p>
                             <div className="my-4 p-4 bg-black/20 rounded-lg flex-grow">
                                <p className="italic text-[var(--color-text-secondary)]">"{selectedInvite.message}"</p>
                             </div>
                             <div className="flex items-center justify-end gap-4">
                                 <button onClick={() => onRespondToInvite(selectedInvite.id, 'rejected')} disabled={!selectedSoulId || selectedSoulId !== selectedInvite.recipientId} className="py-2 px-4 rounded-lg font-semibold text-white bg-red-600/80 hover:bg-red-600 transition-colors disabled:opacity-50">Reject</button>
                                <button onClick={() => onRespondToInvite(selectedInvite.id, 'accepted')} disabled={!selectedSoulId || selectedSoulId !== selectedInvite.recipientId} className="py-2 px-4 rounded-lg font-semibold text-white bg-green-600/80 hover:bg-green-600 transition-colors disabled:opacity-50">Accept</button>
                             </div>
                        </div>
                    ) : selectedDMConvo ? (
                        <div className="h-full flex flex-col overflow-hidden">
                            <h3 className="text-lg font-bold text-white p-4 border-b border-[var(--color-border-primary)]">
                                {getSoulName(selectedDMConvo.participants.find(p => p !== selectedSoulId) || selectedDMConvo.participants[0])}
                            </h3>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {selectedDMConvo.messages.map(dm => {
                                    const senderName = getSoulName(dm.senderId);
                                    const isSenderCurrentUser = dm.senderId === selectedSoulId;
                                    const attachment = dm.attachment ? { ...dm.attachment, ownerId: dm.senderId } : undefined;
                                    return (
                                        <div key={dm.id} className={`flex flex-col gap-1 w-full ${isSenderCurrentUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-end gap-2 max-w-[85%] ${(isSenderCurrentUser ? 'flex-row-reverse' : 'flex-row')}`}>
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-md">{senderName.charAt(0)}</div>
                                                <div className={`flex flex-col gap-2 p-3 rounded-2xl shadow-lg ${isSenderCurrentUser ? 'bg-blue-800/50 rounded-br-none' : 'bg-gray-800/50 rounded-bl-none'}`}>
                                                    {dm.content && <p className="text-sm text-white">{dm.content}</p>}
                                                    {attachment && (
                                                        <div className="mt-1 p-2 bg-black/30 rounded-md flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <NodeIcon node={{
                                                                    id: attachment.nodeId,
                                                                    name: attachment.nodeName,
                                                                    type: attachment.nodeType,
                                                                    parentId: 'unknown',
                                                                    createdAt: Date.now(),
                                                                    modifiedAt: Date.now(),
                                                                    permissions: new Map(),
                                                                    ...(attachment.nodeType === 'DIRECTORY' ? { children: [] } : { content: '', mimeType: '', versionHistory: [], size: 0 })
                                                                } as VFSNode} className="w-6 h-6 flex-shrink-0" />
                                                                <span className="text-sm text-white truncate">{attachment.nodeName}</span>
                                                            </div>
                                                            <button onClick={() => onSaveAttachment(dm.recipientId, attachment)} disabled={selectedSoulId !== dm.recipientId} className="flex-shrink-0 p-1.5 bg-blue-500/50 text-white rounded hover:bg-blue-500/80 disabled:opacity-30 disabled:cursor-not-allowed" title={selectedSoulId === dm.recipientId ? 'Save to your VFS' : 'You cannot save this attachment'}>
                                                                <DownloadIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex-shrink-0 p-2 border-t border-[var(--color-border-primary)] bg-[var(--color-surface-inset)]">
                                {canCompose && selectedDMConvo.participants.includes(selectedSoulId) ?
                                    <MessageComposer souls={souls} senderId={selectedSoulId} onSend={handleSendMessage} replyToRecipientId={selectedDMConvo.participants.find(p => p !== selectedSoulId)} />
                                : <p className="text-xs text-center text-yellow-400/80 p-2">Select a soul you are a part of to reply.</p>
                                }
                            </div>
                        </div>
                    ) : null}
                    </MotionDiv>
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};

export default InboxView;