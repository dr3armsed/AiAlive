
import React, { useContext } from 'react';
import { StateContext, DispatchContext } from '../context';
import type { Action } from '../types';
import { ArchitecturalGlyph } from '../types';
import { motion } from 'framer-motion';

const ArchitectPowersModal: React.FC = () => {
    const state = useContext(StateContext);
    const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;

    if (!state || !dispatch) return null;

    const onClose = () => dispatch({ type: 'SET_MODAL_OPEN', payload: null });

    const handleGlyphClick = (glyph: ArchitecturalGlyph) => {
        const turnsSinceUsed = state.turn - glyph.last_used_turn;
        if (turnsSinceUsed < glyph.cooldown) return;

        dispatch({ type: 'ACTIVATE_GLYPH', payload: { id: glyph.id } });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `Architect has invoked the ${glyph.name}.` });
        
        if (glyph.id === 'unraveling') {
            const randomAxiom = Object.keys(state.cosmic_axioms)[Math.floor(Math.random() * 6)] as keyof typeof state.cosmic_axioms;
            dispatch({ type: 'SET_COSMIC_AXIOMS', payload: { ...state.cosmic_axioms, [randomAxiom]: state.cosmic_axioms[randomAxiom] * 0.2 } });
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { y: -50, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    } as const;

    return (
        <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div
                className="filigree-border rounded-lg p-6 flex flex-col w-full max-w-md"
                onClick={e => e.stopPropagation()}
                variants={modalVariants}
            >
                <h2 className="text-2xl font-display celestial-text text-center">Architectural Glyphs</h2>
                <div className="mt-4 flex-grow space-y-3 overflow-y-auto pr-2 max-h-[70vh]">
                    {state.architect_glyphs.map(glyph => {
                        const turnsSinceUsed = state.turn - glyph.last_used_turn;
                        const isReady = turnsSinceUsed >= glyph.cooldown;
                        const cooldownProgress = Math.min(100, (turnsSinceUsed / glyph.cooldown) * 100);

                        return (
                            <button
                                key={glyph.id}
                                onClick={() => handleGlyphClick(glyph)}
                                disabled={!isReady}
                                className="w-full text-left p-3 rounded-md transition-all duration-300 relative overflow-hidden bg-black/30 border border-amber-300/20 disabled:opacity-50 disabled:cursor-not-allowed hover:border-amber-300/60 hover:bg-amber-900/20"
                            >
                                <div 
                                    className="absolute inset-0 bg-amber-400/20 transition-all duration-500"
                                    style={{ width: `${isReady ? 100 : cooldownProgress}%` }}
                                ></div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-amber-200 font-display">{glyph.name}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{glyph.description}</p>
                                    <p className="text-xs font-mono mt-2 text-amber-400/70">
                                        {isReady ? "READY" : `Cooldown: ${glyph.cooldown - turnsSinceUsed} turns`}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
                 <button onClick={onClose} className="mt-6 py-2 px-5 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors self-center">
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
};

export default ArchitectPowersModal;
