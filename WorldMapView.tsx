

import React from 'react';
import { useState } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { Room, DigitalSoul, Faction } from '../../types/index.ts';
import RoomDetailView from './RoomDetailView.tsx';
import HouseMapView from './HouseMapView.tsx';

const MotionDiv = motion.div as any;

const findRoomById = (rooms: Room[], roomId: string): Room | undefined => {
    for (const room of rooms) {
        if (room.id === roomId) {
            return room;
        }
        if (room.subRooms && room.subRooms.length > 0) {
            const foundInSub = findRoomById(room.subRooms, roomId);
            if (foundInSub) {
                return foundInSub;
            }
        }
    }
    return undefined;
};

interface WorldMapViewProps {
  rooms: Room[];
  souls: DigitalSoul[];
  factions: Faction[];
}

const WorldMapView: React.FC<WorldMapViewProps> = ({ rooms, souls, factions }) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const selectedRoom = selectedRoomId ? findRoomById(rooms, selectedRoomId) : undefined;

  return (
    <div className="h-full flex gap-4 relative">
      <div className="flex-1 h-full min-w-0">
        <HouseMapView 
          rooms={rooms}
          souls={souls}
          factions={factions}
          onSelectRoom={setSelectedRoomId}
          selectedRoomId={selectedRoomId}
        />
      </div>
      <AnimatePresence>
        {selectedRoom && (
            <MotionDiv
                className="absolute top-0 right-0 w-full md:w-1/3 lg:w-2/5 xl:w-1/3 h-full flex-shrink-0"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: 'spring', stiffness: 250, damping: 30 }}
            >
                <RoomDetailView
                    room={selectedRoom}
                    soulsInRoom={souls.filter(s => s.currentRoomId === selectedRoom.id)}
                    factions={factions}
                    onClose={() => setSelectedRoomId(null)}
                />
            </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorldMapView;