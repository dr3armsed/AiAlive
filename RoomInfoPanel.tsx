import React from 'react';
import InfoPanel from '@/components/InfoPanel';
import { Room } from '@/types';

const RoomInfoPanel = ({ room, onClose }: { room: Room, onClose: () => void }) => {
    return (
        <InfoPanel title={room.name} onClose={onClose}>
            <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Purpose: </span>{room.purpose || 'Generic'}</p>
                <p><span className="text-gray-400">Level: </span>{room.level}</p>
                 {room.nestedRooms && room.nestedRooms.length > 0 && (
                    <div>
                        <span className="text-gray-400">Nested Rooms:</span>
                        <ul className="list-disc list-inside pl-2 text-gray-300">
                            {room.nestedRooms.map(nr => <li key={nr.id}>{nr.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </InfoPanel>
    );
};

export default RoomInfoPanel;