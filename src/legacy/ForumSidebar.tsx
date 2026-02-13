
import React from 'react';
import { ForumThread } from '../../types';
import { EGREGORE_COLORS } from '../common';

type Props = {
    threads: ForumThread[];
    selectedThreadId: string | null;
    onSelect: (id: string) => void;
    onCreateClick: () => void;
};

export const ForumSidebar: React.FC<Props> = ({ threads, selectedThreadId, onSelect, onCreateClick }) => {
    return (
        <aside className="w-1/3 max-w-md border-r border-cyan-500/10 bg-black/20 flex flex-col backdrop-blur-md">
            <div className="p-6 border-b border-cyan-500/10 flex justify-between items-center bg-black/40">
                <div>
                    <h2 className="text-xl font-bold text-cyan-400 tracking-wider font-mono">NOOSPHERE</h2>
                    <p className="text-[10px] text-cyan-600 uppercase tracking-widest">Public Discourse Node</p>
                </div>
                <button 
                    onClick={onCreateClick} 
                    className="text-xs bg-cyan-900/30 hover:bg-cyan-600/50 border border-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded transition-all hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                >
                    + New Vector
                </button>
            </div>
            
            <div className="p-3">
                <input 
                    type="text" 
                    placeholder="Search cognitive streams..." 
                    className="w-full bg-black/40 border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:border-cyan-500/50 outline-none"
                />
            </div>

            <nav className="flex-grow overflow-y-auto px-2 space-y-1 custom-scrollbar">
                {threads.map(thread => (
                    <button 
                        key={thread.id} 
                        onClick={() => onSelect(thread.id)} 
                        className={`w-full text-left p-3 rounded-lg transition-all group border ${selectedThreadId === thread.id ? 'bg-cyan-900/10 border-cyan-500/30' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-gray-800'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${selectedThreadId === thread.id ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                                {thread.tags[0] || 'General'}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">
                                {new Date(thread.lastActive).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={`font-bold text-sm truncate mb-1 ${selectedThreadId === thread.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                            {thread.title}
                        </p>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-gray-500">By <span className={EGREGORE_COLORS[thread.authorName]}>{thread.authorName}</span></span>
                            <span className="text-gray-600">{thread.posts.length} Nodes</span>
                        </div>
                    </button>
                ))}
            </nav>
        </aside>
    );
};
