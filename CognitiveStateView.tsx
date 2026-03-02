import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DigitalSoul, Faction } from '../../types/index.ts';
import { createSignal } from '../../packages/react-chimera-renderer/index.ts';

import BeliefsDisplay from '../BeliefsDisplay.tsx';
import SkillsDisplay from '../SkillsDisplay.tsx';
import ResourceDisplay from '../ResourceDisplay.tsx';
import OracleStateDisplay from '../OracleStateDisplay.tsx';
import FactionAffiliationDisplay from '../FactionAffiliationDisplay.tsx';
import GoalsDisplay from '../GoalsDisplay.tsx';
import GenesisProgressDisplay from '../GenesisProgressDisplay.tsx';
import BodyStatusDisplay from '../BodyStatusDisplay.tsx';
import MemoryDisplay from './MemoryDisplay.tsx';
import ResonanceDisplay from '../ResonanceDisplay.tsx';

import HeartPulseIcon from '../icons/HeartPulseIcon.tsx';
import SparklesIcon from '../icons/SparklesIcon.tsx';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon.tsx';
import BookOpenIcon from '../icons/BookOpenIcon.tsx';
import DnaIcon from '../icons/DnaIcon.tsx';


const MotionDiv = motion.div as any;

interface CognitiveStateViewProps {
    soul: DigitalSoul;
    factions: Faction[];
}

type StateSubTab = 'vitals' | 'mind' | 'memory' | 'directives' | 'core';

const [getStateTab, setStateTab] = createSignal<StateSubTab>('vitals');

const StateTabButton: React.FC<{
  tabId: StateSubTab;
  icon: React.ReactNode;
  label: string;
}> = ({ tabId, icon, label }) => {
    const currentTab = getStateTab();
    return (
    <button
        onClick={() => setStateTab(tabId)}
        className={`relative flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-all ${currentTab === tabId ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        title={label}
    >
        {icon}
        <span className="text-xs mt-1">{label}</span>
        {currentTab === tabId && <MotionDiv layoutId="state-tab-indicator" className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400" />}
    </button>
)};

const CognitiveStateView: React.FC<CognitiveStateViewProps> = ({ soul, factions }) => {
    const stateTab = getStateTab();

    return (
        <>
            <div className="flex-shrink-0 flex items-center justify-around bg-black/20 p-1 rounded-lg border border-slate-700 mb-4">
                <StateTabButton tabId="vitals" icon={<HeartPulseIcon className="w-5 h-5" />} label="Vitals" />
                <StateTabButton tabId="mind" icon={<SparklesIcon className="w-5 h-5" />} label="Mind" />
                <StateTabButton tabId="memory" icon={<BookOpenIcon className="w-5 h-5" />} label="Memory" />
                <StateTabButton tabId="directives" icon={<ClipboardCheckIcon className="w-5 h-5" />} label="Directives" />
                <StateTabButton tabId="core" icon={<DnaIcon className="w-5 h-5" />} label="Core" />
            </div>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-2 min-h-0">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={stateTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 h-full"
                    >
                        {stateTab === 'vitals' && (
                            <>
                                {soul.processedGenesisPercent < 100 && <GenesisProgressDisplay soul={soul} />}
                                <BodyStatusDisplay soul={soul} />
                                <ResourceDisplay resources={soul.resources} />
                            </>
                        )}
                        {stateTab === 'mind' && (
                            <>
                                <ResonanceDisplay soul={soul} />
                                <BeliefsDisplay soul={soul} />
                                <SkillsDisplay soul={soul} />
                            </>
                        )}
                        {stateTab === 'memory' && (
                           <MemoryDisplay soul={soul} />
                        )}
                        {stateTab === 'directives' && (
                            <>
                                <GoalsDisplay soul={soul} />
                                <FactionAffiliationDisplay soul={soul} factions={factions} />
                            </>
                        )}
                        {stateTab === 'core' && (
                            <>
                                {soul.oracle && <OracleStateDisplay oracle={soul.oracle} />}
                            </>
                        )}
                    </MotionDiv>
                </AnimatePresence>
            </div>
        </>
    );
};

export default CognitiveStateView;