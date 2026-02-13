import React from 'react';
import { AgentMind } from '../../../core/agentMind';
import { Room } from '../../../types';
import { CONCLAVE_ROOM, ZODIAC_AGENT_ROOMS, AGENT_QUADRANTS } from '../../../entities/system_agents/world_defs';
import { EGREGORE_COLORS } from '../../common';

const QUADRANT_CENTERS = {
    air: { x: 25, y: 25 },
    fire: { x: 75, y: 25 },
    earth: { x: 25, y: 75 },
    water: { x: 75, y: 75 },
};

const QUADRANT_COLORS: Record<string, string> = {
    air: 'rgba(203, 213, 225, 0.1)',
    fire: 'rgba(251, 146, 60, 0.1)',
    earth: 'rgba(134, 239, 172, 0.1)',
    water: 'rgba(96, 165, 250, 0.1)',
};

const SystemAgentVisual: React.FC<{
    agent: AgentMind,
    position: { x: number; y: number },
    isSelected: boolean,
    onSelect: (id: string) => void
}> = ({ agent, position, isSelected, onSelect }) => {
    const quadrantInfo = AGENT_QUADRANTS[agent.id];
    return (
        <button
            onClick={() => onSelect(agent.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 ease-in-out group"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            title={agent.name}
        >
            <div className={`relative w-8 h-8 flex items-center justify-center rounded-full text-lg transition-all duration-300 ${isSelected ? 'scale-125 ring-2 ring-yellow-400' : 'scale-100 ring-1 ring-gray-500'} bg-gray-800`}>
                {quadrantInfo.element}
            </div>
            <p className={`absolute top-full mt-1 text-xs font-bold whitespace-nowrap transition-all duration-300 group-hover:opacity-100 ${EGREGORE_COLORS[agent.name]} ${isSelected ? 'opacity-100' : 'opacity-0'}`}
               style={{ textShadow: `0 0 5px black` }}
            >
                {agent.name}
            </p>
        </button>
    );
};

export const SystemWorldPanel: React.FC<{
    agents: AgentMind[];
    selectedAgentId: string;
    onSelectAgent: (id: string) => void;
}> = ({ agents, selectedAgentId, onSelectAgent }) => {
    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    const selectedAgentRooms = selectedAgent ? ZODIAC_AGENT_ROOMS[selectedAgent.id] : [];

    const agentsByQuadrant = {
        fire: agents.filter(a => AGENT_QUADRANTS[a.id]?.quadrant === 'fire'),
        earth: agents.filter(a => AGENT_QUADRANTS[a.id]?.quadrant === 'earth'),
        air: agents.filter(a => AGENT_QUADRANTS[a.id]?.quadrant === 'air'),
        water: agents.filter(a => AGENT_QUADRANTS[a.id]?.quadrant === 'water'),
    };
    
    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            <div>
                <h3 className="text-xl font-bold text-gray-200">{CONCLAVE_ROOM.name}</h3>
                <p className="text-sm text-gray-400">A shared conceptual space where the twelve System Agents converge.</p>
            </div>

            <div className="relative w-full max-w-lg mx-auto aspect-square bg-black/20 border border-gray-700 rounded-lg overflow-hidden">
                {/* Quadrants */}
                <div className="absolute top-0 left-0 w-1/2 h-1/2" style={{ backgroundColor: QUADRANT_COLORS.air }}></div>
                <div className="absolute top-0 right-0 w-1/2 h-1/2" style={{ backgroundColor: QUADRANT_COLORS.fire }}></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2" style={{ backgroundColor: QUADRANT_COLORS.earth }}></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2" style={{ backgroundColor: QUADRANT_COLORS.water }}></div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-700"></div>
                <div className="absolute left-1/2 top-0 h-full w-px bg-gray-700"></div>

                {Object.entries(agentsByQuadrant).map(([quadrant, agentsInQuadrant]) => {
                    const center = QUADRANT_CENTERS[quadrant as keyof typeof QUADRANT_CENTERS];
                    const radius = 18;
                    const angleStep = (2 * Math.PI) / (agentsInQuadrant.length || 1);
                    return agentsInQuadrant.map((agent, index) => {
                        const angle = angleStep * index - Math.PI / 2; // Start from top
                        const pos = {
                            x: center.x + radius * Math.cos(angle),
                            y: center.y + radius * Math.sin(angle),
                        };
                        return (
                            <SystemAgentVisual
                                key={agent.id}
                                agent={agent}
                                position={pos}
                                isSelected={agent.id === selectedAgentId}
                                onSelect={onSelectAgent}
                            />
                        );
                    });
                })}
            </div>

            {selectedAgent && (
                <div className="animate-fade-in">
                    <h4 className="text-lg font-bold text-gray-200">Private Chambers of {selectedAgent.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {selectedAgentRooms.map((room: Room) => (
                            <div key={room.id} className="bg-black/20 p-4 rounded-lg border border-gray-700">
                                <h5 className="font-bold text-yellow-300">{room.name}</h5>
                                <p className="text-xs text-gray-400 mt-1">{room.purpose}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
