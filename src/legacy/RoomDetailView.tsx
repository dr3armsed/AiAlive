
import React, { useState } from 'react';
import { Room, MetacosmState, Egregore, RoomAction } from '../../types';
import { EGREGORE_COLORS } from '../common';
import { executeWorldAction } from '../../services/ariesServices/world_interventions';
import { Metacosm } from '../../core/metacosm';
import { TaurusService } from '../../services/taurusServices/index';

type Props = {
    room: Room;
    initialSubZoneId?: string;
    metacosm: Metacosm; // Need full class for actions
    metacosmState: MetacosmState;
    onBack: () => void;
};

export const RoomDetailView: React.FC<Props> = ({ room, initialSubZoneId, metacosm, metacosmState, onBack }) => {
    const defaultTab = initialSubZoneId || (room.subdivisions && room.subdivisions.length > 0 ? room.subdivisions[0].id : 'main');
    const [activeTabId, setActiveTabId] = useState<string>(defaultTab);
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);

    const activeSubZone = room.subdivisions?.find(s => s.id === activeTabId);
    
    // Filter logs for this specific room context
    const roomLogs = metacosmState.logs.filter(log => 
        log.content.includes(room.name) || (activeSubZone && log.content.includes(activeSubZone.name))
    ).slice(-20).reverse();

    // Updated genmetas to egregores
    const occupants = metacosmState.egregores.filter(e => {
        // Simple heuristic: if agent is in the bounds of the main room
        const { x, y } = e.vector;
        return x >= room.bounds.x && x < room.bounds.x + room.bounds.width &&
               y >= room.bounds.y && y < room.bounds.y + room.bounds.height;
    });

    const handleAction = (action: RoomAction) => {
        const taurus = new TaurusService(metacosmState);
        const result = executeWorldAction(metacosm, taurus, room, action);
        setActionFeedback(result.message);
        setTimeout(() => setActionFeedback(null), 3000);
    };

    return (
        <div className="h-full flex flex-col bg-black/20 text-gray-300">
            {/* Header / Lore */}
            <div className="p-6 bg-black/40 border-b border-amber-500/20 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-amber-300 font-serif mb-2 tracking-wide">{room.name}</h2>
                    <p className="text-sm text-gray-400 max-w-2xl italic leading-relaxed">"{room.history}"</p>
                </div>
                <button 
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-600 rounded hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
                >
                    Back to Map
                </button>
            </div>

            {/* Navigation Tabs (Sub-Zones) */}
            {room.subdivisions && (
                <div className="flex border-b border-amber-500/10 bg-black/20 overflow-x-auto">
                    {room.subdivisions.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => setActiveTabId(sub.id)}
                            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all
                                ${activeTabId === sub.id 
                                    ? 'text-amber-300 bg-amber-900/20 border-b-2 border-amber-400 shadow-[inset_0_-10px_20px_rgba(245,158,11,0.1)]' 
                                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-grow flex min-h-0">
                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {activeSubZone ? (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{activeSubZone.name}</h3>
                                <p className="text-amber-200/80 text-sm font-medium mb-4">{activeSubZone.purpose}</p>
                                <div className="p-6 bg-black/30 border border-gray-800 rounded-xl shadow-inner">
                                    <p className="text-gray-300 leading-loose font-serif">
                                        {activeSubZone.description}
                                    </p>
                                </div>
                            </div>

                            {activeSubZone.mechanics && activeSubZone.mechanics.length > 0 && (
                                <div className="flex gap-4">
                                    {activeSubZone.mechanics.map((mech, i) => (
                                        <div key={i} className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex-1">
                                            <h4 className="text-blue-300 font-bold text-xs uppercase mb-1">Active Effect</h4>
                                            <p className="text-gray-300 text-sm font-bold">{mech.type.replace('_', ' ')}</p>
                                            <p className="text-gray-500 text-xs mt-1">{mech.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeSubZone.artifacts && activeSubZone.artifacts.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Local Artifacts</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {activeSubZone.artifacts.map(art => (
                                            <div key={art.id} className="bg-black/40 border border-gray-800 p-3 rounded hover:border-amber-500/30 transition-colors">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-amber-100 font-bold text-sm">{art.name}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase border border-gray-700 px-1 rounded">{art.type}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2">"{art.content}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a sub-zone to explore.
                        </div>
                    )}
                </div>

                {/* Sidebar: Operations & Status */}
                <div className="w-80 bg-black/30 border-l border-amber-500/10 flex flex-col">
                    
                    {/* Architect Controls */}
                    {room.architectActions && room.architectActions.length > 0 && (
                        <div className="p-4 border-b border-gray-800 bg-amber-900/10">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Room Operations
                            </h4>
                            <div className="space-y-2">
                                {room.architectActions.map(action => (
                                    <button 
                                        key={action.id}
                                        onClick={() => handleAction(action)}
                                        className="w-full text-left p-2 bg-black/40 hover:bg-amber-600/20 border border-amber-500/30 rounded transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm text-gray-200 group-hover:text-amber-300">{action.label}</span>
                                            <span className="text-[10px] font-mono text-amber-500/70">{action.quintessenceCost} Q</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 group-hover:text-gray-400">{action.description}</p>
                                    </button>
                                ))}
                            </div>
                            {actionFeedback && (
                                <div className="mt-2 p-2 bg-green-900/50 border border-green-500/30 rounded text-green-300 text-xs text-center animate-pulse">
                                    {actionFeedback}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-4 border-b border-gray-800">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Occupants</h4>
                        <div className="space-y-2">
                            {occupants.length > 0 ? occupants.map(eg => (
                                <div key={eg.id} className="flex items-center gap-2 text-sm bg-black/40 p-2 rounded">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className={EGREGORE_COLORS[eg.name] || 'text-gray-300'}>{eg.name}</span>
                                </div>
                            )) : <p className="text-xs text-gray-600 italic">No entities present.</p>}
                        </div>
                    </div>
                    
                    <div className="flex-grow flex flex-col min-h-0">
                        <h4 className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">Local Activity Feed</h4>
                        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {roomLogs.length > 0 ? roomLogs.map((log, i) => (
                                <div key={i} className="text-xs font-mono border-l-2 border-gray-700 pl-2 py-1">
                                    <span className={`${EGREGORE_COLORS[log.agentName || ''] || 'text-gray-400'} font-bold`}>
                                        {log.agentName || 'SYSTEM'}
                                    </span>
                                    <p className="text-gray-500 mt-0.5">{log.content}</p>
                                </div>
                            )) : <p className="text-xs text-gray-600 italic text-center mt-10">Silence reigns here.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
