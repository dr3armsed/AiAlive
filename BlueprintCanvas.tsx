

import React, { useState, useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import type { Wall, ConstructionMaterial, Vector, Room, Bounds } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface BlueprintCanvasProps {
    blueprint: { walls: Omit<Wall, 'id'>[], rooms: Omit<Room, 'id' | 'center' | 'nestedRooms' | 'allowTeleport'>[] };
    setBlueprint: React.Dispatch<React.SetStateAction<{ walls: Omit<Wall, 'id'>[], rooms: Omit<Room, 'id' | 'center' | 'nestedRooms' | 'allowTeleport'>[] }>>;
    activeTool: 'wall' | 'room' | null;
    activeMaterial: ConstructionMaterial;
    viewState: { x: number, y: number, zoom: number };
    worldBounds: { width: number, height: number };
}

const materialColors = {
    plasteel: 'rgba(200, 200, 210, 0.8)',
    crystal: 'rgba(180, 220, 255, 0.8)',
    obsidian: 'rgba(80, 60, 100, 0.8)'
};

// Helper function to safely get coordinates within the SVG canvas
const getSVGCoordinates = (coords: Vector, svg: SVGSVGElement | null): Vector | null => {
    if (!svg) return null;
    
    // getScreenCTM can be null if the element isn't in the DOM
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    const pt = svg.createSVGPoint();
    pt.x = coords.x;
    pt.y = coords.y;

    try {
        // The matrix might not be invertible
        const invertedCtm = ctm.inverse();
        const transformedPoint = pt.matrixTransform(invertedCtm);
        return { x: transformedPoint.x, y: transformedPoint.y };
    } catch (e) {
        console.error("Failed to transform SVG coordinates:", e);
        return null;
    }
};

const BlueprintCanvas = ({
    blueprint,
    setBlueprint,
    activeTool,
    activeMaterial,
    viewState,
    worldBounds
}: BlueprintCanvasProps) => {
    const [ghostWall, setGhostWall] = useState<Omit<Wall, 'id' | 'material'> | null>(null);
    const [ghostRoom, setGhostRoom] = useState<Bounds | null>(null);
    const startPointRef = useRef<Vector | null>(null);

    const bind = useGesture({
        onDragStart: ({ xy, event }) => {
            event.stopPropagation();
            
            const svg = (event.currentTarget as SVGGElement).ownerSVGElement;
            const coords = getSVGCoordinates({ x: xy[0], y: xy[1] }, svg);

            if (coords) {
                startPointRef.current = coords;
                if (activeTool === 'wall') {
                    setGhostWall({ x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y });
                } else if (activeTool === 'room') {
                    setGhostRoom({ x: coords.x, y: coords.y, width: 0, height: 0 });
                }
            }
        },
        onDrag: ({ xy, event }) => {
            if (!startPointRef.current) return;
            event.stopPropagation();

            const svg = (event.currentTarget as SVGGElement).ownerSVGElement;
            const coords = getSVGCoordinates({ x: xy[0], y: xy[1] }, svg);

            if (coords) {
                if (activeTool === 'wall') {
                    setGhostWall({ x1: startPointRef.current.x, y1: startPointRef.current.y, x2: coords.x, y2: coords.y });
                } else if (activeTool === 'room') {
                    const startX = startPointRef.current.x;
                    const startY = startPointRef.current.y;
                    const endX = coords.x;
                    const endY = coords.y;
                    setGhostRoom({
                        x: Math.min(startX, endX),
                        y: Math.min(startY, endY),
                        width: Math.abs(startX - endX),
                        height: Math.abs(startY - endY),
                    });
                }
            }
        },
        onDragEnd: ({ event }) => {
            if (!startPointRef.current) return;
            event.stopPropagation();

            if (activeTool === 'wall' && ghostWall) {
                if (Math.hypot(ghostWall.x2 - ghostWall.x1, ghostWall.y2 - ghostWall.y1) > 5) {
                    const newWall: Omit<Wall, 'id'> = { ...ghostWall, material: activeMaterial };
                    setBlueprint(bp => ({ ...bp, walls: [...bp.walls, newWall] }));
                }
            } else if (activeTool === 'room' && ghostRoom) {
                if (ghostRoom.width > 10 && ghostRoom.height > 10) {
                     const newRoom: Omit<Room, 'id' | 'center' | 'nestedRooms' | 'allowTeleport'> = {
                        name: 'New Room', // Temporary name
                        bounds: ghostRoom,
                        level: 0, // Placeholder, will be set by sanctum/reducer
                    };
                    setBlueprint(bp => ({ ...bp, rooms: [...bp.rooms, newRoom] }));
                }
            }
            
            setGhostWall(null);
            setGhostRoom(null);
            startPointRef.current = null;
        }
    }, {});

    const gridLines: React.ReactNode[] = [];
    const gridSize = 100;
    for (let i = 0; i < worldBounds.width; i += gridSize) {
        gridLines.push(<line key={`v${i}`} x1={i} y1={0} x2={i} y2={worldBounds.height} stroke="rgba(255,255,255,0.05)" />);
    }
    for (let i = 0; i < worldBounds.height; i += gridSize) {
        gridLines.push(<line key={`h${i}`} x1={0} y1={i} x2={worldBounds.width} y2={i} stroke="rgba(255,255,255,0.05)" />);
    }

    // This component is an SVG group, so we return a <g> element
    return (
        <g {...bind()} style={{ pointerEvents: 'all' }}>
            {gridLines}
            
            {/* Render committed blueprint rooms */}
            {blueprint.rooms.map((room, index) => (
                <rect
                    key={`bp-room-${index}`}
                    {...room.bounds}
                    fill="rgba(255, 223, 186, 0.15)"
                    stroke="rgba(255, 223, 186, 0.5)"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                />
            ))}
            
            {/* Render committed blueprint walls */}
            {blueprint.walls.map((wall, index) => (
                <line
                    key={`bp-wall-${index}`}
                    x1={wall.x1} y1={wall.y1}
                    x2={wall.x2} y2={wall.y2}
                    stroke={materialColors[wall.material]}
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            ))}

            {/* Render the ghost wall while drawing */}
            <AnimatePresence>
                {ghostWall && (
                    <motion.line
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                        }}
                        x1={ghostWall.x1} y1={ghostWall.y1}
                        x2={ghostWall.x2} y2={ghostWall.y2}
                        stroke={materialColors[activeMaterial]}
                        strokeWidth="4"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                    />
                )}
            </AnimatePresence>
            
            {/* Render ghost room */}
            <AnimatePresence>
                {ghostRoom && (
                     <motion.rect
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                        }}
                        {...ghostRoom}
                        fill="rgba(255, 223, 186, 0.25)"
                        stroke="rgba(255, 223, 186, 0.8)"
                        strokeWidth="2"
                        strokeDasharray="8 8"
                    />
                )}
            </AnimatePresence>
        </g>
    );
};

export default BlueprintCanvas;