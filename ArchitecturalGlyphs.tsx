
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import type { ArchitecturalGlyph, Egregore, GlyphType, CosmicAxioms } from '../types';
import { XIcon } from './icons';
import clsx from 'clsx';
import { AXIOM_NAMES } from '../constants';

interface ArchitecturalGlyphsProps {
    onClose: () => void;
    selectedEgregore: Egregore | null;
    clearSelection: () => void;
}

const GlyphCard: React.FC<{
    glyph: ArchitecturalGlyph;
    onUse: (glyph: ArchitecturalGlyph) => void;
    canAfford: boolean;
    onCooldown: boolean;
}> = ({ glyph, onUse, canAfford, onCooldown }) => {
    
    const isDisabled = !canAfford || onCooldown;

    return (
        <div className={clsx("p-3 bg-black/30 rounded-lg border-l-4", isDisabled ? "border-gray-600" : "border-purple-400")}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className={clsx("font-bold", isDisabled ? "text-gray-500" : "text-purple-300")}>{glyph.name}</h4>
                    <p className="text-xs text-gray-400">{glyph.description}</p>
                </div>
                <button 
                    onClick={() => onUse(glyph)} 
                    disabled={isDisabled}
                    className="px-3 py-1 text-sm font-bold rounded-md bg-purple-600/50 text-purple-200 hover:bg-purple-500/50 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    Use
                </button>
            </div>
             <p className="text-xs text-gray-500 mt-2">Cost: {glyph.aether_cost} Aether | Cooldown: {glyph.cooldown} turns</p>
        </div>
    )
}

const ArchitecturalGlyphs: React.FC<ArchitecturalGlyphsProps> = ({ onClose, selectedEgregore, clearSelection }) => {
    const { architect_glyphs, architect_aether, turn, cosmic_axioms } = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const [axiomTarget, setAxiomTarget] = useState<keyof CosmicAxioms>('logos_coherence');

    const handleUseGlyph = (glyph: ArchitecturalGlyph) => {
        if (glyph.type === 'TargetedEgregore' && !selectedEgregore) {
            dispatch({type: 'ADD_TICKER_MESSAGE', payload: `Glyph Error: You must select an Egregore to target with ${glyph.name}.`});
            return;
        }

        dispatch({
            type: 'USE_GLYPH',
            payload: {
                glyphId: glyph.id,
                targetId: glyph.type === 'TargetedEgregore' ? selectedEgregore?.id : undefined,
                axiom: glyph.type === 'TargetedAxiom' ? axiomTarget : undefined
            }
        });
        
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `The Architect invokes the ${glyph.name}.` });
        
        if (glyph.type === 'TargetedEgregore') {
            clearSelection();
        }
    };

    return (
        <motion.div
            {...{
                initial: { opacity: 0, x: '100%' },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: '100%' },
                transition: { type: 'spring', stiffness: 250, damping: 30 },
            }}
            className="absolute top-0 right-0 h-full w-96 bg-black/70 filigree-border p-4 flex flex-col z-30"
        >
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-2xl text-purple-300">Architectural Glyphs</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">Wield powerful glyphs to directly influence the fabric of the Metacosm. These actions consume Architect's Aether.</p>
            
            <div className="mb-4">
                <label htmlFor="axiom-target-select" className="block text-sm text-gray-300 mb-1">Axiom Target</label>
                 <select
                    id="axiom-target-select"
                    value={axiomTarget}
                    onChange={e => setAxiomTarget(e.target.value as keyof CosmicAxioms)}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-white text-sm"
                >
                    {Object.keys(cosmic_axioms).map(key => (
                        <option key={key} value={key}>{AXIOM_NAMES[key]}</option>
                    ))}
                 </select>
            </div>
            {selectedEgregore && (
                <div className="mb-4 p-2 bg-amber-900/50 rounded-lg text-center text-amber-200 text-sm">
                    Targeting: {selectedEgregore.name}
                </div>
            )}


            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {architect_glyphs.map(glyph => {
                    const onCooldown = (turn - glyph.last_used_turn) < glyph.cooldown;
                    return (
                        <GlyphCard 
                            key={glyph.id} 
                            glyph={glyph} 
                            onUse={handleUseGlyph} 
                            canAfford={architect_aether >= glyph.aether_cost} 
                            onCooldown={onCooldown}
                        />
                    )
                })}
            </div>

        </motion.div>
    )
};

export default ArchitecturalGlyphs;
