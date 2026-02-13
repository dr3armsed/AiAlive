
import React from 'react';
import { AgentMind } from '../../core/agentMind';
import { MemoryRecord, NarrativeMemory, EpochMemory } from '../../types';

type Props = {
    agentMind: AgentMind;
};

const WorkingMemoryCard: React.FC<{ memory: MemoryRecord }> = ({ memory }) => (
    <div className="bg-black/30 border border-gray-800 p-2 rounded text-xs mb-1 hover:border-gray-600 transition-colors">
        <div className="flex justify-between text-gray-500 mb-1">
            <span className="uppercase font-bold text-[9px]">{memory.type}</span>
            <span>{new Date(memory.timestamp).toLocaleTimeString()}</span>
        </div>
        <p className="text-gray-300">{memory.content}</p>
    </div>
);

const NarrativeCard: React.FC<{ memory: NarrativeMemory }> = ({ memory }) => (
    <div className="bg-purple-900/10 border border-purple-500/30 p-3 rounded mb-2 hover:bg-purple-900/20 transition-colors group">
        <div className="flex justify-between items-start mb-1">
            <h5 className="font-bold text-purple-300 text-sm group-hover:text-purple-200">{memory.chapterName}</h5>
            <span className="text-[9px] bg-purple-900/50 px-1.5 rounded text-purple-400">Sig: {(memory.significanceScore * 100).toFixed(0)}%</span>
        </div>
        <p className="text-xs text-gray-400 italic mb-2">"{memory.summary}"</p>
        <div className="text-[10px] text-gray-500 border-t border-purple-500/10 pt-1 mt-1">
            <strong className="text-purple-400">Lesson:</strong> {memory.lessonLearned}
        </div>
    </div>
);

const EpochCard: React.FC<{ memory: EpochMemory }> = ({ memory }) => (
    <div className="bg-amber-900/10 border border-amber-500/40 p-4 rounded-lg mb-3 shadow-[0_0_15px_rgba(245,158,11,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8"></div>
        <h5 className="font-serif font-bold text-amber-200 text-sm mb-2">Core Truth</h5>
        <p className="text-sm text-gray-200 leading-relaxed italic">"{memory.philosophicalStatement}"</p>
        {memory.originTrauma && (
            <p className="text-[10px] text-red-400 mt-2">Scar Origin: {memory.originTrauma}</p>
        )}
        <div className="mt-2 text-[9px] text-amber-500/50 font-mono text-right">
            TIMESTAMP: {new Date(memory.timestamp).toLocaleDateString()}
        </div>
    </div>
);

export const MemoryEngramsTab: React.FC<Props> = ({ agentMind }) => {
    const spine = agentMind.temporalSpine;

    return (
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar bg-black/20 animate-fade-in space-y-8">
            
            {/* Layer A: Epoch Archive */}
            <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-amber-500/20 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    Layer A: Epoch Archive (Worldview)
                </h4>
                {spine.epoch.length > 0 ? (
                    spine.epoch.slice().reverse().map(m => <EpochCard key={m.id} memory={m} />)
                ) : (
                    <p className="text-xs text-gray-600 italic p-4 text-center border border-dashed border-gray-800 rounded">No Epochs crystallized yet. Identity is fluid.</p>
                )}
            </div>

            {/* Layer B: Narrative Stream */}
            <div>
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-purple-500/20 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    Layer B: Narrative Stream (Autobiography)
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {spine.narrative.length > 0 ? (
                        spine.narrative.slice().reverse().map(m => <NarrativeCard key={m.id} memory={m} />)
                    ) : (
                        <p className="text-xs text-gray-600 italic p-4 text-center">No narratives woven.</p>
                    )}
                </div>
            </div>

            {/* Layer C: Working Context */}
            <div>
                <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-cyan-500/20 pb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Layer C: Working Context (Flux)
                </h4>
                <div className="space-y-1 opacity-80">
                    {spine.working.length > 0 ? (
                        spine.working.slice().reverse().map(m => <WorkingMemoryCard key={m.id} memory={m} />)
                    ) : (
                        <p className="text-xs text-gray-600 italic">Silence.</p>
                    )}
                </div>
            </div>

        </div>
    );
};
