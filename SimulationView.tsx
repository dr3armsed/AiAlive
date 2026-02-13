
import React, { useState, useCallback, useMemo } from 'react';
import { Metacosm } from '../core/metacosm';
import { SimulationMap, InspectorPanel } from './simulation/components';
import { RoomDetailView } from './world/RoomDetailView';
import { Room } from '../types';

const WorldStats = ({ metacosm }: { metacosm: Metacosm }) => {
    // Renamed genmetas access to egregores
    const egregores = metacosm.state.egregores;
    const totalQuintessence = useMemo(() => egregores.reduce((sum, e) => sum + e.quintessence, 0), [egregores]);
    
    const avgStability = useMemo(() => {
        // Renamed genmetas access to egregores
        const minds = egregores.map(e => metacosm.getAgentMind(e.id)).filter(Boolean);
        if (minds.length === 0) return 1;
        const totalSerenity = minds.reduce((sum, mind) => sum + (mind?.emotionalState.vector.serenity || 0), 0);
        return totalSerenity / minds.length;
    }, [egregores, metacosm]);

    return (
        <div className="flex items-center gap-6 text-sm">
            <div>
                <span className="text-gray-400">Meta-Entities: </span>
                <span className="font-bold text-white">{egregores.length}</span>
            </div>
            <div>
                <span className="text-gray-400">Total Quintessence: </span>
                <span className="font-bold text-cyan-300">{totalQuintessence.toLocaleString()} Q</span>
            </div>
            <div>
                <span className="text-gray-400">Avg. Stability: </span>
                <span className="font-bold text-green-300">{(avgStability * 100).toFixed(1)}%</span>
            </div>
        </div>
    );
};

const ControlBar = ({ metacosm, isRunning, onStartPause, onReset }: {
    metacosm: Metacosm;
    isRunning: boolean;
    onStartPause: () => void;
    onReset: () => void;
}) => (
    <div className="shrink-0 p-3 border-t border-amber-300/10 bg-black/30 flex justify-between items-center">
        <div>
            <p className="text-lg font-bold">Turn: <span className="text-amber-300 font-mono">{metacosm.state.turn}</span></p>
            <p className="text-xs text-gray-400">Status: <span className={isRunning ? 'text-green-400' : 'text-red-400'}>{isRunning ? 'Running' : 'Paused'}</span></p>
        </div>
        <WorldStats metacosm={metacosm} />
        <div className="flex gap-4">
            <button onClick={onStartPause} className="px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:opacity-90 transition-opacity">
                {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={onReset} className="px-6 py-2 rounded-lg font-bold bg-gray-700 hover:bg-gray-600">
                Reset
            </button>
        </div>
    </div>
);


export const SimulationView = ({ metacosm, isRunning, onStartPause, onReset }: {
    metacosm: Metacosm;
    isRunning: boolean;
    onStartPause: () => void;
    onReset: () => void;
}) => {
    // Corrected state type to 'egregore'
    const [selectedEntity, setSelectedEntity] = useState<{ type: 'egregore' | 'room', id: string } | null>(null);
    const [activeSectorRoom, setActiveSectorRoom] = useState<Room | null>(null);

    // Corrected callback type to 'egregore'
    const handleSelectEntity = useCallback((type: 'egregore' | 'room', id: string) => {
        if (type === 'room') {
            const room = metacosm.state.world.floors[0].rooms.find(r => r.id === id);
            if (room) {
                setActiveSectorRoom(room);
                setSelectedEntity({ type: 'room', id });
            }
        } else {
            setSelectedEntity({ type: 'egregore', id });
        }
    }, [metacosm]);

    const handleBackToMap = () => {
        setActiveSectorRoom(null);
        setSelectedEntity(null);
    };

    return (
        <div className="flex h-full bg-black/20 rounded-xl border border-amber-300/10 shadow-xl overflow-hidden relative">
            <main className="w-2/3 flex flex-col relative">
                {/* Sector Detail Overlay */}
                {activeSectorRoom && (
                    <div className="absolute inset-0 z-50 animate-fade-in bg-gray-900/95 backdrop-blur-md">
                        <RoomDetailView 
                            room={activeSectorRoom} 
                            metacosm={metacosm} 
                            metacosmState={metacosm.state} 
                            onBack={handleBackToMap} 
                        />
                    </div>
                )}

                <div className={`relative flex-grow transition-all duration-700 ${activeSectorRoom ? 'blur-xl scale-110 opacity-30 pointer-events-none' : ''}`}>
                    <SimulationMap
                        metacosm={metacosm}
                        onSelectEntity={handleSelectEntity}
                        selectedEntityId={selectedEntity?.id || null}
                    />
                </div>
                
                <ControlBar
                    metacosm={metacosm}
                    isRunning={isRunning}
                    onStartPause={onStartPause}
                    onReset={onReset}
                />
            </main>
            <aside className="w-1/3 border-l border-amber-300/10 bg-black/10 flex flex-col">
                <InspectorPanel
                    selectedEntity={selectedEntity}
                    metacosm={metacosm}
                    onClearSelection={() => setSelectedEntity(null)}
                />
            </aside>
        </div>
    );
};
