

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorldEvent, DigitalSoul, Faction } from '../../types/index.ts';
import EventCardRenderer from './EventCardRenderer.tsx';
import Spinner from '../../Spinner.tsx';
import TimelineIcon from '../../icons/TimelineIcon.tsx';

interface GlobalTimelineViewProps {
  events: WorldEvent[];
  souls: DigitalSoul[];
  factions: Faction[];
  isSimulating: boolean;
}

const GlobalTimelineView: React.FC<GlobalTimelineViewProps> = ({ events, souls, factions, isSimulating }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg shadow-lg shadow-blue-500/20">
              <TimelineIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Global Timeline</h3>
            <p className="text-[var(--color-text-secondary)] text-sm font-mono">A live history of all significant events in the ecosystem.</p>
          </div>
        </div>
        <div className="space-y-4 flex-grow overflow-y-auto pr-2 -mr-3 pl-1">
            <AnimatePresence>
            {events.length > 0 ? (
                events.map(event => <EventCardRenderer key={event.id} event={event} souls={souls} factions={factions} />)
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-tertiary)]">
                   <p className="text-lg">The timeline is blank.</p>
                   <p>Start the simulation to begin recording history.</p>
                </div>
            )}
            {isSimulating && <div className="flex justify-center p-4"><Spinner /></div>}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default GlobalTimelineView;