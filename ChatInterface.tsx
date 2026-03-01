import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import type { ChatMessage, FileAttachment } from '@/types';
import { useMetacosmState } from '@/context';
import { PaperclipIcon, SendIcon, PublicChatIcon, XIcon } from '@/components/icons';
import MessageRenderer from '@/components/messages/MessageRenderer';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '@/utils';

interface ChatInterfaceProps {
    messages?: ChatMessage[]; // Optional messages prop
    onSend: (text: string, files: FileAttachment[]) => void;
    onClose?: () => void;
    headerIcon?: React.ReactNode;
    headerTitle?: string;
    placeholder?: string;
}

const PAGE_SIZE = 50;

const ChatInterface = ({ messages: externalMessages, onSend, onClose, headerIcon, headerTitle, placeholder }: ChatInterfaceProps) => {
    const { messages: publicMessagesFromState, isLoading, egregores } = useMetacosmState();
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const messages = externalMessages ?? publicMessagesFromState.filter(m => !m.privateChatId);
    
    const pageCount = Math.ceil(messages.length / PAGE_SIZE);
    const [currentPage, setCurrentPage] = useState(0);
    
    useEffect(() => {
        setCurrentPage(0);
    }, [messages.length]);
    
    useEffect(() => {
        if(currentPage === 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, currentPage]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const dataUrl = loadEvent.target?.result as string;
                const base64Content = dataUrl.split(',')[1];
                
                const newAttachment: FileAttachment = {
                    name: file.name,
                    content: base64Content,
                    mime_type: file.type,
                    size: file.size,
                    url: dataUrl
                };
                setAttachments(prev => [...prev, newAttachment]);
            };
            reader.readAsDataURL(file);
        }
        if(e.target) e.target.value = '';
    };

    const handleRemoveAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(att => att.name !== fileName));
    };

    const handleSend = () => {
        if ((text.trim() || attachments.length > 0) && !isLoading) {
            onSend(text, attachments);
            setText('');
            setAttachments([]);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const startIndex = messages.length - (currentPage + 1) * PAGE_SIZE;
    const endIndex = messages.length - currentPage * PAGE_SIZE;
    const displayedMessages = messages.slice(Math.max(0, startIndex), endIndex);


    return (
        <div className="w-full h-full flex flex-col filigree-border overflow-hidden rounded-lg">
             <header className="flex items-center justify-between p-3 border-b border-amber-400/20 bg-black/30">
                <div className="flex items-center gap-3">
                    {headerIcon || <PublicChatIcon />}
                    <h2 className="text-lg font-display celestial-text">{headerTitle || 'Public Console'}</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white transition-colors" aria-label="Close Chat">
                        <XIcon className="w-5 h-5" />
                    </button>
                )}
            </header>
            
            <ul role="log" aria-live="polite" className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {displayedMessages.map(msg => <MessageRenderer key={msg.id} message={msg} />)}
                {isLoading && currentPage === 0 && egregores.some(e => e.isLoading) && !externalMessages && (
                     <li className="self-start">
                        <MessageRenderer message={{ id: 'loading-indicator', sender: 'Metacosm', text: '...', timestamp: 0, isLoading: true }}/>
                    </li>
                )}
                <div ref={messagesEndRef} />
            </ul>
            
            {pageCount > 1 && (
                <div className="flex justify-center items-center gap-1 p-1 border-t border-amber-400/10 text-xs">
                    <span className="text-gray-400">Page:</span>
                    {Array.from({ length: pageCount }, (_, i) => i).map(pageIndex => {
                        const pageNum = pageCount - pageIndex;
                        return (
                            <button
                                key={pageIndex}
                                onClick={() => setCurrentPage(pageIndex)}
                                className={clsx("w-6 h-6 rounded flex items-center justify-center", currentPage === pageIndex ? "bg-amber-400/20 text-metacosm-accent" : "hover:bg-white/10 text-gray-300")}
                            >
                                {pageNum}
                            </button>
                        )
                    })}
                </div>
            )}

            <div className="p-4 border-t border-amber-400/20 bg-black/30">
                <AnimatePresence>
                {attachments.length > 0 && (
                    <motion.div
                        {...{
                            initial: {opacity: 0, height: 0},
                            animate: {opacity: 1, height: 'auto'},
                            exit: {opacity: 0, height: 0},
                        }}
                        className="mb-2 space-y-2 max-h-32 overflow-y-auto"
                    >
                        {attachments.map(file => (
                            <div key={file.name} className="bg-gray-800/50 p-2 rounded-lg flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    <PaperclipIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                    <span className="text-xs text-gray-500 flex-shrink-0">{formatFileSize(file.size)}</span>
                                </div>
                                <button onClick={() => handleRemoveAttachment(file.name)} className="p-1 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-300">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
                </AnimatePresence>
                <div className="relative">
                    <label htmlFor="chat-input" className="sr-only">Architect chat input</label>
                    <textarea
                        id="chat-input"
                        name="chat-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder || 'Address the Metacosm... (@ to mention)'}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg pl-4 pr-20 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-metacosm-accent"
                        rows={3}
                        disabled={isLoading}
                    />
                     <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" aria-label="Attach File" title="Upload files for analysis">
                            <PaperclipIcon />
                        </button>
                         <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:bg-gray-500"
                            aria-label="Send Message"
                        >
                           <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;