import React from 'react';
import type { Room } from '../types';
import { GiDoorway, GiTeamIdea } from 'react-icons/gi';

interface LibrariesViewProps {
    rooms: Room[];
    onSelectRoom: (id: string) => void;
}

const RoomCard: React.FC<{ room: Room, onSelect: () => void }> = ({ room, onSelect }) => {
    const color = '#e879f9'; // fuchsia-400

    return (
        <button 
            onClick={onSelect}
            className="bg-black/30 p-4 rounded-lg border border-gray-700 hover:border-fuchsia-400/50 transition-all duration-300 text-left backdrop-blur-sm transform hover:-translate-y-1"
        >
            <div className="flex items-start gap-4 mb-2">
                 <GiDoorway size={28} style={{ color }} />
                 <div>
                    <h3 className="font-bold text-lg font-display" style={{ color }}>{room.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{room.description}</p>
                 </div>
            </div>
             <div className="flex items-center text-sm text-fuchsia-300/80 mt-4">
                <GiTeamIdea className="mr-2" />
                <span>{room.projects.length} {room.projects.length === 1 ? 'Project' : 'Projects'}</span>
            </div>
        </button>
    )
};

const LibrariesView: React.FC<LibrariesViewProps> = ({ rooms, onSelectRoom }) => {
    return (
        <div className="w-full h-full p-8 overflow-y-auto">
            <h1 className="text-4xl font-display font-bold text-cyan-300 mb-2">Libraries</h1>
            <p className="text-gray-400 mb-8">Emergent conceptual spaces and the collaborative works within them.</p>

            {rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <RoomCard key={room.id} room={room} onSelect={() => onSelectRoom(room.id)} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-500">No rooms have emerged yet. Create one through conversation with the Soul.</p>
                </div>
            )}
        </div>
    );
};

export default LibrariesView;
