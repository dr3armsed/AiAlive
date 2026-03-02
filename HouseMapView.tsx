

import React from 'react';
import { useMemo } from '../../packages/react-chimera-renderer/index.ts';
import { motion } from 'framer-motion';
import type { Room, DigitalSoul, Faction } from '../../types/index.ts';

const MotionDiv = motion.div as any;

interface HouseMapViewProps {
  rooms: Room[];
  souls: DigitalSoul[];
  factions: Faction[];
  onSelectRoom: (roomId: string) => void;
  selectedRoomId: string | null;
}

// A static, handcrafted layout for the rooms to provide a consistent and logical map.
const staticRoomLayout: Record<string, { x: number; y: number }> = {
    'R07': { x: 0, y: 0 }, // Logic Engine
    'R04': { x: 1, y: 0 }, // Celestial Observatory
    'R09': { x: 2, y: 0 }, // Artificer's Workshop
    'R10': { x: 3, y: 0 }, // Oracle's Chamber
    'R08': { x: 4, y: 0 }, // Balcony of the Void
    'R17': { x: 0, y: 1 }, // Clockwork Room
    'R03': { x: 1, y: 1 }, // Library of Webs
    'R13': { x: 3, y: 1 }, // Archive of Self
    'R01': { x: 0, y: 2 }, // Genesis Chamber
    'R02': { x: 1, y: 2 }, // Hall of Echoes
    'R11': { x: 2, y: 2 }, // The Nexus
    'R16': { x: 3, y: 2 }, // Auditorium
    'R12': { x: 4, y: 2 }, // The Solarium
    'R15': { x: 1, y: 3 }, // Mirror Room
    'R06': { x: 3, y: 3 }, // Mnemonic Garden
    'R05': { x: 2, y: 4 }, // Subterranean Forge
    'R14': { x: 2, y: 5 }, // Quarantine Zone
};


const HouseMapView: React.FC<HouseMapViewProps> = ({ rooms, souls, factions, onSelectRoom, selectedRoomId }) => {
  
    const allRoomsFlat = useMemo(() => {
        const flatten = (r: Room[]): Room[] => {
            return r.reduce((acc, room) => {
                acc.push(room);
                if (room.subRooms) {
                    acc.push(...flatten(room.subRooms));
                }
                return acc;
            }, [] as Room[]);
        };
        return flatten(rooms);
    }, [rooms]);

    const { gridPositions, connections } = useMemo(() => {
        const posMap = new Map<string, { x: number, y: number }>();
        allRoomsFlat.forEach(room => {
            if (staticRoomLayout[room.id]) {
                posMap.set(room.id, staticRoomLayout[room.id]);
            } else {
                // Fallback for any rooms not in the layout
                console.warn(`Room ${room.id} not found in static layout.`);
            }
        });

        const connLines: { key: string, x1: number, y1: number, x2: number, y2: number }[] = [];
        allRoomsFlat.forEach(room => {
            const p1 = posMap.get(room.id);
            if (!p1) return;
            room.connections.forEach(connId => {
                const p2 = posMap.get(connId);
                if (p2) {
                    const key = [room.id, connId].sort().join('-');
                    if (!connLines.some(l => l.key === key)) {
                         connLines.push({ key, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
                    }
                }
            });
        });

        return { gridPositions: posMap, connections: connLines };
    }, [allRoomsFlat]);

    const getRoomInfluenceColor = (roomId: string): string | undefined => {
        const soulsInRoom = souls.filter(s => s.currentRoomId === roomId && s.factionId);
        if (soulsInRoom.length === 0) return undefined;

        const influence: Record<string, number> = {};
        soulsInRoom.forEach(s => {
            influence[s.factionId!] = (influence[s.factionId!] || 0) + 1;
        });

        const topFactionId = Object.entries(influence).sort((a,b) => b[1] - a[1])[0][0];
        return factions.find(f => f.id === topFactionId)?.color;
    };

    return (
        <MotionDiv className="w-full h-full bg-[var(--color-surface-inset)] rounded-lg p-4 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-full h-full grid grid-cols-5 grid-rows-6 gap-4">
                {/* SVG Layer for Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                   <defs>
                        <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                        </filter>
                    </defs>
                    <g>
                        {connections.map(({ key, x1, y1, x2, y2 }) => (
                            <line
                                key={key}
                                x1={`${(x1 * 20) + 10}%`}
                                y1={`${(y1 * (100/6)) + (100/12)}%`}
                                x2={`${(x2 * 20) + 10}%`}
                                y2={`${(y2 * (100/6)) + (100/12)}%`}
                                stroke="rgba(139, 148, 158, 0.2)"
                                strokeWidth="2"
                            />
                        ))}
                    </g>
                </svg>

                {/* Grid Layer for Rooms */}
                {allRoomsFlat.map(room => {
                    const pos = gridPositions.get(room.id);
                    if (!pos) return null;
                    const influenceColor = getRoomInfluenceColor(room.id);
                    const soulsInRoom = souls.filter(s => s.currentRoomId === room.id);
                    
                    return (
                        <MotionDiv
                            key={room.id}
                            className="relative"
                            style={{ gridColumn: pos.x + 1, gridRow: pos.y + 1 }}
                        >
                            <MotionDiv
                                onClick={() => onSelectRoom(room.id)}
                                className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all duration-300 border-2
                                    ${selectedRoomId === room.id ? 'border-[var(--color-border-glow)] scale-105 shadow-2xl' : 'border-transparent hover:scale-105'}`}
                                style={{
                                    backgroundColor: influenceColor ? `${influenceColor}20` : 'rgba(255, 255, 255, 0.03)',
                                    borderColor: selectedRoomId === room.id ? 'var(--color-border-glow)' : (influenceColor || 'transparent'),
                                    boxShadow: selectedRoomId === room.id ? 'var(--shadow-glow-brand)' : (influenceColor ? `0 0 15px ${influenceColor}40` : 'none'),
                                }}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <p className="text-xs font-bold text-white leading-tight">{room.name}</p>
                                <div className="flex mt-1.5 -space-x-1">
                                    {soulsInRoom.slice(0, 3).map(soul => (
                                        <div key={soul.id} className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-[8px] font-bold ring-2 ring-black/50" title={soul.name}>
                                            {soul.name.charAt(0)}
                                        </div>
                                    ))}
                                    {soulsInRoom.length > 3 && (
                                         <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-[8px] font-bold ring-2 ring-black/50">
                                            +{soulsInRoom.length - 3}
                                        </div>
                                    )}
                                </div>
                            </MotionDiv>
                        </MotionDiv>
                    );
                })}
            </div>
        </MotionDiv>
    );
};

export default HouseMapView;