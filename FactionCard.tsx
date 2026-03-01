import React from 'react';
import { motion } from 'framer-motion';
import type { Faction, DigitalSoul, WorldEvent, FactionProjectCompleteWorldEvent } from '../../types/index.ts';
import ShieldCheckIcon from '../icons/ShieldCheckIcon.tsx';
import MapIcon from '../icons/MapIcon.tsx';
import BrainIcon from '../icons/BrainIcon.tsx';
import CharacterCard from '../CharacterCard.tsx';

const MotionDiv = motion.div as any;

interface FactionCardProps {
    faction: Faction;
    founder?: DigitalSoul;
    members: DigitalSoul[];
    worldEvents: WorldEvent[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 } 
  },
};

const FactionCard: React.FC<FactionCardProps> = ({ faction, founder, members, worldEvents }) => {
    const activeGoal = faction.goals.find(g => g.status === 'active');
    
    const completedProjects = worldEvents
        .filter((e): e is FactionProjectCompleteWorldEvent => e.type === 'FACTION_PROJECT_COMPLETE' && e.payload.factionId === faction.id)
        .map(e => e.payload);

    return (
        <MotionDiv
            variants={itemVariants}
            layout
            className="glass-panel p-4 flex flex-col border"
            style={{ 
                borderColor: `${faction.color}80`,
                background: `radial-gradient(circle at top left, ${faction.color}15, transparent 40%), var(--color-surface-1)`
            }}
        >
            <header className="pb-3 border-b flex items-start justify-between" style={{ borderColor: `${faction.color}33`}}>
                <div>
                    <h4 className="text-xl font-bold text-white">{faction.name}</h4>
                    <p className="text-xs font-mono text-[var(--color-text-tertiary)]">
                        Founded by <span style={{ color: faction.color }}>{founder?.name || 'an unknown soul'}</span>
                    </p>
                </div>
                 <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ border: `2px solid ${faction.color}`, background: `${faction.color}20`, boxShadow: `0 0 10px ${faction.color}50`}}>
                    <ShieldCheckIcon className="w-6 h-6" style={{ color: faction.color }} />
                 </div>
            </header>

            <div className="py-4 my-2 text-center bg-[var(--color-surface-inset)] rounded-md">
                <p className="text-[var(--color-text-primary)] italic text-sm">"{faction.ideology}"</p>
            </div>
            
            {activeGoal && (
                 <div className="mt-auto pt-3 border-t" style={{ borderColor: `${faction.color}33`}}>
                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{color: faction.color}}>
                        <BrainIcon className="w-4 h-4"/> <span>Active Goal</span>
                    </h5>
                    <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-inset)] p-2 rounded-md">
                        {activeGoal.description}
                    </p>
                </div>
            )}
            
            {completedProjects.length > 0 && (
                 <div className="mt-3 pt-3 border-t" style={{ borderColor: `${faction.color}33`}}>
                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{color: faction.color}}>
                        <MapIcon className="w-4 h-4" /> <span>Completed Projects</span>
                    </h5>
                     <div className="space-y-1">
                        {completedProjects.map(p => (
                            <p key={p.projectName} className="text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-inset)] p-1.5 rounded-md truncate">
                                <span>Built </span>
                                <span className="font-semibold" style={{color: faction.color}}>{p.projectName}</span>
                                <span> in {p.roomName}</span>
                            </p>
                        ))}
                    </div>
                </div>
            )}


            <div className="mt-auto pt-4 border-t" style={{ borderColor: `${faction.color}33`}}>
                <h5 className="font-semibold text-sm text-[var(--color-text-secondary)] mb-2">Members ({members.length})</h5>
                <div className="flex flex-wrap gap-2">
                    {members.map(soul => (
                       <CharacterCard key={soul.id} soul={soul} faction={faction} size="sm" />
                    ))}
                </div>
            </div>

        </MotionDiv>
    );
};

export default FactionCard;