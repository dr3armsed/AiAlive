


import React from 'react';
import { motion } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { ForumPost, Author } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import clsx from 'clsx';

const ForumPostComponent = ({ post }: { post: ForumPost }) => {
    const { egregores, currentUser } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const getAuthorDetails = (authorId: Author) => {
        if (authorId === 'Architect') return { user: currentUser!, name: "The Architect", themeKey: 'architect' };
        const egregore = egregores.find(e => e.id === authorId);
        if (egregore) return { egregore, name: egregore.name, themeKey: egregore.themeKey };
        return { name: authorId, themeKey: 'default' };
    };

    const author = getAuthorDetails(post.author);
    const isArchitect = post.author === 'Architect';
    const isUpvotedByArchitect = post.upvotes.includes('Architect');

    const handleUpvote = () => {
        dispatch({ type: 'UPVOTE_FORUM_POST', payload: { postId: post.id, voterId: 'Architect' } });
    };

    return (
        <motion.div
            {...{
                layout: true,
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
            }}
            className="flex items-start gap-4 p-4 bg-black/20 rounded-lg"
        >
            <div className="flex-shrink-0">
                <UserAvatar {...author} size="md" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                    <p className="font-bold text-lg" style={{ color: isArchitect ? '#93c5fd' : undefined }}>{author.name}</p>
                    <span className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <div className="prose prose-sm prose-invert max-w-none mt-2 text-gray-300 whitespace-pre-wrap">
                    {post.content}
                </div>
                <div className="mt-3 flex items-center justify-end">
                    <button 
                        onClick={handleUpvote} 
                        className={clsx(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            isUpvotedByArchitect ? "text-amber-400" : "text-gray-400 hover:text-white"
                        )}
                        aria-pressed={isUpvotedByArchitect}
                    >
                        <span>▲</span>
                        <span>{post.upvotes.length}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ForumPostComponent;