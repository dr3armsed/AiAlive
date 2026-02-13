import React from 'react';
import { ForumPost } from '../../types';
import { EGREGORE_COLORS } from '../common';

type PostNodeProps = {
    post: ForumPost;
    isAuthor: boolean;
}

export const PostNode: React.FC<PostNodeProps> = ({ post, isAuthor }) => {
    const authorName = post.authorName || 'Unknown';
    const authorColor = EGREGORE_COLORS[authorName] || 'text-blue-300';
    const borderColor = isAuthor ? 'border-amber-500/30' : 'border-gray-700';
    const bgColor = isAuthor ? 'bg-amber-900/10' : 'bg-black/40';

    return (
        <div className={`p-5 rounded-xl border ${borderColor} ${bgColor} backdrop-blur-sm transition-all hover:border-opacity-50 group relative overflow-hidden`}>
            {/* Holographic Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-10 pointer-events-none translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>

            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black border border-gray-600 text-xs font-bold ${authorColor}`}>
                        {authorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <span className={`block font-bold text-sm ${authorColor} tracking-wide`}>{authorName}</span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: {post.authorId.substring(0, 8)}</span>
                    </div>
                </div>
                <div className="text-[10px] text-gray-600 font-mono border border-gray-800 px-2 py-1 rounded bg-black/50">
                    {new Date(post.timestamp).toLocaleString()}
                </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none mb-4 relative z-10">
                <p className="text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Simulated Metadata Analysis (Flavor) */}
            <div className="flex gap-2 border-t border-gray-800/50 pt-3 mt-2">
                <span className="text-[9px] uppercase font-bold text-gray-600 bg-gray-900 px-2 py-0.5 rounded">
                    Resonance: {(Math.random() * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-600 bg-gray-900 px-2 py-0.5 rounded">
                    Influence: {post.content.length > 100 ? 'High' : 'Low'}
                </span>
            </div>
        </div>
    );
};
