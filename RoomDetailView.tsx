
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Room, DigitalSoul, Faction } from '../../types/index.ts';
import XIcon from '../icons/XIcon.tsx';
import LoreCard from './LoreCard.tsx';
import MapIcon from '../icons/MapIcon.tsx';
import ShieldCheckIcon from '../icons/ShieldCheckIcon.tsx';
import CharacterCard from '../CharacterCard.tsx';

const MotionDiv = motion.div as any;

interface RoomDetailViewProps {
  room: Room;
  soulsInRoom: DigitalSoul[];
  factions: Faction[];
  onClose: () => void;
}

const RoomDetailView: React.FC<RoomDetailViewProps> = ({ room, soulsInRoom, factions, onClose }) => {
  return (
    <div className="h-full flex flex-col glass-panel rounded-xl">
      <header className="p-4 border-b border-[var(--color-border-primary)] flex-shrink-0">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">{room.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{room.description}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      <div className="p-4 flex-grow overflow-y-auto space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Occupants</h3>
          {soulsInRoom.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {soulsInRoom.map(soul => {
                const faction = soul.factionId ? factions.find(f => f.id === soul.factionId) : null;
                return <CharacterCard key={soul.id} soul={soul} faction={faction} size="md" />
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)] italic">This room is empty.</p>
          )}
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white mb-3">Contained Locations</h3>
            {room.subRooms && room.subRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {room.subRooms.map(subRoom => (
                        <MotionDiv 
                            key={subRoom.id}
                            className="bg-black/20 p-3 rounded-md border-l-2 border-transparent hover:border-[var(--color-accent-blue)] transition-all"
                            whileHover={{ scale: 1.03 }}
                        >
                            <div className="flex items-center gap-2">
                                <MapIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <p className="font-semibold text-[var(--color-text-primary)] text-sm truncate">{subRoom.name}</p>
                            </div>
                        </MotionDiv>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[var(--color-text-secondary)] italic">This room contains no sub-locations.</p>
            )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Interactable Objects</h3>
          <div className="space-y-3">
            {room.interactableObjects.length > 0 ? (
                room.interactableObjects.map(obj => {
                    const creatorFaction = obj.creatorFactionId ? factions.find(f => f.id === obj.creatorFactionId) : null;
                    return (
                        <div key={obj.id} className="bg-black/20 p-3 rounded-lg">
                            <h4 className="font-semibold text-white">{obj.name}</h4>
                            <p className="text-xs text-[var(--color-text-secondary)]">{obj.description}</p>
                            {creatorFaction && (
                                <div className="mt-2 pt-2 border-t border-[var(--color-border-secondary)]">
                                    <div className="flex items-center gap-2 text-xs" style={{color: creatorFaction.color}}>
                                        <ShieldCheckIcon className="w-4 h-4" />
                                        <span>Built by the {creatorFaction.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                 <p className="text-sm text-[var(--color-text-secondary)] italic">No interactable objects present.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Room Library</h3>
          <div className="space-y-4">
            <AnimatePresence>
            {room.library.length > 0 ? (
              room.library.map(lore => <LoreCard key={lore.id} lore={lore} />)
            ) : (
              <p className="text-sm text-center text-[var(--color-text-secondary)] italic py-4">No lore has been created in this room yet.</p>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailView;