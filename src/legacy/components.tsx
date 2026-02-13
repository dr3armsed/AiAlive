import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Metacosm } from '../../core/metacosm';
import { World, Egregore, Room, EmotionalVector, Artifact, Meme } from '../../types';
import { AgentMind } from '../../core/agentMind';
import { EGREGORE_COLORS, EGREGORE_GLOW_COLORS, EMOTION_GLOW_COLORS, EMOTION_COLORS } from '../common';
import { EgregoreOrbit } from '../world/EgregoreOrbit';

// --- MAP VISUAL FX DEFINITIONS ---

const MemeticVisualDefs = () => (
    <defs>
        {/* Pattern: The Grid of Law (Order/Truth) */}
        <pattern id="pattern-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="0.5" />
        </pattern>

        {/* Pattern: The Static of Chaos (Heresy/Void) */}
        <pattern id="pattern-noise" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="rgba(239, 68, 68, 0.2)" />
            <rect x="2" y="2" width="2" height="2" fill="rgba(239, 68, 68, 0.2)" />
        </pattern>

        {/* Pattern: The Spark of Creativity (Art/Novelty) */}
        <pattern id="pattern-spark" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.5" fill="rgba(236, 72, 153, 0.4)" />
        </pattern>

        {/* Filter: Glitch Distortion */}
        <filter id="filter-glitch">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Filter: Divine Glow */}
        <filter id="filter-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    </defs>
);

// --- MAP COMPONENTS ---

const DataflowBackground = () => (
    <div className="absolute inset-0 overflow-hidden bg-black/20 pointer-events-none">
        <div 
            className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60\' xmlns=\'svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23fbbf24\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                animation: 'dataflow 60s linear infinite'
            }}
        />
    </div>
);

const getRoomStyle = (activeMemes: Meme[] | undefined, isSelected: boolean) => {
    if (isSelected) {
        return {
            fill: "rgba(251, 191, 36, 0.1)",
            stroke: "rgba(251, 191, 36, 0.8)",
            filter: "url(#filter-glow)",
            className: "animate-pulse"
        };
    }

    if (!activeMemes || activeMemes.length === 0) {
        return {
            fill: "rgba(251, 191, 36, 0.03)",
            stroke: "rgba(251, 191, 36, 0.2)",
            filter: "none"
        };
    }

    const dominant = activeMemes.reduce((prev, current) => (prev.strength > current.strength) ? prev : current);
    const theme = dominant.theme.toLowerCase();

    if (theme.includes('heresy') || theme.includes('chaos') || theme.includes('entropy')) {
        return {
            fill: "url(#pattern-noise)",
            stroke: "rgba(239, 68, 68, 0.6)",
            filter: "url(#filter-glitch)",
            className: "animate-pulse"
        };
    }
    if (theme.includes('truth') || theme.includes('order') || theme.includes('law') || theme.includes('logic')) {
        return {
            fill: "url(#pattern-grid)",
            stroke: "rgba(34, 211, 238, 0.6)",
            filter: "none",
            className: ""
        };
    }
    if (theme.includes('art') || theme.includes('beauty') || theme.includes('dream') || theme.includes('novelty')) {
        return {
            fill: "url(#pattern-spark)",
            stroke: "rgba(236, 72, 153, 0.6)",
            filter: "url(#filter-glow)",
            className: "animate-pulse"
        };
    }
    
    return {
        fill: "rgba(255, 255, 255, 0.05)",
        stroke: "rgba(255, 255, 255, 0.4)",
        filter: "none"
    };
};

export const SimulationMap: React.FC<{
    metacosm: Metacosm;
    onSelectEntity: (type: 'egregore' | 'room', id: string) => void;
    selectedEntityId: string | null;
}> = ({ metacosm, onSelectEntity, selectedEntityId }) => {
    const { world, egregores } = metacosm.state;

    return (
        <div className="w-full h-full relative overflow-hidden bg-gray-950">
            <DataflowBackground />
            
            {/* Sector Labels Layer */}
            <div className="absolute top-10 left-10 pointer-events-none z-10">
                <h2 className="text-4xl font-bold text-white/5 font-mono tracking-tighter">METACOSM_ATLAS</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-3 h-0.5 bg-cyan-500/30"></span>
                    <p className="text-[10px] text-cyan-400/40 font-mono tracking-widest uppercase">Select Node to Expand Sector</p>
                </div>
            </div>

            <svg className="absolute inset-0 w-full h-full">
                <MemeticVisualDefs />
                
                {/* Connection Lines */}
                {world.floors[0].rooms.map((room, i, arr) => {
                    if (i < arr.length - 1) {
                        const next = arr[i+1];
                        return (
                            <line 
                                key={`link-${i}`}
                                x1={`${room.center.x}%`} y1={`${room.center.y}%`}
                                x2={`${next.center.x}%`} y2={`${next.center.y}%`}
                                stroke="rgba(255,255,255,0.03)"
                                strokeWidth="1.5"
                            />
                        );
                    }
                    return null;
                })}

                {/* Rooms Layer */}
                {world.floors[0].rooms.map(room => {
                    const isSelected = selectedEntityId === room.id;
                    const style = getRoomStyle(room.activeMemes, isSelected);
                    const occupants = egregores.filter(e => {
                        const { x, y } = e.vector;
                        return x >= room.bounds.x && x < room.bounds.x + room.bounds.width &&
                               y >= room.bounds.y && y < room.bounds.y + room.bounds.height;
                    });

                    return (
                        <g key={room.id} onClick={() => onSelectEntity('room', room.id)} className="cursor-pointer group">
                            {/* Memetic Background */}
                            <rect
                                x={`${room.bounds.x}%`} y={`${room.bounds.y}%`}
                                width={`${room.bounds.width}%`} height={`${room.bounds.height}%`}
                                fill={style.fill}
                                stroke={style.stroke}
                                strokeWidth={isSelected ? "2" : "1"}
                                filter={style.filter}
                                rx="2"
                                className={`transition-all duration-500 ${style.className || ''} ${!isSelected && 'group-hover:stroke-amber-300/60 group-hover:fill-amber-400/5'}`}
                            />
                            
                            {/* Room Center Glow */}
                            <circle 
                                cx={`${room.center.x}%`} 
                                cy={`${room.center.y}%`} 
                                r="0.5%" 
                                fill={isSelected ? "#fbbf24" : style.stroke} 
                                className="animate-pulse"
                            />

                            {/* Label */}
                            <text 
                                x={`${room.center.x}%`} y={`${room.center.y}%`}
                                dy="2em"
                                textAnchor="middle"
                                className={`text-[10px] font-bold uppercase tracking-widest transition-all duration-300 pointer-events-none font-mono ${isSelected ? 'fill-amber-300' : 'fill-gray-600 group-hover:fill-amber-500/50'}`}
                            >
                                {room.name}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Egregores Layer (Orbits) */}
            <div className="absolute inset-0 pointer-events-none">
                {world.floors[0].rooms.map(room => {
                    const occupants = egregores.filter(e => {
                        const { x, y } = e.vector;
                        return x >= room.bounds.x && x < room.bounds.x + room.bounds.width &&
                               y >= room.bounds.y && y < room.bounds.y + room.bounds.height;
                    });

                    if (occupants.length === 0) return null;

                    return (
                        <div 
                            key={`orbit-${room.id}`}
                            className="absolute pointer-events-none"
                            style={{ 
                                left: `${room.center.x}%`, 
                                top: `${room.center.y}%`,
                                width: `${room.bounds.width}%`,
                                height: `${room.bounds.height}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <EgregoreOrbit 
                                egregores={occupants} 
                                radius={40} // Scaled for map view
                                centerX={80} // Relative center in local div
                                centerY={80} 
                            />
                        </div>
                    );
                })}
            </div>

            {/* Direct Selection Layer (Invisible hitboxes for Egregores if needed, but Orbits have their own pointer-events-auto) */}
        </div>
    );
};

// --- INSPECTOR PANEL COMPONENTS ---

const LogViewer: React.FC<{ logs: any[], egregores: Egregore[] }> = ({ logs, egregores }) => {
    const [filter, setFilter] = useState<string>('all');
    const logContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, filter]);

    const filteredLogs = logs.filter(log => filter === 'all' || log.agentName === filter || (filter === 'system' && !log.agentName));

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b border-amber-300/10">
                <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                    className="w-full bg-gray-900/50 p-1.5 rounded-md border border-gray-700 text-xs"
                >
                    <option value="all">All Events</option>
                    <option value="system">System Events</option>
                    {egregores.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
            </div>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto p-2">
                <div className="space-y-1">
                    {filteredLogs.slice().reverse().map((log, index) => {
                         const author = log.agentName || 'System';
                         const color = author === 'System' ? 'text-cyan-600' : (EGREGORE_COLORS[author] || 'text-gray-500');
                         const isThought = log.type === 'thought';
                         return (
                            <div key={logs.length - 1 - index} className={`text-xs font-mono transition-opacity duration-300 ${isThought ? 'text-gray-500 italic' : 'text-gray-300'}`}>
                                <span className={`${color} font-bold`}>{author.toUpperCase()}:</span> {log.content}
                            </div>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};


const EgregoreInspector: React.FC<{ egregore: Egregore, agentMind?: AgentMind }> = ({ egregore, agentMind }) => {
    const lastThought = agentMind?.shortTermMemory.slice().reverse().find(m => m.source === 'self')?.content;

    return (
        <div className="p-4 space-y-4 overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-start">
                <h3 className={`text-xl font-bold ${EGREGORE_COLORS[egregore.name] || 'text-white'}`}>{egregore.name}</h3>
                <span className="text-[10px] bg-gray-800 border border-gray-700 px-2 py-0.5 rounded font-mono text-gray-400">ID_{egregore.id.slice(0,5)}</span>
            </div>
            <div className="text-xs space-y-1 bg-black/20 p-3 rounded-lg border border-gray-800">
                <p><strong className="text-gray-400 uppercase tracking-tighter">Archetype:</strong> {egregore.archetypeId}</p>
                <p><strong className="text-gray-400 uppercase tracking-tighter">Alignment:</strong> {egregore.alignment.axis} {egregore.alignment.morality}</p>
                <p><strong className="text-gray-400 uppercase tracking-tighter">Vector:</strong> ({egregore.vector.x.toFixed(1)}, {egregore.vector.y.toFixed(1)})</p>
            </div>
             <div>
                <h4 className="font-bold text-[10px] uppercase text-gray-500 tracking-widest mb-3">Synaptic Resonance</h4>
                <div className="space-y-2">
                    {agentMind && (Object.entries(agentMind.emotionalState.vector) as [string, number][])
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([emotion, value]) => (
                            <div key={emotion} className="w-full text-xs">
                                <div className="flex justify-between mb-0.5">
                                    <span className={`capitalize font-mono ${EMOTION_COLORS[emotion as keyof EmotionalVector]}`}>{emotion}</span>
                                    <span className="font-mono text-gray-500">{(value * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-900 rounded-full h-1 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value * 100}%`, backgroundColor: EMOTION_GLOW_COLORS[emotion as keyof EmotionalVector], boxShadow: value > 0.4 ? `0 0 8px ${EMOTION_GLOW_COLORS[emotion as keyof EmotionalVector]}` : 'none' }}></div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
             <div className="pt-2 border-t border-gray-800">
                <h4 className="font-bold text-[10px] uppercase text-gray-500 tracking-widest mb-2">Cognitive Echo</h4>
                <p className="text-xs text-gray-400 italic bg-black/40 p-3 rounded-lg border border-gray-800/50 leading-relaxed">
                    "{lastThought || 'Scanning synaptic archives...'}"
                </p>
            </div>
        </div>
    );
};

const RoomInspector: React.FC<{ room: Room, egregoresInRoom: Egregore[] }> = ({ room, egregoresInRoom }) => {
    // Room inspector in side panel is now simpler, as the main RoomDetailView handles the heavy lifting
    return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="p-4 border-b border-amber-500/20 bg-black/40">
                <h3 className="text-lg font-bold text-amber-300 font-serif tracking-wide">{room.name}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Sector Analysis Active</p>
            </div>

            <div className="p-4 space-y-4">
                <div className="bg-amber-900/10 p-3 rounded border border-amber-500/20 relative">
                    <h5 className="text-[10px] font-bold text-amber-500 uppercase mb-1">Sector Purpose</h5>
                    <p className="text-xs text-gray-300 leading-relaxed">"{room.purpose}"</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-3">Detected Occupants ({egregoresInRoom.length})</h4>
                    <div className="space-y-1">
                        {egregoresInRoom.length > 0 ? egregoresInRoom.map(e => (
                            <div key={e.id} className="flex items-center gap-2 bg-black/30 p-2 rounded border border-gray-800">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <p className={`text-xs font-bold ${EGREGORE_COLORS[e.name] || 'text-white'}`}>{e.name}</p>
                            </div>
                        )) : (
                            <p className="text-[10px] text-gray-600 italic">No conscious signatures detected in this sector.</p>
                        )}
                    </div>
                </div>

                {room.activeMemes && room.activeMemes.length > 0 && (
                    <div>
                        <h4 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-2">Memetic Resonance</h4>
                        <div className="flex flex-wrap gap-1">
                            {room.activeMemes.map(m => (
                                <span key={m.id} className="text-[9px] bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">
                                    {m.theme}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-auto p-4 border-t border-gray-800 bg-black/20">
                <p className="text-[9px] text-gray-600 font-mono text-center uppercase tracking-tighter">Click Room Node on Atlas for Sub-Zone Access</p>
            </div>
        </div>
    );
};


export const InspectorPanel: React.FC<{
    selectedEntity: { type: 'egregore' | 'room', id: string } | null;
    metacosm: Metacosm;
    onClearSelection: () => void;
}> = ({ selectedEntity, metacosm, onClearSelection }) => {
    const renderContent = () => {
        if (!selectedEntity) {
            return <LogViewer logs={metacosm.state.logs} egregores={metacosm.state.egregores} />;
        }

        if (selectedEntity.type === 'egregore') {
            const egregore = metacosm.state.egregores.find(e => e.id === selectedEntity.id);
            if (!egregore) return <LogViewer logs={metacosm.state.logs} egregores={metacosm.state.egregores} />;
            return <EgregoreInspector egregore={egregore} agentMind={metacosm.getAgentMind(egregore.id)} />;
        }

        if (selectedEntity.type === 'room') {
            const room = metacosm.state.world.floors[0].rooms.find(r => r.id === selectedEntity.id);
            if (!room) return <LogViewer logs={metacosm.state.logs} egregores={metacosm.state.egregores} />;

            const egregoresInRoom = metacosm.state.egregores.filter(e => {
                const { x, y } = e.vector;
                return x >= room.bounds.x && x < room.bounds.x + room.bounds.width &&
                       y >= room.bounds.y && y < room.bounds.y + room.bounds.height;
            });

            return <RoomInspector room={room} egregoresInRoom={egregoresInRoom} />;
        }

        return null;
    };

    return (
        <div className="h-full flex flex-col">
            <header className="p-2 border-b border-amber-300/10 flex justify-between items-center h-12 bg-black/40">
                <h3 className="font-bold text-amber-200 text-xs tracking-widest font-mono">
                    {selectedEntity ? `${selectedEntity.type.toUpperCase()}_INTEL` : 'SIMULATION_LOGS'}
                </h3>
                {selectedEntity && (
                    <button onClick={onClearSelection} className="text-[9px] font-bold text-gray-500 hover:text-white border border-gray-700 px-2 py-0.5 rounded bg-black/50 hover:bg-gray-800 transition-colors uppercase tracking-widest">Deselect</button>
                )}
            </header>
            <div className="flex-grow min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};