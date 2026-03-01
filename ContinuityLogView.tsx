



import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import type { AnyContinuityEntry, SystemTaskEntry, RollbackEntry, SpectreType, SystemTaskStatus } from '@/types';
import { XIcon, ProjectsIcon } from '../components/icons';
import clsx from 'clsx';
import { THEMES } from '../constants';

const SpectreChip = ({ spectreType }: { spectreType: SpectreType }) => {
    const themeKey = {
        'File': 'sage',
        'Operation': 'trickster',
        'Function': 'sage',
        'Animation': 'artist',
        'System': 'guardian',
        'Core': 'warrior',
        'Entity': 'creator',
        'Data Spectre': 'explorer',
        'Metacosm': 'sovereign'
    }[spectreType] || 'default';

    const theme = THEMES[themeKey];
    
    return (
        <div className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1" style={{ backgroundColor: `color-mix(in srgb, ${theme.baseColor} 20%, transparent)`, border: `1px solid ${theme.baseColor}80` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.baseColor }}></span>
            <span style={{ color: theme.baseColor }}>{spectreType}</span>
        </div>
    )
};

const SystemTaskCard = ({ entry }: { entry: SystemTaskEntry }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const statusInfo: Record<SystemTaskStatus, { color: string, text: string }> = {
        Open: { color: 'border-blue-400/50', text: 'text-blue-300' },
        InProgress: { color: 'border-yellow-400/50', text: 'text-yellow-300 animate-pulse' },
        PendingApproval: { color: 'border-purple-400/50', text: 'text-purple-300' },
        Implementing: { color: 'border-orange-400/50', text: 'text-orange-300 animate-pulse' },
        Resolved: { color: 'border-green-400/50', text: 'text-green-300' },
        Rejected: { color: 'border-red-400/50', text: 'text-red-300' }
    };

    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={clsx("p-4 bg-black/20 rounded-lg border-l-4", statusInfo[entry.status].color)}>
            <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold">{entry.description}</p>
                        <p className="text-xs text-gray-400">Task #{entry.id.slice(0, 8)} • Detected by {entry.detectedBy} Scanner on Turn {entry.turnDetected}</p>
                    </div>
                    <span className={clsx("text-xs font-mono px-2 py-1 rounded-full flex-shrink-0 ml-4", statusInfo[entry.status].color, statusInfo[entry.status].color.replace('border', 'bg').replace('/50', '/20'))}>
                        {entry.status}
                    </span>
                </div>
            </div>
            <AnimatePresence>
            {isExpanded && (
                <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                    <div className="border-t border-white/10 pt-3 space-y-3 text-sm">
                        <div>
                            <h4 className="font-bold text-gray-300">Assigned Spectres:</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {entry.assignedSpectres.map(s => <SpectreChip key={s} spectreType={s} />)}
                            </div>
                        </div>

                         {entry.code_snippet && (
                             <div>
                                <h4 className="font-bold text-gray-300">Triggering Code:</h4>
                                <pre className="p-2 mt-1 rounded-md bg-black/40 text-rose-300 font-mono text-xs overflow-x-auto">
                                    <code className="text-gray-500 block">Location: {entry.location}</code>
                                    {entry.code_snippet}
                                </pre>
                             </div>
                         )}

                        <div>
                            <h4 className="font-bold text-gray-300">Progress Log:</h4>
                             <ul className="mt-1 space-y-1 text-xs font-mono text-gray-400">
                                {entry.progressLog.map((log, i) => (
                                    <li key={i}><span className="text-gray-500">[T{log.turn}]</span> {log.entry}</li>
                                ))}
                            </ul>
                        </div>
                         {entry.resolution && (
                            <div>
                                <h4 className="font-bold text-green-300">Resolution:</h4>
                                <p className="text-sm text-gray-300">{entry.resolution}</p>
                            </div>
                         )}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </motion.div>
    );
};

const RollbackCard = ({ entry }: { entry: RollbackEntry }) => {
    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-900/20 rounded-lg border-l-4 border-red-500/50">
            <h3 className="font-bold text-red-300">Temporal Rollback Event</h3>
            <p className="text-xs text-gray-400">System rolled back from Turn {entry.turnRolledBackFrom} to {entry.turnRolledBackTo}</p>
            <p className="text-sm text-gray-300 mt-2">Reason: <span className="italic">{entry.reason}</span></p>
            <div className="mt-2 pt-2 border-t border-white/10 text-xs">
                <h4 className="font-bold text-gray-300 mb-1">Lost Data Summary:</h4>
                <ul className="list-disc list-inside text-gray-400">
                    {Object.entries(entry.lostDataSummary).map(([key, value]) => {
                        if (Array.isArray(value) && value.length > 0) {
                            return <li key={key}><span className="capitalize">{key}:</span> {value.join(', ')}</li>
                        }
                        return null;
                    })}
                </ul>
            </div>
        </motion.div>
    )
};


const ContinuityLogView = () => {
    const { continuity_log } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    const getSortableTurn = (entry: AnyContinuityEntry): number => {
        if (entry.type === 'SystemTask') {
            return entry.turnDetected;
        }
        return entry.turnRolledBackFrom;
    };

    const sortedLog = [...continuity_log].sort((a,b) => getSortableTurn(b) - getSortableTurn(a));

    return (
        <div className="w-full h-full p-6 flex flex-col relative">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
            <div className="flex items-center gap-4 mb-6">
                <ProjectsIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">Continuity Log</h1>
            </div>
            <p className="text-gray-400 mb-4 max-w-3xl">This persistent log records all major system events, including automated watchdog tasks and temporal rollbacks. It survives all system resets, ensuring a complete record of the Metacosm's history.</p>
            
            <div className="flex-1 filigree-border p-4 overflow-y-auto space-y-4">
                {sortedLog.length > 0 ? (
                    sortedLog.map(entry => {
                        if (entry.type === 'SystemTask') return <SystemTaskCard key={entry.id} entry={entry} />;
                        if (entry.type === 'Rollback') return <RollbackCard key={entry.id} entry={entry} />;
                        return null;
                    })
                ) : (
                    <div className="text-center text-gray-500 p-8">The log is clear. All systems nominal.</div>
                )}
            </div>
        </div>
    );
};

export default ContinuityLogView;
