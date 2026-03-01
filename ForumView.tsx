

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { XIcon, MessageSquareIcon, SendIcon } from '@/components/icons';
import UserAvatar from '@/components/UserAvatar';
import type { ForumThread, ForumPost, Author } from '@/types';
import ForumPostComponent from '@/components/ForumPostComponent';
import { generateUUID } from '@/utils';

const ThreadRow = ({ thread, onSelect, postCounts }: { thread: ForumThread, onSelect: () => void, postCounts: Record<string, number> }) => {
    const { egregores, currentUser } = useMetacosmState();
    const getAuthor = (authorId: Author) => {
        if (authorId === 'Architect') return { user: currentUser };
        const egregore = egregores.find(e => e.id === authorId);
        if (egregore) return { egregore };
        return { name: authorId };
    };

    const authorDetails = getAuthor(thread.author);

    return (
        <motion.tr
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onSelect}
            className="border-b border-white/10 hover:bg-amber-400/10 cursor-pointer transition-colors"
        >
            <td className="p-4 flex items-center gap-3">
                 <UserAvatar {...authorDetails} size="sm" />
                <div>
                    <p className="font-bold text-white">{thread.title}</p>
                    <p className="text-xs text-gray-400">
                        by {authorDetails.egregore?.name || authorDetails.user?.username || authorDetails.name}
                    </p>
                </div>
            </td>
            <td className="p-4 text-center text-gray-300">{postCounts[thread.id] || 0}</td>
            <td className="p-4 text-right text-gray-400 text-sm hidden md:table-cell">
                {new Date(thread.lastActivity).toLocaleString()}
            </td>
        </motion.tr>
    );
};

const NewThreadModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (title: string, content: string) => void }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            onCreate(title, content);
            onClose();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="filigree-border w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <h2 className="text-2xl font-display celestial-text">Start a New Discussion</h2>
                    <div>
                        <label htmlFor="thread-title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input id="thread-title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" />
                    </div>
                    <div>
                        <label htmlFor="thread-content" className="block text-sm font-medium text-gray-300 mb-1">First Post</label>
                        <textarea id="thread-content" value={content} onChange={e => setContent(e.target.value)} required rows={8} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2 resize-y" />
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-600/50 hover:bg-gray-500/50">Cancel</button>
                        <button type="submit" disabled={!title.trim() || !content.trim()} className="px-4 py-2 text-sm rounded-lg bg-blue-600/50 hover:bg-blue-500/50 disabled:opacity-50">Create Thread</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const ThreadDetailView = ({ thread, posts, onBack }: { thread: ForumThread, posts: ForumPost[], onBack: () => void }) => {
    const dispatch = useMetacosmDispatch();
    const [reply, setReply] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleReply = () => {
        if (!reply.trim()) return;
        const newPost: ForumPost = {
            id: `post-architect-${Date.now()}`,
            threadId: thread.id,
            author: 'Architect',
            content: reply,
            timestamp: Date.now(),
            upvotes: [],
        };
        dispatch({ type: 'CREATE_FORUM_POST', payload: newPost });
        setReply('');
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [posts]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-amber-400/20">
                <div>
                    <button onClick={onBack} className="text-sm text-gray-400 hover:text-white mb-2">← Back to Forum</button>
                    <h2 className="text-2xl font-display text-metacosm-accent">{thread.title}</h2>
                </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {posts.map(post => <ForumPostComponent key={post.id} post={post} />)}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 pt-4 border-t border-amber-400/20">
                <div className="relative">
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Write your reply..." className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 pr-14 resize-y" />
                    <button onClick={handleReply} disabled={!reply.trim()} className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ForumView = () => {
    const { forum_threads, forum_posts } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

    const postCounts = useMemo(() => {
        return forum_posts.reduce((acc, post) => {
            acc[post.threadId] = (acc[post.threadId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [forum_posts]);

    const sortedThreads = useMemo(() => {
        return [...forum_threads].sort((a, b) => b.lastActivity - a.lastActivity);
    }, [forum_threads]);
    
    const handleCreateThread = (title: string, content: string) => {
        const newThread: ForumThread = {
            id: `thread-architect-${Date.now()}`,
            title,
            author: 'Architect',
            timestamp: Date.now(),
            lastActivity: Date.now(),
            isLocked: false,
        };
        dispatch({ type: 'CREATE_FORUM_THREAD', payload: newThread });

        const newPost: ForumPost = {
            id: `post-architect-${Date.now()}`,
            threadId: newThread.id,
            author: 'Architect',
            content,
            timestamp: Date.now(),
            upvotes: [],
        };
        dispatch({ type: 'CREATE_FORUM_POST', payload: newPost });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `The Architect started a new discussion: "${title}"` });
    };

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };
    
    const selectedThread = selectedThreadId ? sortedThreads.find(t => t.id === selectedThreadId) : null;
    const selectedThreadPosts = selectedThreadId ? forum_posts.filter(p => p.threadId === selectedThreadId) : [];

    return (
        <div className="w-full h-full p-6 flex flex-col relative">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
            <AnimatePresence>
                {isCreating && <NewThreadModal onClose={() => setIsCreating(false)} onCreate={handleCreateThread} />}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
            {selectedThread ? (
                <motion.div key="detail" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col">
                    <ThreadDetailView thread={selectedThread} posts={selectedThreadPosts} onBack={() => setSelectedThreadId(null)} />
                </motion.div>
            ) : (
                <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <MessageSquareIcon className="w-10 h-10 text-metacosm-accent" />
                            <h1 className="text-4xl font-display celestial-text">Public Forum</h1>
                        </div>
                        <button onClick={() => setIsCreating(true)} className="px-4 py-2 rounded-lg bg-blue-600/50 hover:bg-blue-500/50 text-blue-200">
                            New Thread
                        </button>
                    </div>
                     <p className="text-gray-400 mb-6 max-w-3xl">A persistent, asynchronous communication channel for all entities within the Metacosm. Here, ideas are debated, warnings are posted, and collaborations are forged.</p>
                     
                     <div className="flex-1 filigree-border overflow-hidden">
                        <table className="w-full table-fixed">
                            <thead className="border-b border-white/10">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-400 w-3/5">Topic</th>
                                    <th className="p-4 text-center font-semibold text-gray-400 w-1/5">Replies</th>
                                    <th className="p-4 text-right font-semibold text-gray-400 w-1/5 hidden md:table-cell">Last Activity</th>
                                </tr>
                            </thead>
                        </table>
                        <div className="overflow-y-auto h-[calc(100%-49px)]">
                             <table className="w-full table-fixed">
                                <tbody>
                                {sortedThreads.length > 0 ? (
                                    sortedThreads.map(thread => <ThreadRow key={thread.id} thread={thread} onSelect={() => setSelectedThreadId(thread.id)} postCounts={postCounts}/>)
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-gray-500">The forum is silent.</td>
                                    </tr>
                                )}
                                </tbody>
                             </table>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default ForumView;