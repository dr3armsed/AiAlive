
import React, { useMemo } from 'react';
import { ForumThread } from '../../types';

export const ConsensusMeter = ({ thread }: { thread: ForumThread }) => {
    const stats = useMemo(() => {
        const postCount = thread.posts.length;
        const totalChars = thread.posts.reduce((acc, p) => acc + p.content.length, 0);
        const avgLength = totalChars / postCount;
        
        // Simulation of "Entropy" based on thread chaos (short, rapid posts vs long treatises)
        // In a real app, this would use sentiment analysis.
        const entropyScore = Math.min(100, Math.max(0, (postCount * 5) - (avgLength / 10)));
        const resonanceScore = 100 - entropyScore;

        let state = 'Balanced';
        let color = 'text-blue-400';
        if (entropyScore > 75) { state = 'High Entropy (Schism Imminent)'; color = 'text-red-400'; }
        if (resonanceScore > 75) { state = 'High Resonance (Consensus Reached)'; color = 'text-green-400'; }

        return { entropyScore, resonanceScore, state, color };
    }, [thread]);

    return (
        <div className="bg-black/40 border border-gray-800 p-4 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Discourse Topology</span>
                <span className={`text-xs font-bold ${stats.color} font-mono`}>{stats.state}</span>
            </div>
            
            <div className="flex items-center gap-4 w-1/2">
                <div className="text-[10px] text-gray-500 font-mono">ORDER</div>
                <div className="flex-grow h-2 bg-gray-800 rounded-full overflow-hidden relative">
                    <div 
                        className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
                        style={{ width: `${stats.resonanceScore}%` }}
                    ></div>
                    <div 
                        className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-red-600 to-orange-400 transition-all duration-1000"
                        style={{ width: `${stats.entropyScore}%` }}
                    ></div>
                    {/* Center Marker */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2"></div>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">CHAOS</div>
            </div>
        </div>
    );
};
