

import React from 'react';
import { useState, useMemo } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { DigitalSoul, DirectMessage, VFSNode } from '../../types/index.ts';
import PaperAirplaneIcon from '../../icons/PaperAirplaneIcon.tsx';
import PaperclipIcon from '../../icons/PaperclipIcon.tsx';
import NodeIcon from '../../vfs/NodeIcon.tsx';
import XIcon from '../../icons/XIcon.tsx';

const MotionDiv = motion.div as any;

interface MessageComposerProps {
    souls: DigitalSoul[];
    senderId: string;
    onSend: (recipientId: string, content: string, attachment?: DirectMessage['attachment']) => void;
    replyToRecipientId?: string; // If present, it's a reply
    onCancel?: () => void; // For new message composition
}

const flattenVFS = (node: VFSNode, path: string = ''): (VFSNode & {path: string})[] => {
    const currentPath = `${path}/${node.name}`;
    if (node.type === 'FILE') {
        return [{...node, path: currentPath}];
    }
    
    let children: (VFSNode & {path: string})[] = [];
    if (node.type === 'DIRECTORY') {
        node.children.forEach(child => {
            children = children.concat(flattenVFS(child, currentPath));
        });
    }
    return children;
};

const MessageComposer: React.FC<MessageComposerProps> = ({ souls, senderId, onSend, replyToRecipientId, onCancel }) => {
    const [content, setContent] = useState('');
    const [recipientId, setRecipientId] = useState(replyToRecipientId || '');
    const [attachment, setAttachment] = useState<VFSNode | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const sender = souls.find(s => s.id === senderId);
    const attachableFiles = useMemo(() => sender ? flattenVFS(sender.vfs).filter(n => n.type === 'FILE') : [], [sender]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientId || (!content.trim() && !attachment)) return;
        
        const attachmentData = attachment ? {
            nodeId: attachment.id,
            nodeName: attachment.name,
            nodeType: attachment.type,
            ownerId: senderId,
        } : undefined;

        onSend(recipientId, content, attachmentData);
        setContent('');
        setAttachment(null);
    };

    const handleSelectAttachment = (node: VFSNode) => {
        setAttachment(node);
        setIsPickerOpen(false);
    };

    const isReply = !!replyToRecipientId;

    if (!sender) return <div className="text-sm text-red-400">Error: Sender not found.</div>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 h-full">
            {!isReply && (
                <div className="flex-shrink-0">
                    <label htmlFor="recipient" className="sr-only">To:</label>
                    <select
                        id="recipient"
                        value={recipientId}
                        onChange={e => setRecipientId(e.target.value)}
                        className="w-full bg-[var(--color-surface-inset)] border-2 border-[var(--color-border-primary)] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors"
                    >
                        <option value="">Select a recipient...</option>
                        {souls.filter(s => s.id !== senderId).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                         <option value="user_id">The User</option>
                    </select>
                </div>
            )}
            
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your message..."
                className="flex-grow w-full bg-[var(--color-surface-inset)] border-2 border-[var(--color-border-primary)] rounded-lg py-2 px-3 text-sm text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors resize-none"
            />

            <AnimatePresence>
            {attachment && (
                <MotionDiv
                    layout
                    initial={{opacity: 0, height: 0, marginTop:0}}
                    animate={{opacity: 1, height: 'auto', marginTop: '0.5rem'}}
                    exit={{opacity: 0, height: 0, marginTop:0}}
                    className="overflow-hidden flex-shrink-0"
                >
                    <div className="p-2 bg-blue-900/40 rounded-md flex items-center justify-between gap-2 border border-blue-500/50">
                        <div className="flex items-center gap-2 min-w-0">
                            <NodeIcon node={attachment} className="w-5 h-5 flex-shrink-0"/>
                            <span className="text-sm text-blue-200 truncate">Attached: {attachment.name}</span>
                        </div>
                        <button type="button" onClick={() => setAttachment(null)} className="p-1 rounded-full text-blue-200 hover:bg-red-500/50">
                            <XIcon className="w-3 h-3"/>
                        </button>
                    </div>
                </MotionDiv>
            )}
            </AnimatePresence>
            
            <div className={`flex-shrink-0 flex items-center pt-2 ${isReply ? 'justify-end' : 'justify-between'}`}>
                 {!isReply && onCancel && (
                    <button type="button" onClick={onCancel} className="text-sm text-[var(--color-text-secondary)] hover:text-white px-4 py-2 rounded-md hover:bg-white/10">Cancel</button>
                 )}
                <div className="flex items-center gap-2">
                    <button type="button" title="Attach File" onClick={() => setIsPickerOpen(true)} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                        <PaperclipIcon className="w-6 h-6"/>
                    </button>
                    <button type="submit" disabled={!recipientId || (!content.trim() && !attachment)} className="flex items-center gap-2 font-semibold py-2 px-4 rounded-lg text-white bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-teal)] transition-all disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-700 shadow-lg shadow-blue-500/20">
                        <span>Send</span>
                        <PaperAirplaneIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isPickerOpen && (
                    <MotionDiv 
                        initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsPickerOpen(false)}
                    >
                        <MotionDiv 
                            initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}}
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                            className="glass-panel w-full max-w-lg h-full max-h-[70vh] flex flex-col p-4 border border-[var(--color-border-interactive)]"
                        >
                            <h3 className="text-lg font-bold text-white mb-3 flex-shrink-0">Attach from VFS</h3>
                            <div className="flex-grow overflow-y-auto bg-[var(--color-surface-inset)] rounded-lg p-2 space-y-1">
                                {attachableFiles.map(node => (
                                    <button
                                        key={node.id}
                                        type="button"
                                        onClick={() => handleSelectAttachment(node)}
                                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-blue-500/20 text-left"
                                    >
                                        <NodeIcon node={node} className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm text-white truncate">{node.name}</span>
                                    </button>
                                ))}
                                {attachableFiles.length === 0 && (
                                    <p className="text-sm text-center italic text-gray-500 py-4">No attachable files found in your VFS.</p>
                                )}
                            </div>
                        </MotionDiv>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </form>
    );
};

export default MessageComposer;