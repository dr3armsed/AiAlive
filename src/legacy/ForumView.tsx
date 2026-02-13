
import React, { useState } from 'react';
import { Metacosm } from '../core/metacosm';
import { Attachment, ForumThread, ForumPost, UniversalFact } from '../types';
import { AttachmentPreview } from './common';
import { ForumSidebar } from './forum/ForumSidebar';
import { PostNode } from './forum/PostNode';
import { ConsensusMeter } from './forum/ConsensusMeter';

const CollectiveWisdomPanel = ({ facts }: { facts: UniversalFact[] }) => (
    <div className="mb-6 bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-lg">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Universal Truths (Layer 1)
        </h3>
        <div className="space-y-2">
            {facts.map(fact => (
                <div key={fact.id} className="text-xs text-gray-300 bg-black/20 p-2 rounded border-l-2 border-cyan-500/50">
                    <span className="text-[9px] uppercase text-cyan-600 font-bold mr-2">[{fact.category}]</span>
                    {fact.statement}
                </div>
            ))}
        </div>
    </div>
);

export const ForumView = ({ metacosm, onStateChange }: { metacosm: Metacosm, onStateChange: () => void }) => {
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [isCreatingThread, setIsCreatingThread] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);

    const threads = metacosm.state.forumThreads.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
    const selectedThread = threads.find(t => t.id === selectedThreadId);
    
    // Access Universal Facts from the Spine
    const universalFacts = metacosm.collectiveSpine.getUniversalFacts();

    // Set default selected thread if none selected and threads exist
    if (!selectedThreadId && threads.length > 0 && !isCreatingThread) {
        setSelectedThreadId(threads[0].id);
    }

    const handleReply = () => {
        if (!selectedThreadId || (!reply.trim() && attachments.length === 0)) return;
        
        const newPost: ForumPost = {
            id: `p_${Date.now()}_architect`,
            authorId: 'architect',
            authorName: 'Architect',
            content: reply,
            timestamp: new Date().toISOString()
        };

        const thread = metacosm.state.forumThreads.find(t => t.id === selectedThreadId);
        if (thread) {
            thread.posts.push(newPost);
            thread.lastActive = newPost.timestamp;
        }

        setReply('');
        setAttachments([]);
        onStateChange();
    };

    const handleCreateThread = () => {
        if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

        const newPost: ForumPost = {
            id: `p_${Date.now()}_architect`,
            authorId: 'architect',
            authorName: 'Architect',
            content: newThreadContent,
            timestamp: new Date().toISOString()
        };

        const newThread: ForumThread = {
            id: `t_${Date.now()}_architect`,
            title: newThreadTitle,
            authorId: 'architect',
            authorName: 'Architect',
            createdAt: newPost.timestamp,
            lastActive: newPost.timestamp,
            posts: [newPost],
            tags: ['General']
        };

        metacosm.state.forumThreads.push(newThread);
        setNewThreadTitle('');
        setNewThreadContent('');
        setIsCreatingThread(false);
        setSelectedThreadId(newThread.id);
        onStateChange();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    return (
        <div className="flex h-full bg-gradient-to-br from-gray-900 to-black rounded-xl border border-cyan-500/20 shadow-2xl overflow-hidden font-sans relative">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <ForumSidebar 
                threads={threads} 
                selectedThreadId={selectedThreadId} 
                onSelect={(id) => { setSelectedThreadId(id); setIsCreatingThread(false); }} 
                onCreateClick={() => setIsCreatingThread(true)} 
            />

            <main className="flex-1 flex flex-col bg-black/40 relative z-10 min-w-0">
                {isCreatingThread ? (
                    <div className="p-8 flex flex-col h-full max-w-3xl mx-auto w-full animate-fade-in">
                        <div className="mb-8">
                            <h3 className="text-3xl font-bold text-cyan-300 mb-2 font-mono">Initiate New Vector</h3>
                            <p className="text-sm text-gray-500">Begin a new thread of discourse within the Noosphere.</p>
                        </div>
                        
                        <div className="bg-black/30 border border-gray-700 p-6 rounded-xl shadow-lg">
                            <input 
                                type="text" 
                                value={newThreadTitle} 
                                onChange={e => setNewThreadTitle(e.target.value)} 
                                placeholder="Topic Subject / Thesis..." 
                                className="w-full bg-gray-900/50 border border-gray-700 p-4 rounded-lg text-white mb-4 focus:border-cyan-500 outline-none text-lg font-bold placeholder-gray-600 transition-colors"
                            />
                            <textarea 
                                value={newThreadContent} 
                                onChange={e => setNewThreadContent(e.target.value)} 
                                placeholder="Elaborate on your thought-form..." 
                                className="w-full bg-gray-900/50 border border-gray-700 p-4 rounded-lg text-white mb-6 min-h-[200px] resize-none focus:border-cyan-500 outline-none text-sm leading-relaxed placeholder-gray-600 transition-colors"
                            ></textarea>
                            
                            <div className="flex justify-end gap-4 border-t border-gray-800 pt-4">
                                <button onClick={() => setIsCreatingThread(false)} className="px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Abort</button>
                                <button onClick={handleCreateThread} className="px-8 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all transform hover:scale-[1.02]">
                                    Broadcast
                                </button>
                            </div>
                        </div>
                    </div>
                ) : selectedThread ? (
                    <>
                        <header className="p-6 border-b border-cyan-500/10 bg-black/40 backdrop-blur-md sticky top-0 z-20">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-bold text-white tracking-wide">{selectedThread.title}</h3>
                                <span className="px-2 py-1 bg-cyan-900/20 text-cyan-400 text-[10px] uppercase font-bold tracking-widest rounded border border-cyan-500/20">
                                    {selectedThread.tags[0] || 'Unclassified'}
                                </span>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-500 font-mono">
                                <span>Origin: {selectedThread.authorName}</span>
                                <span>&middot;</span>
                                <span>Initialized: {new Date(selectedThread.createdAt).toLocaleDateString()}</span>
                            </div>
                        </header>

                        <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                            <CollectiveWisdomPanel facts={universalFacts} />
                            <ConsensusMeter thread={selectedThread} />
                            
                            <div className="space-y-6">
                                {selectedThread.posts.map(post => (
                                    <PostNode key={post.id} post={post} isAuthor={post.authorId === 'architect'} />
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-cyan-500/10 bg-black/60 backdrop-blur-lg">
                            {attachments.length > 0 && (
                                <div className="p-3 mb-3 border border-dashed border-gray-600 rounded-lg bg-black/30">
                                    <div className="flex flex-wrap gap-3">
                                        {attachments.map((file, i) => (
                                            <AttachmentPreview key={i} attachment={{ fileName: file.name, fileType: file.type, url: URL.createObjectURL(file) }} onRemove={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                                <div className="relative bg-gray-900 rounded-lg p-1 flex items-end gap-2">
                                    <textarea 
                                        value={reply} 
                                        onChange={e => setReply(e.target.value)} 
                                        placeholder=" Contribute to the stream..." 
                                        className="w-full bg-transparent text-gray-200 placeholder-gray-600 text-sm p-3 focus:outline-none resize-none max-h-32" 
                                        rows={2}
                                    ></textarea>
                                    
                                    <div className="flex items-center gap-2 pb-2 pr-2">
                                        <label className="text-gray-500 hover:text-cyan-400 cursor-pointer transition-colors p-2">
                                            <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                        </label>
                                        <button 
                                            onClick={handleReply} 
                                            disabled={!reply.trim() && attachments.length === 0}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(8,145,178,0.3)]"
                                        >
                                            Transmit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-600 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z" /></svg>
                        <p className="font-mono text-xs uppercase tracking-widest">Select a cognitive stream to interface.</p>
                    </div>
                )}
            </main>
        </div>
    );
};
