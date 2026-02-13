import React from 'react';
import { AgentMind } from '../../../core/agentMind';
import { EGREGORE_COLORS } from '../../common';
import { EmotionMeter } from './EmotionMeter';

type AgentDetailPanelProps = {
    agent: AgentMind | undefined;
    onMutateAgent: (id: string) => void;
};

export const AgentDetailPanel: React.FC<AgentDetailPanelProps> = ({ agent, onMutateAgent }) => {
    if (!agent) {
        return (
            <aside className="w-1/3 max-w-sm border-l border-gray-700 bg-black/20 p-4 flex items-center justify-center">
                <p className="text-gray-500">Select an agent to see details.</p>
            </aside>
        );
    }

    return (
        <aside className="w-1/3 max-w-sm border-l border-gray-700 bg-black/20 p-4 flex flex-col gap-4">
            <h3 className={`text-xl font-bold ${EGREGORE_COLORS[agent.name] || 'text-gray-200'}`}>{agent.name}</h3>
            <div>
                <h4 className="text-sm font-bold text-gray-400 mb-2">Emotional State</h4>
                <div className="space-y-1">
                    {/* FIX: Cast Object.entries to fix type inference issues with arithmetic operations. */}
                    {(Object.entries(agent.emotionalState.vector) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([emotion, value]) => (
                        <EmotionMeter key={emotion} label={emotion} value={value} />
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-400 mb-2">Long-Term Memory</h4>
                <div className="space-y-2 text-xs text-gray-400 h-48 overflow-y-auto bg-black/20 p-2 rounded-md">
                    {agent.longTermMemory.length > 0 ? agent.longTermMemory.map(mem => (
                        <p key={mem.id} className="border-b border-gray-800 pb-1">
                            <span className="text-gray-500">[{mem.type}] </span>{mem.content} <span className="text-yellow-500">({mem.importance.toFixed(1)})</span>
                        </p>
                    )) : <p className="italic">No memories yet.</p>}
                </div>
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-400 mb-2">DNA</h4>
                <p className="text-xs font-mono bg-black/20 p-2 rounded-md break-all">{agent.dna.instruction_keys.join(' ')}</p>
                <button onClick={() => onMutateAgent(agent.id)} className="mt-2 text-xs w-full bg-gray-700 py-1 rounded hover:bg-gray-600">Mutate DNA</button>
            </div>
        </aside>
    );
};