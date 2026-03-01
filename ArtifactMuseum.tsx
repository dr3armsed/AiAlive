import React, { useState } from 'react';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ancilla } from '@/types';
import { THEMES } from '@/constants';
import { PaperclipIcon, SparklesIcon, XIcon } from '@/components/icons';
import { generateHistoricalContext } from '@/services/geminiService';

const ArtifactCard = ({ artifact }: { artifact: Ancilla }) => {
    const { egregores } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const creator = egregores.find(e => e.id === artifact.origin);
    const theme = creator ? THEMES[creator.themeKey] || THEMES.default : THEMES.default;
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateHistory = async () => {
        if (isGenerating || artifact.historical_summary) return;
        setIsGenerating(true);
        try {
            const summary = await generateHistoricalContext(artifact);
            dispatch({ type: 'UPDATE_ANCILLA', payload: { id: artifact.id, data: { historical_summary: summary } } });
        } catch (error) {
            console.error("Failed to generate history:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            {...{
                layout: true,
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.3 },
            }}
            className="filigree-border p-4 flex flex-col gap-2"
        >
            <div className="flex items-start justify-between">
                <h3 className="text-lg font-display celestial-text">{artifact.name}</h3>
                <div className="p-2 rounded-full" style={{backgroundColor: `color-mix(in srgb, ${theme.baseColor} 20%, transparent)`}}>
                    <PaperclipIcon style={{ color: theme.baseColor }}/>
                </div>
            </div>
            <p className="text-sm text-gray-300 italic">"{artifact.description}"</p>
            <AnimatePresence>
            {artifact.historical_summary && (
                <motion.div
                    {...{
                        initial: { opacity: 0, height: 0 },
                        animate: { opacity: 1, height: 'auto' },
                    }}
                    className="text-sm text-amber-100/80 mt-2 border-l-2 border-amber-400/50 pl-3"
                >
                    <h4 className="font-bold text-amber-300/90 text-xs uppercase tracking-wider">Historical Context</h4>
                    <p>{artifact.historical_summary}</p>
                </motion.div>
            )}
            </AnimatePresence>
            <div className="mt-auto pt-2 flex justify-between items-center">
                <span className="text-xs px-2 py-1 rounded-full bg-black/50 border border-gray-600">
                    Tier: {artifact.ontological_tier.name}
                </span>
                {!artifact.historical_summary && (
                    <button
                        onClick={handleGenerateHistory}
                        disabled={isGenerating}
                        className="text-xs flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600/50 hover:bg-indigo-500/50 text-indigo-200 border border-indigo-400/50 disabled:opacity-50"
                    >
                        <SparklesIcon className="w-4 h-4"/>
                        {isGenerating ? 'Generating...' : 'Generate History'}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

const ArtifactMuseum = () => {
    const { ancillae } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const legendaryAncillae = ancillae.filter(a => a.is_legendary);

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div
            className="w-full h-full p-6 overflow-y-auto relative"
        >
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <h1 className="text-4xl font-display celestial-text mb-6">Legendary Artifact Museum</h1>
             <p className="text-gray-400 mb-6 max-w-3xl">This museum houses only the most significant Ancillae—items whose stories have been woven into the fabric of the Metacosm by being referenced in the lore of multiple Egregores. Their legend grows with each telling.</p>

            {legendaryAncillae.length === 0 ? (
                <div className="flex items-center justify-center h-64 filigree-border">
                    <p className="text-gray-500">The museum is empty. No Ancillae have yet achieved legendary status.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {legendaryAncillae.map(artifact => (
                            <ArtifactCard key={artifact.id} artifact={artifact} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ArtifactMuseum;