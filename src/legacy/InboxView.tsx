
import React, { useState, useMemo } from 'react';
import { InboxMessage, InboxMessageType, Attachment } from '../types';
import { AttachmentPreview } from './common';

// --- Assets & Icons ---
const Icons = {
    system: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
    agent: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>,
    financial: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>,
    alert: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    anomaly: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
};

const TypeColors: Record<InboxMessageType, string> = {
    system: 'text-cyan-400',
    agent: 'text-purple-400',
    financial: 'text-green-400',
    alert: 'text-yellow-400',
    anomaly: 'text-red-500'
};

const PriorityBorders: Record<string, string> = {
    low: 'border-l-transparent',
    normal: 'border-l-blue-500',
    high: 'border-l-yellow-500',
    critical: 'border-l-red-500 shadow-[inset_4px_0_0_0_rgba(239,68,68,0.5)]'
};

const MessageListItem: React.FC<{ msg: InboxMessage, isSelected: boolean, onClick: () => void }> = ({ msg, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 border-b border-gray-800 transition-all duration-200 group relative overflow-hidden
                ${isSelected ? 'bg-white/5' : 'hover:bg-white/5'}
                ${!msg.read ? 'bg-gradient-to-r from-blue-900/10 to-transparent' : ''}
                border-l-4 ${PriorityBorders[msg.priority]}
            `}
        >
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    <span className={`${TypeColors[msg.type]} opacity-80`}>{Icons[msg.type]}</span>
                    <span className={`font-bold text-sm ${!msg.read ? 'text-white' : 'text-gray-400'}`}>
                        {msg.senderName}
                    </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                    {new Date(msg.timestamp).toLocaleDateString()}
                </span>
            </div>
            <div className="flex justify-between items-end">
                <p className={`text-xs truncate max-w-[80%] ${!msg.read ? 'text-gray-200 font-semibold' : 'text-gray-500'}`}>
                    {msg.subject}
                </p>
                {!msg.read && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
            </div>
        </button>
    );
};

// --- Main Component ---

type InboxViewProps = {
    messages: InboxMessage[];
    onMessageAction: (action: string, messageId: string) => void;
};

export const InboxView: React.FC<InboxViewProps> = ({ messages, onMessageAction }) => {
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'agent'>('all');
    const [search, setSearch] = useState('');

    const selectedMessage = messages.find(m => m.id === selectedMessageId);

    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            const matchesSearch = msg.subject.toLowerCase().includes(search.toLowerCase()) || 
                                  msg.content.toLowerCase().includes(search.toLowerCase()) ||
                                  msg.senderName.toLowerCase().includes(search.toLowerCase());
            
            if (!matchesSearch) return false;

            if (filter === 'unread') return !msg.read;
            if (filter === 'critical') return msg.priority === 'critical' || msg.priority === 'high';
            if (filter === 'agent') return msg.type === 'agent';
            return true;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [messages, filter, search]);

    const handleSelect = (id: string) => {
        setSelectedMessageId(id);
        const msg = messages.find(m => m.id === id);
        if (msg && !msg.read) {
            onMessageAction('mark_read', id);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onMessageAction('delete', id);
        if (selectedMessageId === id) setSelectedMessageId(null);
    };

    const handleMarkAllRead = () => {
        messages.filter(m => !m.read).forEach(m => onMessageAction('mark_read', m.id));
    };

    return (
        <div className="flex h-full bg-black/40 rounded-xl border border-gray-700 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Sidebar List */}
            <aside className="w-1/3 min-w-[300px] border-r border-gray-700 flex flex-col bg-gray-900/50">
                <div className="p-4 border-b border-gray-700 bg-black/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            INBOX
                        </h2>
                        <button onClick={handleMarkAllRead} className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors">
                            Mark All Read
                        </button>
                    </div>
                    
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                        {['all', 'unread', 'critical', 'agent'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                    filter === f 
                                    ? 'bg-blue-600 border-blue-500 text-white' 
                                    : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search archives..."
                        className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none placeholder-gray-600 font-mono"
                    />
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {filteredMessages.length > 0 ? (
                        filteredMessages.map(msg => (
                            <MessageListItem 
                                key={msg.id} 
                                msg={msg} 
                                isSelected={selectedMessageId === msg.id} 
                                onClick={() => handleSelect(msg.id)} 
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                            <p className="text-sm font-mono">No transmissions found.</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Detail View */}
            <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-black relative">
                {selectedMessage ? (
                    <div className="flex flex-col h-full animate-fade-in">
                        {/* Detail Header */}
                        <header className="p-6 border-b border-gray-800 bg-black/20">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg bg-gray-800 ${TypeColors[selectedMessage.type]}`}>
                                            {Icons[selectedMessage.type]}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white leading-tight">{selectedMessage.subject}</h3>
                                            <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                                                FROM: <span className="text-white font-bold">{selectedMessage.senderName}</span>
                                                <span className="text-gray-600">|</span>
                                                ID: {selectedMessage.senderId}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => handleDelete(selectedMessage.id, e)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                        title="Delete Message"
                                    >
                                        {Icons.trash}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs font-mono text-gray-500 uppercase tracking-widest">
                                <span>Time: {new Date(selectedMessage.timestamp).toLocaleString()}</span>
                                <span className={`px-2 py-0.5 rounded border ${
                                    selectedMessage.priority === 'critical' ? 'border-red-500 text-red-500' :
                                    selectedMessage.priority === 'high' ? 'border-yellow-500 text-yellow-500' :
                                    'border-gray-700 text-gray-600'
                                }`}>
                                    Priority: {selectedMessage.priority}
                                </span>
                            </div>
                        </header>

                        {/* Content */}
                        <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
                            <div className="prose prose-invert prose-sm max-w-none text-gray-300 font-serif leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.content}
                            </div>

                            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-gray-800">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Attachments</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMessage.attachments.map((att, i) => (
                                            <AttachmentPreview key={i} attachment={att} onRemove={() => {}} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="p-4 border-t border-gray-800 bg-black/40 flex justify-end gap-3">
                            {selectedMessage.type === 'agent' && (
                                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded shadow-lg shadow-purple-900/20 transition-all">
                                    Open Cognitive Conduit
                                </button>
                            )}
                            {selectedMessage.type === 'financial' && (
                                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black text-sm font-bold rounded shadow-lg shadow-green-900/20 transition-all">
                                    View Transaction
                                </button>
                            )}
                            {selectedMessage.dataPayload && selectedMessage.dataPayload.agentId && (
                                <button 
                                    onClick={() => onMessageAction('navigate_to_agent', selectedMessage.id)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded shadow-lg shadow-blue-900/20 transition-all"
                                >
                                    Jump to Simulation
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <p className="font-mono text-sm tracking-widest uppercase">Select a transmission to decode</p>
                    </div>
                )}
            </main>
        </div>
    );
};
