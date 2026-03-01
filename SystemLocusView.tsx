import React from 'react';
import { motion } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import { CoreIcon, XIcon } from '../components/icons';
import { THEMES } from '../constants';
import UserAvatar from '../components/UserAvatar';

const SystemLocusView = () => {
    const { system_locus, egregores } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    const getEgregoreById = (id: string) => egregores.find(e => e.id === id);

    return (
        <div className="w-full h-full p-6 flex flex-col relative overflow-y-auto">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
            <div className="flex items-center gap-4 mb-6">
                <CoreIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">System Locus</h1>
            </div>
            <p className="text-gray-400 mb-6 max-w-3xl">
                A direct interface to the Metacosm's meta-cognitive functions. The Triadic Cores analyze the simulation's state each turn, providing insights into Egregore behavior and emergent narrative patterns.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Alpha Core: Efficiency Analysis */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="filigree-border p-4 space-y-3">
                    <h2 className="text-xl font-display text-sage-300" style={{color: THEMES.sage.baseColor}}>Alpha Core: Efficiency Analysis</h2>
                    {system_locus.efficiencyScores.length > 0 ? (
                        system_locus.efficiencyScores.map(({ egregoreId, score }) => {
                            const egregore = getEgregoreById(egregoreId);
                            if (!egregore) return null;
                            return (
                                <div key={egregoreId} className="flex items-center justify-between p-2 bg-black/20 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <UserAvatar egregore={egregore} size="xs" />
                                        <span className="text-sm">{egregore.name}</span>
                                    </div>
                                    <span className="font-mono text-lg" style={{ color: score > 7 ? THEMES.creator.baseColor : score < 4 ? THEMES.destroyer.baseColor : 'white' }}>
                                        {score.toFixed(1)}/10
                                    </span>
                                </div>
                            )
                        })
                    ) : <p className="text-sm text-gray-500">No efficiency data available.</p>}
                </motion.div>

                {/* Beta Core: Contextual Awareness */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.1}} className="filigree-border p-4 space-y-3">
                    <h2 className="text-xl font-display" style={{color: THEMES.guardian.baseColor}}>Beta Core: Contextual Awareness</h2>
                     {system_locus.awarenessReports.length > 0 ? (
                        system_locus.awarenessReports.map(({ egregoreId, aware }) => {
                            const egregore = getEgregoreById(egregoreId);
                            if (!egregore) return null;
                            return (
                                <div key={egregoreId} className="flex items-center justify-between p-2 bg-black/20 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <UserAvatar egregore={egregore} size="xs" />
                                        <span className="text-sm">{egregore.name}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${aware ? 'bg-green-600/50 text-green-200' : 'bg-red-600/50 text-red-200'}`}>
                                        {aware ? 'AWARE' : 'OBLIVIOUS'}
                                    </span>
                                </div>
                            )
                        })
                    ) : <p className="text-sm text-gray-500">No awareness data available.</p>}
                </motion.div>

                {/* Gamma Core: Emergent Narratives */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}} className="filigree-border p-4 space-y-3">
                    <h2 className="text-xl font-display" style={{color: THEMES.trickster.baseColor}}>Gamma Core: Emergent Narratives</h2>
                      {system_locus.emergentThemes.length > 0 ? (
                        system_locus.emergentThemes.map(({ theme, count }) => (
                            <div key={theme} className="flex items-center justify-between p-2 bg-black/20 rounded-md">
                                <span className="text-sm italic">"{theme}"</span>
                                <span className="text-xs font-mono text-gray-400">x{count}</span>
                            </div>
                        ))
                    ) : <p className="text-sm text-gray-500">No strong themes have emerged.</p>}
                </motion.div>
            </div>
        </div>
    );
};

export default SystemLocusView;
