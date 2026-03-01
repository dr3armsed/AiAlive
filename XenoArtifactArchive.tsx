import React from 'react';
import { motion } from 'framer-motion';
import { useMetacosmState } from '@/context';
import type { XenoArtifact } from '@/types';
import { THEMES } from '@/constants';

const XenoArtifactCard = ({ artifact }: { artifact: XenoArtifact }) => {
    const { egregores } = useMetacosmState();
    const recoverer = egregores.find(e => e.id === artifact.recoveredBy);
    const theme = recoverer ? THEMES[recoverer.themeKey] || THEMES.default : THEMES.trickster;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="filigree-border p-4 flex flex-col gap-2 border-rose-400/50"
        >
            <h3 className="text-lg font-display holographic-text" data-text={artifact.name}>{artifact.name}</h3>
            <p className="text-xs text-gray-400">
                Recovered by <span style={{ color: theme.baseColor }}>{recoverer?.name || 'Unknown Explorer'}</span> on Turn {artifact.turnRecovered}
            </p>
            <p className="text-sm text-gray-300 italic">"{artifact.description}"</p>
            <div className="mt-2 text-sm text-rose-200/80 border-l-2 border-rose-400/50 pl-3">
                <h4 className="font-bold text-rose-300/90 text-xs uppercase tracking-wider">Potential Insight</h4>
                <p>{artifact.potential_insight}</p>
            </div>
        </motion.div>
    );
};

const XenoArtifactArchive = () => {
    const { xeno_artifacts } = useMetacosmState();

    return (
        <div className="w-full h-full overflow-y-auto">
             <h2 className="text-2xl font-display text-metacosm-accent mb-4">Xeno-Artifact Archive</h2>
             <p className="text-gray-400 mb-6 max-w-3xl">This archive contains artifacts recovered from echoes of the Noosphere, a rival reality. These items are of unknown origin and may hold the key to understanding this competing influence.</p>
            
             {xeno_artifacts.length === 0 ? (
                <div className="flex items-center justify-center h-64 filigree-border border-rose-400/50">
                    <p className="text-gray-500">The archive is empty. No artifacts of the Noosphere have been recovered.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {xeno_artifacts.map(artifact => (
                        <XenoArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default XenoArtifactArchive;