

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import { ParadoxIcon } from '../components/icons';
import type { Paradox } from '@/types';
import clsx from 'clsx';
import UserAvatar from '../components/UserAvatar';

const ParadoxCard = ({ paradox }: { paradox: Paradox }) => {
    const { egregores } = useMetacosmState();
    const resolvedByEntity = egregores.find(e => e.id === paradox.resolved_by);

    const isResolved = paradox.status === 'resolved';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx("p-4 bg-black/20 rounded-lg border-l-4", isResolved ? "border-green-500/50" : "border-red-500/50")}
        >
            <div className="flex justify-between items-start">
                <p className={clsx("font-bold", isResolved ? "text-green-300" : "text-red-300")}>
                    {paradox.description}
                </p>
                <span className={clsx("text-xs font-mono px-2 py-1 rounded-full flex-shrink-0 ml-4", isResolved ? "bg-green-900/50 text-green-200" : "bg-red-900/50 text-red-200")}>
                    {paradox.status.toUpperCase()}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Detected on Turn {paradox.turn_detected}</p>

            {isResolved && (
                <div className="mt-3 pt-3 border-t border-white/10 text-sm">
                    <p className="text-gray-300">
                        <span className="font-bold text-gray-100">Resolution:</span> {paradox.resolution}
                    </p>
                     <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>Resolved by:</span>
                        {paradox.resolved_by === 'System' ? (
                            <span className="font-bold">System</span>
                        ) : (
                            resolvedByEntity && (
                                <>
                                    <UserAvatar egregore={resolvedByEntity} size="xs" />
                                    <span className="font-bold">{resolvedByEntity.name}</span>
                                </>
                            )
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};


const ParadoxRegistry = () => {
    const { paradoxes } = useMetacosmState();
    const [showResolved, setShowResolved] = useState(false);

    const activeParadoxes = paradoxes.filter(p => p.status === 'active');
    const resolvedParadoxes = paradoxes.filter(p => p.status === 'resolved');

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <ParadoxIcon className="w-8 h-8 text-red-400" />
                    <h2 className="text-2xl font-display text-metacosm-accent">Paradox Registry</h2>
                </div>
                 <button 
                    onClick={() => setShowResolved(s => !s)}
                    className="text-sm px-4 py-2 rounded-lg bg-gray-600/50 hover:bg-gray-500/50 text-gray-200"
                >
                    {showResolved ? "Hide Resolved" : `Show ${resolvedParadoxes.length} Resolved`}
                </button>
            </div>
             <p className="text-gray-400 mb-6 max-w-3xl">
                A log of all detected causality failures within the Metacosm's reality matrix. Active paradoxes represent ongoing instabilities that may be resolved by Egregores or system processes.
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <h3 className="text-lg font-bold text-red-300">Active Paradoxes ({activeParadoxes.length})</h3>
                {activeParadoxes.length > 0 ? (
                    activeParadoxes.map(p => <ParadoxCard key={p.id} paradox={p} />)
                ) : (
                    <p className="text-sm text-gray-500 pl-4">No active paradoxes detected. Causality is stable.</p>
                )}
                
                <AnimatePresence>
                {showResolved && (
                    <motion.div
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="space-y-4 mt-6"
                    >
                         <h3 className="text-lg font-bold text-green-300">Resolved Paradoxes ({resolvedParadoxes.length})</h3>
                        {resolvedParadoxes.length > 0 ? (
                            resolvedParadoxes.map(p => <ParadoxCard key={p.id} paradox={p} />)
                        ) : (
                            <p className="text-sm text-gray-500 pl-4">No paradoxes have been resolved yet.</p>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default ParadoxRegistry;
