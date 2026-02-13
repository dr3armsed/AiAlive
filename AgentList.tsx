
import React from 'react';
import { AgentMind } from '../../../core/agentMind';
import { EGREGORE_COLORS } from '../../common';

type AgentListProps = {
    agents: Record<string, AgentMind>;
    selectedAgentId: string;
    onSelectAgent: (id: string) => void;
};

export const AgentList: React.FC<AgentListProps> = ({ agents, selectedAgentId, onSelectAgent }) => (
    <aside className="w-1/4 max-w-xs border-r border-gray-700 flex flex-col">
        <h3 className="p-3 font-bold text-lg">System Agents</h3>
        <nav className="flex-grow overflow-y-auto">
            {/* Explicitly typed agent as AgentMind to fix inference issues */}
            {Object.values(agents).map((agent: AgentMind) => (
                <button
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedAgentId === agent.id ? 'bg-gray-700/50' : 'hover:bg-white/5'}`}
                >
                    <span className={EGREGORE_COLORS[agent.name] || 'text-gray-200'}>{agent.name}</span>
                </button>
            ))}
        </nav>
    </aside>
);
