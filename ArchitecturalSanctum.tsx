import React, { useState, useRef, useEffect } from 'react';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import MovingEgregore from '@/components/MovingEgregore';
import EgregoreInfoPanel from '@/components/EgregoreInfoPanel';
import RoomInfoPanel from '@/components/RoomInfoPanel';
import DigitalObjectInfoPanel from '@/components/DigitalObjectInfoPanel';
import ViewControls from '@/components/ViewControls';
import { THEMES } from '@/constants';
import type { Egregore, Room, WorldObject, Vector, Floor, Door, Wall, ConstructionMaterial, DigitalObject, CosmTheme } from '@/types';
import clsx from 'clsx';
import NavigationControls from '@/components/NavigationControls';
import { CoreIcon, GlyphIcon, SparklesIcon } from '@/components/icons';
import DigitalObjectComponent from '@/components/DigitalObjectComponent';
import ArchitecturalGlyphs from '@/components/ArchitecturalGlyphs';
import { coordToString } from '@/state/reducer';
import BlueprintCanvas from '@/components/BlueprintCanvas';
import { BlueprintToolbar } from '@/components/BlueprintToolbar';

interface RoomComponentProps {
    room: Room;
    isSelected: boolean;
    onSelect: (room: Room) => void;
    onDragRoom: (roomId: string, delta: Vector) => void;
    theme: CosmTheme;
    isBlueprintMode: boolean;
}

const RoomComponent = ({ room, isSelected, onSelect, onDragRoom, theme, isBlueprintMode }: RoomComponentProps) => {
    
    const bind = useGesture({
        onDragStart: ({ event }) => {
            if (!isBlueprintMode) return;
            event.stopPropagation();
        },
        onDrag: ({ movement: [mx, my], first, memo }) => {
             if (!isBlueprintMode) return memo;
            if (first) {
              return { x: room.bounds.x, y: room.bounds.y };
            }
            return memo;
        },
        onDragEnd: ({ movement: [mx, my], event }) => {
            if (!isBlueprintMode) return;
            event.stopPropagation();
             onDragRoom(room.id, { x: mx, y: my });
        },
        onClick: ({ event }) => {
            event.stopPropagation();
            onSelect(room);
        }
    }, {
        drag: { filterTaps: true, enabled: isBlueprintMode }
    });
    
    return (
         <g
            {...bind()}
            className={clsx(isBlueprintMode && 'cursor-move')}
            transform={`translate(${room.bounds.x}, ${room.bounds.y})`}
        >
            <rect
                x={0}
                y={0}
                width={room.bounds.width}
                height={room.bounds.height}
                fill={isSelected ? theme.roomFillSelected : theme.roomFill}
                stroke={theme.roomStroke}
                strokeWidth="1"
                className="hover:fill-amber-400/20 transition-colors"
            />
             <text x={10} y={20} className="fill-current text-gray-400 text-xs pointer-events-none select-none">{room.name}</text>
        </g>
    )
};

const SINGLE_FLOOR_THEME: CosmTheme = {
    name: 'Cosm of Genesis',
    bgColor1: 'rgba(2, 6, 23, 0.5)',
    bgColor2: 'rgba(5, 11, 34, 0.7)',
    glowPrimary: '#cbe7ff',
    glowSecondary: '#ffaa7b',
    accent: '#ffe18d',
    glass: 'rgba(20, 32, 65, 0.45)',
    wallStroke: 'rgba(255, 223, 186, 0.4)',
    roomStroke: 'rgba(255, 223, 186, 0.15)',
    roomFill: 'rgba(20, 32, 65, 0.3)',
    roomFillSelected: 'rgba(255, 223, 186, 0.25)',
};


const ArchitecturalSanctum = () => {
    const state = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const { world, egregores, digital_objects, activeCoordinate, architect_aether, is_blueprint_mode_active } = state;
    const ref = useRef<HTMLDivElement>(null);

    const [selectedEgregore, setSelectedEgregore] = useState<Egregore | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedObject, setSelectedObject] = useState<DigitalObject | null>(null);
    const [isGlyphPanelOpen, setIsGlyphPanelOpen] = useState(false);

    const [viewState, setViewState] = useState({ 
        x: -world.bounds.width / 2 + (window.innerWidth / 2), 
        y: -world.bounds.height / 2 + (window.innerHeight / 2), 
        zoom: 0.5 
    });
    
    // Blueprint mode state
    const [blueprint, setBlueprint] = useState<{ walls: Omit<Wall, 'id'>[], rooms: Omit<Room, 'id' | 'center' | 'nestedRooms' | 'allowTeleport'>[] }>({ walls: [], rooms: [] });
    const [activeTool, setActiveTool] = useState<'wall' | 'room' | null>('wall');
    const [activeMaterial, setActiveMaterial] = useState<ConstructionMaterial>('plasteel');

    useEffect(() => {
        if (!is_blueprint_mode_active) {
            setBlueprint({ walls: [], rooms: [] });
        }
    }, [is_blueprint_mode_active]);
    
    useEffect(() => {
        const theme = SINGLE_FLOOR_THEME;
        const root = document.documentElement;
        root.style.setProperty('--axiom-bg-color-1', theme.bgColor1);
        root.style.setProperty('--axiom-bg-color-2', theme.bgColor2);
        root.style.setProperty('--glow-primary', theme.glowPrimary);
        root.style.setProperty('--glow-secondary', theme.glowSecondary);
        root.style.setProperty('--metacosm-accent', theme.accent);
        root.style.setProperty('--metacosm-glass', theme.glass);
    }, []);

    const gesture = useGesture({
        onDrag: ({ pinching, cancel, offset: [dx, dy] }) => {
            if (pinching) return cancel();
            if (selectedEgregore || selectedRoom || selectedObject || is_blueprint_mode_active) return; // Prevent panning when panel is open or in blueprint mode
            setViewState(vs => ({ ...vs, x: dx, y: dy }))
        },
        onPinch: ({ offset: [d] }) => {
            setViewState(vs => ({ ...vs, zoom: d }))
        },
    }, { 
        target: ref,
        eventOptions: { passive: false },
        drag: { from: () => [viewState.x, viewState.y] },
        pinch: { from: () => [viewState.zoom, 0], scaleBounds: {min: 0.1, max: 2}}
    });

    const handleSelectRoom = (room: Room) => {
        setSelectedRoom(room);
        setSelectedEgregore(null);
        setSelectedObject(null);
    }

    const handleSelectEgregore = (egregore: Egregore) => {
        setSelectedEgregore(egregore);
        setSelectedRoom(null);
        setSelectedObject(null);
    }
    
    const handleSelectObject = (obj: DigitalObject) => {
        setSelectedObject(obj);
        setSelectedEgregore(null);
        setSelectedRoom(null);
    }

    const handleToggleDoor = (doorId: string) => {
        dispatch({type: 'TOGGLE_DOOR', payload: { doorId }});
    }

    const handleDragRoom = (roomId: string, delta: Vector) => {
        dispatch({ type: 'MOVE_ROOM', payload: { floorLevel: activeCoordinate.z, roomId, delta } });
    };
    
    const handleCommitBlueprint = () => {
        if (blueprint.walls.length === 0 && blueprint.rooms.length === 0) {
             dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `Blueprint is empty. Nothing to commit.` });
            return;
        }
        dispatch({ type: 'ADD_BLUEPRINT_ELEMENTS', payload: { floorLevel: activeCoordinate.z, ...blueprint }});
        dispatch({ type: 'TOGGLE_BLUEPRINT_MODE' });
    };
    const handleDiscardBlueprint = () => {
        setBlueprint({ walls: [], rooms: [] });
    };
    const handleExitBlueprint = () => {
        if (blueprint.walls.length > 0 || blueprint.rooms.length > 0) {
            if(window.confirm("You have unsaved changes in your blueprint. Are you sure you want to exit and discard them?")) {
                dispatch({ type: 'TOGGLE_BLUEPRINT_MODE' });
            }
        } else {
            dispatch({ type: 'TOGGLE_BLUEPRINT_MODE' });
        }
    };

    const currentFloor = world.floors[coordToString(activeCoordinate)];

    const renderFloor = (floor: Floor) => {
        if (!floor) return null;

        const renderObject = (obj: WorldObject) => {
            switch (obj.type) {
                case 'stairwell':
                    return (
                        <g key={obj.id} transform={`translate(${obj.position.x}, ${obj.position.y})`}>
                           <rect x="-10" y="-10" width="20" height="20" fill="rgba(255,223,186,0.2)" stroke="rgba(255,223,186,0.6)" strokeWidth="1" rx="4" />
                            <text y="5" textAnchor="middle" fill="rgba(255,223,186,0.9)" fontSize="14">≡</text>
                        </g>
                    );
                case 'construction_site':
                    return (
                        <g key={obj.id} transform={`translate(${obj.position.x}, ${obj.position.y})`}>
                           <rect x="-20" y="-10" width="40" height="20" fill="rgba(255, 165, 0, 0.2)" stroke="rgba(255, 165, 0, 0.6)" strokeWidth="1" rx="4" />
                            <text y="5" textAnchor="middle" fill="rgba(255, 165, 0, 0.9)" fontSize="10">🚧</text>
                        </g>
                    );
                default:
                    return null;
            }
        };

        const renderDoor = (door: Door) => (
             <rect
                key={door.id}
                x={door.center.x - door.size / 2}
                y={door.center.y - door.size / 2}
                width={door.size}
                height={door.size}
                fill={door.isOpen ? 'rgba(130, 255, 130, 0.5)' : 'rgba(255, 130, 130, 0.5)'}
                stroke={door.isOpen ? '#adff2f' : '#ff4500'}
                strokeWidth="2"
                className="cursor-pointer hover:stroke-width-4"
                onClick={() => handleToggleDoor(door.id)}
            />
        );

        return (
            <g key={floor.level}>
                {floor.walls.map(wall => (
                     <line
                        key={wall.id}
                        x1={wall.x1} y1={wall.y1}
                        x2={wall.x2} y2={wall.y2}
                        stroke={SINGLE_FLOOR_THEME.wallStroke}
                        strokeWidth="2"
                        filter="url(#glow)"
                    />
                ))}
                 {floor.objects.map(renderObject)}
                {floor.rooms.map(room => (
                    <RoomComponent 
                        key={room.id} 
                        room={room} 
                        isSelected={selectedRoom?.id === room.id}
                        onSelect={handleSelectRoom}
                        onDragRoom={handleDragRoom}
                        theme={SINGLE_FLOOR_THEME}
                        isBlueprintMode={is_blueprint_mode_active}
                    />
                ))}
                 {floor.doors.map(renderDoor)}
            </g>
        )
    };
    
    return (
        <div 
            ref={ref} 
            className={clsx("w-full h-full bg-transparent overflow-hidden relative", !is_blueprint_mode_active && "cursor-grab active:cursor-grabbing", is_blueprint_mode_active && "cursor-crosshair")}
            onClick={() => { setSelectedEgregore(null); setSelectedRoom(null); setSelectedObject(null); }}
        >
            <motion.div
                className="w-full h-full origin-top-left"
                style={{
                    width: world.bounds.width,
                    height: world.bounds.height,
                    touchAction: 'none',
                }}
                {...{
                    animate: {
                        x: viewState.x,
                        y: viewState.y,
                        scale: viewState.zoom,
                    },
                    transition: { duration: 0.3, type: 'tween', ease: 'linear' },
                }}
            >
                <svg width={world.bounds.width} height={world.bounds.height} className="absolute inset-0">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {currentFloor && renderFloor(currentFloor)}
                    
                     {/* Render Digital Objects */}
                    <g>
                        {digital_objects.filter(obj => !obj.holderId && obj.position.z === activeCoordinate.z).map(obj => (
                            <DigitalObjectComponent key={obj.id} object={obj} onSelect={() => handleSelectObject(obj)} />
                        ))}
                    </g>
                     <AnimatePresence>
                        {is_blueprint_mode_active && (
                            <BlueprintCanvas
                                blueprint={blueprint}
                                setBlueprint={setBlueprint}
                                activeTool={activeTool}
                                activeMaterial={activeMaterial}
                                viewState={viewState}
                                worldBounds={world.bounds}
                            />
                        )}
                    </AnimatePresence>
                </svg>

                <AnimatePresence>
                {egregores.filter(e => e.vector.z === activeCoordinate.z).map(egregore => (
                    <MovingEgregore 
                        key={egregore.id} 
                        egregore={egregore} 
                        theme={THEMES[egregore.themeKey] || THEMES.default}
                        onClick={() => handleSelectEgregore(egregore)}
                    />
                ))}
                </AnimatePresence>
            </motion.div>
            
            <AnimatePresence>
                {selectedEgregore && <EgregoreInfoPanel egregore={selectedEgregore} onClose={() => setSelectedEgregore(null)} />}
                {selectedRoom && <RoomInfoPanel room={selectedRoom} onClose={() => setSelectedRoom(null)} />}
                {selectedObject && <DigitalObjectInfoPanel object={selectedObject} onClose={() => setSelectedObject(null)} />}
            </AnimatePresence>
            
            <motion.div
                {...{
                    animate: {
                        opacity: isGlyphPanelOpen ? 0 : 1,
                    },
                    transition: { duration: 0.2 },
                }}
                className={clsx(isGlyphPanelOpen && "pointer-events-none")}
            >
                <div className="absolute top-24 right-6 z-20 flex items-center gap-4">
                    <button 
                        onClick={() => setIsGlyphPanelOpen(prev => !prev)}
                        className={clsx(
                            "p-2 rounded-full filigree-border transition-colors group",
                            "bg-black/50 text-gray-300 hover:text-white"
                        )}
                        title="Architectural Glyphs"
                    >
                        <GlyphIcon />
                    </button>
                </div>
                
                <ViewControls
                    className="absolute top-[148px] right-4 z-20"
                    zoom={viewState.zoom}
                    onZoomChange={(newZoom) => setViewState(vs => ({ ...vs, zoom: newZoom }))}
                    onZoomIn={() => setViewState(vs => ({ ...vs, zoom: Math.min(2, vs.zoom + 0.1) }))}
                    onZoomOut={() => setViewState(vs => ({ ...vs, zoom: Math.max(0.1, vs.zoom - 0.1) }))}
                    onCenterView={() => setViewState({ x: -world.bounds.width / 2 + (window.innerWidth / 2), y: -world.bounds.height / 2 + (window.innerHeight / 2), zoom: 0.5 })}
                />
            </motion.div>
            <div className="absolute bottom-4 left-4 z-20">
                <NavigationControls />
            </div>
            
            <AnimatePresence>
            {isGlyphPanelOpen && (
                 <ArchitecturalGlyphs 
                    onClose={() => setIsGlyphPanelOpen(false)}
                    selectedEgregore={selectedEgregore}
                    clearSelection={() => setSelectedEgregore(null)}
                />
            )}
             {is_blueprint_mode_active && (
                <BlueprintToolbar
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    activeMaterial={activeMaterial}
                    setActiveMaterial={setActiveMaterial}
                    onCommit={handleCommitBlueprint}
                    onDiscard={handleDiscardBlueprint}
                    onExit={handleExitBlueprint}
                />
            )}
            </AnimatePresence>

             <div className="absolute top-4 left-4 z-20 flex items-stretch gap-4">
                <div className="filigree-border px-4 py-2 flex items-center gap-2">
                    <SparklesIcon className="text-cyan-300" />
                    <span className="font-bold text-white">{architect_aether}</span>
                    <span className="text-sm text-gray-400">Aether</span>
                </div>
                 <div className="filigree-border px-4 py-2 flex items-center gap-3">
                    <h2 className="font-display" style={{ color: SINGLE_FLOOR_THEME.accent, textShadow: `0 0 8px ${SINGLE_FLOOR_THEME.accent}` }}>
                        The Metacosm
                    </h2>
                </div>
            </div>

        </div>
    );
};

export default ArchitecturalSanctum;