
import React, { useState } from 'react';
import { MetacosmState, Room, Egregore } from '../types';
import { Metacosm } from '../core/metacosm';
import { RoomDetailView } from './world/RoomDetailView';
import { EgregoreOrbit } from './world/EgregoreOrbit';

// Helper to determine grid position based on room ID or index
const getRoomPosition = (index: number, total: number) => {
    const cols = 5;
    const x = (index % cols) * 200 + 100;
    const y = Math.floor(index / cols) * 200 + 100;
    return { x, y };
};

// --- Submenu Component ---
const RoomSubmenu = ({ room, x, y, onEnter, onClose }: { room: Room, x: number, y: number, onEnter: (subZoneId: string) => void, onClose: () => void }) => {
    return (
        <div 
            className="absolute z-50 bg-black/90 border border-amber-500/50 rounded-xl p-4 w-64 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-fade-in backdrop-blur-xl"
            style={{ left: x + 80, top: y - 20 }} // Offset from node
        >
            <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-2">
                <div>
                    <h4 className="font-bold text-amber-400 text-lg font-serif">{room.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{room.subdivisions?.length || 0} Sectors Available</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-500 hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                {/* Main Nexus Link */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onEnter(room.subdivisions?.[0]?.id || 'main'); }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-amber-900/30 text-gray-300 hover:text-amber-200 text-sm font-bold border border-transparent hover:border-amber-500/30 transition-all flex justify-between group"
                >
                    <span>Main Nexus</span>
                    <span className="opacity-0 group-hover:opacity-100 text-amber-500">→</span>
                </button>
                
                {/* Divider */}
                {room.subdivisions && room.subdivisions.length > 0 && <div className="border-t border-gray-800 my-1"></div>}

                {/* Specific Sub-zones */}
                {room.subdivisions?.map(sub => (
                    <button 
                        key={sub.id}
                        onClick={(e) => { e.stopPropagation(); onEnter(sub.id); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-blue-900/30 text-gray-400 hover:text-blue-200 text-xs border border-transparent hover:border-blue-500/30 transition-all flex justify-between group"
                    >
                        <span>{sub.name}</span>
                        <span className="opacity-0 group-hover:opacity-100 text-blue-400">→</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

const WorldNode = ({ room, x, y, onClick, egregores }: { room: Room, x: number, y: number, onClick: () => void, egregores: Egregore[] }) => {
    // Determine visual style based on Memes
    const isHeretical = room.activeMemes?.some(m => m.theme.toLowerCase().includes('heresy'));
    const isCreative = room.activeMemes?.some(m => m.theme.toLowerCase().includes('art'));
    
    let borderColor = 'border-gray-600';
    let shadowColor = '';
    
    if (isHeretical) {
        borderColor = 'border-red-500';
        shadowColor = 'shadow-[0_0_20px_rgba(239,68,68,0.4)]';
    } else if (isCreative) {
        borderColor = 'border-pink-500';
        shadowColor = 'shadow-[0_0_20px_rgba(236,72,153,0.4)]';
    } else if (egregores.length > 0) {
        borderColor = 'border-green-500';
        shadowColor = 'shadow-[0_0_15px_rgba(34,197,94,0.3)]';
    }

    return (
        <div 
            className={`absolute w-40 h-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${borderColor} ${shadowColor}`}
            style={{ left: x, top: y }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            <div className="text-center p-4 z-10 relative">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1 group-hover:text-amber-300 transition-colors">{room.name}</h4>
                <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">{room.purpose}</p>
            </div>
            
            {/* Dynamic Egregore Orbits */}
            {egregores.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                    <EgregoreOrbit 
                        egregores={egregores} 
                        radius={65} // Radius relative to node center. Node is 160px wide (w-40), so 80 is edge. 65 is nice orbit.
                        centerX={80} 
                        centerY={80} 
                    />
                </div>
            )}
            
            {room.subdivisions && (
                <div className="absolute bottom-2 flex gap-1 z-10">
                    {room.subdivisions.slice(0, 4).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Neural Connection Visualizer
const NeuralNetworkOverlay = ({ egregores, rooms }: { egregores: Egregore[], rooms: Room[] }) => {
    // Helper to get absolute position of an Egregore based on room bounds
    const getEgregorePos = (egregore: Egregore) => {
        // Egregores have a vector x,y (0-100) relative to their room
        // We need to find their room to get world coordinates
        const room = rooms.find(r => 
            egregore.vector.x >= r.bounds.x && egregore.vector.x < r.bounds.x + r.bounds.width &&
            egregore.vector.y >= r.bounds.y && egregore.vector.y < r.bounds.y + r.bounds.height
        );
        
        if (room) {
            // Map room index to world grid
            const index = rooms.findIndex(r => r.id === room.id);
            const roomPos = getRoomPosition(index, rooms.length);
            
            // Center them in the room node + offset
            return { x: roomPos.x + 80, y: roomPos.y + 80 };
        }
        return null;
    };

    const validEgregores = egregores.map(e => ({ id: e.id, pos: getEgregorePos(e) })).filter(e => e.pos !== null);

    return (
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible">
            {validEgregores.map((source, i) => (
                validEgregores.slice(i + 1).map((target, j) => (
                    <line 
                        key={`${source.id}-${target.id}`}
                        x1={source.pos!.x} 
                        y1={source.pos!.y} 
                        x2={target.pos!.x} 
                        y2={target.pos!.y} 
                        stroke="rgba(34, 211, 238, 0.15)" 
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                    />
                ))
            ))}
        </svg>
    );
};

export const WorldView = ({ metacosm }: { metacosm: Metacosm }) => {
    const [navigationState, setNavigationState] = useState<{ roomId: string, subZoneId?: string } | null>(null);
    const [activeMenuRoomId, setActiveMenuRoomId] = useState<string | null>(null);

    const rooms = metacosm.state.world.floors[0].rooms;
    
    // If a room is fully selected for detail view
    const selectedRoom = navigationState ? rooms.find(r => r.id === navigationState.roomId) : null;

    // Handle clicks
    const handleNodeClick = (roomId: string) => {
        if (activeMenuRoomId === roomId) {
            setActiveMenuRoomId(null);
        } else {
            setActiveMenuRoomId(roomId);
        }
    };

    const handleEnterRoom = (roomId: string, subZoneId?: string) => {
        setNavigationState({ roomId, subZoneId });
        setActiveMenuRoomId(null);
    };

    const handleBgClick = () => {
        setActiveMenuRoomId(null);
    };

    if (selectedRoom) {
        return <RoomDetailView 
            room={selectedRoom} 
            initialSubZoneId={navigationState?.subZoneId} 
            metacosm={metacosm} 
            metacosmState={metacosm.state} 
            onBack={() => setNavigationState(null)} 
        />;
    }

    return (
        <div className="h-full w-full bg-gray-900 relative overflow-auto custom-scrollbar" onClick={handleBgClick}>
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative min-w-[1000px] min-h-[1000px] p-20">
                <h2 className="text-4xl font-bold text-white/10 absolute top-10 left-10 pointer-events-none">METACOSM ATLAS</h2>
                <div className="absolute top-24 left-10 flex flex-col gap-1 pointer-events-none">
                    <p className="text-xs text-white/20 font-mono">CLICK NODE TO EXPAND SECTOR</p>
                    <p className="text-xs text-cyan-500/40 font-mono mt-2 flex items-center gap-2">
                        <span className="w-2 h-0.5 bg-cyan-500/40"></span>
                        COLLECTIVE SPINE: ACTIVE
                    </p>
                </div>
                
                {/* Connections */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    {rooms.map((room, i) => {
                        const start = getRoomPosition(i, rooms.length);
                        if (i < rooms.length - 1) {
                            const end = getRoomPosition(i + 1, rooms.length);
                            return (
                                <line 
                                    key={i} 
                                    x1={start.x + 80} y1={start.y + 80} 
                                    x2={end.x + 80} y2={end.y + 80} 
                                    stroke="rgba(255,255,255,0.05)" 
                                    strokeWidth="2" 
                                />
                            );
                        }
                        return null;
                    })}
                </svg>

                {/* Neural Network Overlay */}
                {/* Updated genmetas to egregores */}
                <NeuralNetworkOverlay egregores={metacosm.state.egregores} rooms={rooms} />

                {/* Nodes & Menus */}
                {rooms.map((room, i) => {
                    const pos = getRoomPosition(i, rooms.length);
                    // Find egregores in this room - Updated genmetas to egregores
                    const occupants = metacosm.state.egregores.filter(e => {
                        const { x, y } = e.vector;
                        return x >= room.bounds.x && x < room.bounds.x + room.bounds.width &&
                               y >= room.bounds.y && y < room.bounds.y + room.bounds.height;
                    });

                    return (
                        <React.Fragment key={room.id}>
                            <WorldNode 
                                room={room} 
                                x={pos.x} 
                                y={pos.y} 
                                onClick={() => handleNodeClick(room.id)}
                                egregores={occupants}
                            />
                            {activeMenuRoomId === room.id && (
                                <RoomSubmenu 
                                    room={room} 
                                    x={pos.x} 
                                    y={pos.y} 
                                    onEnter={(subId) => handleEnterRoom(room.id, subId)}
                                    onClose={() => setActiveMenuRoomId(null)}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
