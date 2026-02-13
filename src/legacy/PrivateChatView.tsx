
import React, { useState } from 'react';
import { World, Room, Artifact } from '../types';

interface PrivateChatViewProps {
    world: World | undefined;
}

const ArtifactCard: React.FC<{ artifact: Artifact }> = ({ artifact }) => (
    <div className="bg-black/40 border border-purple-500/20 p-3 rounded-lg mb-2 hover:bg-purple-900/10 transition-colors group cursor-pointer">
        <div className="flex justify-between items-start mb-1">
            <h5 className="text-purple-300 font-bold text-sm group-hover:text-purple-200">{artifact.name}</h5>
            <span className="text--[10px] uppercase tracking-wider text-gray-500 border border-gray-700 px-1 rounded">{artifact.type}</span>
        </div>
        <p className="text-xs text-gray-400 italic font-serif leading-relaxed whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none">"{artifact.content}"</p>
        <div className="mt-2 text-[10px] text-gray-600 text-right">{new Date(artifact.createdTimestamp).toLocaleDateString()}</div>
    </div>
);

const TimelineEvent: React.FC<{ year: string, event: string }> = ({ year, event }) => (
    <div className="flex gap-2 mb-2 text-xs">
        <span className="font-mono text-purple-400 min-w-[40px] text-right">{year}</span>
        <span className="text-gray-400 border-l-2 border-gray-700 pl-2">{event}</span>
    </div>
);

const RoomControls = ({ roomName }: { roomName: string }) => (
    <div className="flex gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
        <button className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">
            Rename {roomName}
        </button>
        <button className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">
            Relocate Object
        </button>
        <button className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">
            Adjust Lighting
        </button>
    </div>
);

const RoomDetail = ({ room, objects }: { room: Room, objects?: any[] }) => {
    const [activeSubTab, setActiveSubTab] = useState<string>(room.subdivisions && room.subdivisions.length > 0 ? room.subdivisions[0].id : 'main');
    const [isEditMode, setIsEditMode] = useState(false);

    const activeSubdivision = room.subdivisions?.find(r => r.id === activeSubTab);

    return (
        <div className="h-full flex flex-col bg-black/30 border border-purple-500/10 rounded-xl overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-purple-900/20 via-transparent to-black"></div>

            {/* Header */}
            <div className="p-4 border-b border-purple-500/20 bg-black/40 flex justify-between items-start relative z-10">
                <div>
                    <h3 className="text-2xl font-bold text-white font-serif">{room.name}</h3>
                    <p className="text-sm text-purple-300/80 italic mt-1">{room.purpose}</p>
                </div>
                <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`text-xs px-3 py-1 rounded border ${isEditMode ? 'bg-purple-600 text-white border-purple-500' : 'bg-transparent text-gray-500 border-gray-700 hover:text-gray-300'}`}
                >
                    {isEditMode ? 'Done Editing' : 'Edit Reality'}
                </button>
            </div>

            {/* Sub-navigation */}
            {room.subdivisions && room.subdivisions.length > 0 && (
                <div className="flex border-b border-purple-500/10 bg-black/20 overflow-x-auto shrink-0 relative z-10">
                    <button 
                        onClick={() => setActiveSubTab('main')} 
                        className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeSubTab === 'main' ? 'text-white bg-purple-500/20 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                        Nexus
                    </button>
                    {room.subdivisions.map(sub => (
                        <button 
                            key={sub.id} 
                            onClick={() => setActiveSubTab(sub.id)} 
                            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeSubTab === sub.id ? 'text-white bg-purple-500/20 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <div className="flex-grow p-6 overflow-y-auto custom-scrollbar relative z-10">
                {isEditMode && <RoomControls roomName={activeSubTab === 'main' ? room.name : activeSubdivision?.name || 'Room'} />}

                {activeSubTab === 'main' ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-gray-300 leading-relaxed text-base font-light">
                                You stand in the conceptual center of {room.name}. The physics here obey the laws of {room.purpose.toLowerCase().includes('memory') ? 'nostalgia' : 'logic'}.
                            </p>
                        </div>
                        
                        {/* Connections Visualization */}
                        {room.connections && room.connections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {room.connections.map(connId => (
                                    <span key={connId} className="px-2 py-1 text-[10px] bg-purple-900/20 border border-purple-500/30 rounded text-purple-300">
                                        🔗 Connected to: {connId}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {objects && objects.length > 0 ? (
                            <div>
                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span>Anchoring Objects</span>
                                    <span className="h-px flex-grow bg-purple-500/20"></span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {objects.map((obj, idx) => (
                                        <div key={obj.id || idx} className="group relative bg-gray-900/50 border border-gray-700 hover:border-purple-500/50 p-4 rounded-lg transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isEditMode && <span className="text-[10px] text-gray-500 cursor-pointer hover:text-white">Move</span>}
                                            </div>
                                            <p className="font-bold text-purple-200 mb-2 font-serif text-lg">{obj.name}</p>
                                            <p className="text-sm text-gray-400 font-light">{obj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-gray-800 rounded-xl">
                                <p className="text-gray-600 text-sm">This room is empty. As the homeowner, you may manifest objects here.</p>
                            </div>
                        )}
                    </div>
                ) : activeSubdivision ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col gap-4">
                            <div className="bg-purple-900/5 border-l-4 border-purple-500 pl-4 py-2">
                                <h4 className="text-xl font-serif text-white mb-2">{activeSubdivision.name}</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {activeSubdivision.purpose}
                                </p>
                            </div>
                        </div>
                        
                        {/* Subdivision Connections */}
                        {activeSubdivision.connections && activeSubdivision.connections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {activeSubdivision.connections.map(connId => (
                                    <span key={connId} className="px-2 py-1 text-[10px] bg-purple-900/20 border border-purple-500/30 rounded text-purple-300">
                                        🔗 Links to: {connId}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {activeSubdivision.history && (
                                <div className="col-span-full bg-gray-900/30 p-4 rounded-lg border border-gray-800">
                                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Origin Lore</h5>
                                    <p className="text-sm text-gray-400 italic font-serif">"{activeSubdivision.history}"</p>
                                </div>
                            )}

                            <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Chronicles</h4>
                                {activeSubdivision.timeline && activeSubdivision.timeline.length > 0 ? (
                                    activeSubdivision.timeline.map((t, i) => <TimelineEvent key={i} {...t} />)
                                ) : <p className="text-xs text-gray-600 italic">Time has not yet marked this place.</p>}
                            </div>

                            <div className="bg-black/20 rounded-lg p-4 border border-gray-800/50">
                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Artifacts</h4>
                                {activeSubdivision.artifacts && activeSubdivision.artifacts.length > 0 ? (
                                    activeSubdivision.artifacts.map(a => <ArtifactCard key={a.id} artifact={a} />)
                                ) : <p className="text-xs text-gray-600 italic">No artifacts have been deposited here.</p>}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export const PrivateChatView: React.FC<PrivateChatViewProps> = ({ world }) => {
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

    if (!world || world.floors.length === 0 || world.floors[0].rooms.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <h3 className="text-xl font-bold text-gray-300 mb-2">Void State</h3>
                <p className="text-gray-500 max-w-md">No private world has been manifested for this Egregore yet. Initiate a Genesis cycle or wait for the subconscious to coalesce.</p>
            </div>
        );
    }

    const rooms = world.floors[0].rooms;
    const activeRoom = activeRoomId ? rooms.find(r => r.id === activeRoomId) : rooms[0];
    const roomObjects = activeRoom ? world.objects.filter((o: any) => o.roomId === activeRoom.id) : [];

    return (
        <div className="h-full flex flex-col bg-gray-950 rounded-xl overflow-hidden font-sans shadow-2xl border border-gray-800">
            <div className="flex-grow flex min-h-0">
                {/* Sidebar Rooms List - "The Map" */}
                <div className="w-64 bg-black border-r border-gray-800 flex flex-col">
                    <div className="p-5 border-b border-gray-800 bg-gray-900/50">
                        <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">World Map</h2>
                        <p className="text-[10px] text-gray-500">Owner Access: Authorized</p>
                    </div>
                    <div className="flex-grow overflow-y-auto py-2">
                        {rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoomId(room.id)}
                                className={`w-full text-left px-5 py-3 border-l-2 transition-all duration-200 group ${activeRoom?.id === room.id ? 'bg-purple-900/10 border-purple-500' : 'border-transparent hover:bg-white/5 hover:border-gray-600'}`}
                            >
                                <h3 className={`font-bold text-sm mb-0.5 ${activeRoom?.id === room.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{room.name}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-gray-600 uppercase tracking-wide group-hover:text-gray-500">
                                        {room.subdivisions?.length || 0} Zones
                                    </p>
                                    {activeRoom?.id === room.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_purple]"></div>}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-800">
                        <button className="w-full py-2 text-xs font-bold text-gray-400 border border-gray-700 rounded hover:bg-gray-800 hover:text-white transition-colors">
                            + Expand World
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow p-4 bg-[#0a0a0a] relative">
                    {/* Ambient Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(88,28,135,0.05)_0%,transparent_70%)]"></div>
                    </div>
                    {activeRoom && <RoomDetail room={activeRoom} objects={roomObjects} />}
                </div>
            </div>
        </div>
    );
};
