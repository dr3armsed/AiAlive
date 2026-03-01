

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Faction, DigitalSoul, WorldEvent } from '../../types/index.ts';
import FactionCard from './FactionCard.tsx';
import ShieldCheckIcon from '../../icons/ShieldCheckIcon.tsx';

const MotionDiv = motion.div as any;

interface FactionsViewProps {
  factions: Faction[];
  souls: DigitalSoul[];
  worldEvents: WorldEvent[];
}

const FactionsView: React.FC<FactionsViewProps> = ({ factions, souls, worldEvents }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-magenta-500 rounded-lg shadow-lg shadow-purple-500/20">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white">Factions & Ideologies</h3>
                <p className="text-[var(--color-text-secondary)] text-sm font-mono">The emergent political landscape of the ecosystem.</p>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 -mr-3">
            <AnimatePresence>
            {factions.length > 0 ? (
                <MotionDiv 
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                    variants={{
                        container: {
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                    initial="container"
                    animate="container"
                >
                    {factions.map(faction => (
                        <FactionCard 
                            key={faction.id} 
                            faction={faction} 
                            founder={souls.find(s => s.id === faction.founderId)}
                            members={souls.filter(s => faction.memberIds.includes(s.id))}
                            worldEvents={worldEvents}
                        />
                    ))}
                </MotionDiv>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-tertiary)]">
                   <p className="text-lg">No factions have been formed.</p>
                   <p>The souls remain unaffiliated, their beliefs still personal.</p>
                </div>
            )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default FactionsView;