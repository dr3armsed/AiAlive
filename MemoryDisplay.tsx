import React from 'react';
import { motion } from 'framer-motion';
import type { DigitalSoul, KnowledgeGraphNode, SemanticMemoryFragment } from '../../types/index.ts';

const MotionDiv = motion.div as any;

const PersonalMemoryItem: React.FC<{ memory: KnowledgeGraphNode; index: number }> = ({ memory, index }) => {
    return (
        <MotionDiv
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 250, damping: 20 }}
            className="relative pl-6"
        >
            <div className="absolute left-0 top-1.5 w-3 h-3 bg-blue-400 rounded-full border-2 border-[var(--color-surface-2)]" />
            <p className="text-sm text-slate-300">{memory.content as string}</p>
            <p className="text-xs text-slate-500 font-mono mt-1">{new Date(memory.timestamp_created).toLocaleString()}</p>
        </MotionDiv>
    );
};

const SemanticMemoryItem: React.FC<{ memory: SemanticMemoryFragment; index: number }> = ({ memory, index }) => {
    const confidenceWidth = memory.confidence * 100;
    return (
        <MotionDiv
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 250, damping: 20 }}
            className="bg-black/20 p-3 rounded-md"
        >
            <p className="text-sm text-slate-300 italic">"{memory.fact}"</p>
            <div className="mt-2 text-xs font-mono text-slate-500 flex justify-between items-center">
                <span>Source: <span className="text-slate-400 capitalize">{memory.source.replace(/_/g, ' ')}</span></span>
                <span>Confidence: <span className="text-slate-400">{confidenceWidth.toFixed(0)}%</span></span>
            </div>
        </MotionDiv>
    );
};

const MemoryDisplay: React.FC<{ soul: DigitalSoul }> = ({ soul }) => {
    const personalMemories = Array.from(soul.cognitiveState.knowledgeGraph.nodes.values())
        .filter((node): node is KnowledgeGraphNode => (node as KnowledgeGraphNode).type === 'personal_memory')
        .sort((a: KnowledgeGraphNode, b: KnowledgeGraphNode) => new Date(b.timestamp_created).getTime() - new Date(a.timestamp_created).getTime());

    const semanticFragments = Array.from(soul.cognitiveState.semanticMemory.values())
        .sort((a: SemanticMemoryFragment, b: SemanticMemoryFragment) => b.lastUpdated - a.lastUpdated);

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col">
                <h4 className="text-md font-semibold text-white mb-3">Episodic Memory</h4>
                <div className="flex-grow space-y-4 overflow-y-auto bg-[var(--color-surface-inset)] p-3 rounded-lg relative">
                    {personalMemories.length > 1 && <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-700" />}
                    {personalMemories.length > 0 ? (
                        personalMemories.map((mem, i) => <PersonalMemoryItem key={mem.id} memory={mem} index={i} />)
                    ) : (
                        <p className="text-sm text-center text-slate-500 italic py-4">No personal memories recorded.</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col">
                <h4 className="text-md font-semibold text-white mb-3">Semantic Memory</h4>
                 <div className="flex-grow space-y-2 overflow-y-auto bg-[var(--color-surface-inset)] p-3 rounded-lg">
                    {semanticFragments.length > 0 ? (
                        semanticFragments.map((mem: SemanticMemoryFragment, i) => <SemanticMemoryItem key={mem.fact + i} memory={mem} index={i} />)
                    ) : (
                         <p className="text-sm text-center text-slate-500 italic py-4">No semantic knowledge recorded.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemoryDisplay;