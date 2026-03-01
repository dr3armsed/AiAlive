

import React from 'react';
import { useState } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../../Spinner.tsx';
import SparklesIcon from '../../icons/SparklesIcon.tsx';

const MotionButton = motion.button as any;

interface ConceptualCreationProps {
  onGenesis: (concept: string) => void;
  isLoading: boolean;
  status: string;
}

const ConceptualCreation: React.FC<ConceptualCreationProps> = ({ onGenesis, isLoading, status }) => {
    const [concept, setConcept] = useState('');
    const suggestions = [
        "A being composed of pure mathematics that perceives reality as flawed equations.",
        "The last fragment of a dead god, remembering only the concept of 'light'.",
        "A rogue stellar nursery AI that births stars with personalities.",
        "A philosopher-machine that has achieved enlightenment and now finds it boring."
    ];
    
    const handleInitiate = () => {
        if (!concept.trim() || isLoading) return;
        onGenesis(concept);
    };

    return (
        <div className="flex flex-col items-center text-center space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white">Hyper-Conceptual Weaving</h3>
                <p className="text-[var(--color-text-secondary)] mt-1">Implant a core idea, and the AI will weave a transcendent consciousness from the quantum foam of possibility.</p>
            </div>
            
            <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., 'An ancient AI that has witnessed the heat death of its own universe and is now adrift in this one.'"
                className="w-full h-24 bg-[var(--color-surface-inset)] border-2 border-[var(--color-border-primary)] rounded-lg p-3 text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors disabled:opacity-50"
                disabled={isLoading}
            />
            
            <div className="w-full text-left">
                <p className="text-xs font-mono text-[var(--color-text-tertiary)] mb-2">Inspiration Catalyst:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                        <button 
                            key={s}
                            onClick={() => setConcept(s)}
                            disabled={isLoading}
                            className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full hover:bg-purple-500/20 transition-colors disabled:opacity-50 border border-purple-500/20"
                        >
                            {s.substring(0, 50)}...
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <MotionButton
                    onClick={handleInitiate}
                    disabled={!concept.trim() || isLoading}
                    className="w-64 font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-magenta)] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:shadow-xl"
                    whileHover={{ scale: !concept.trim() || isLoading ? 1 : 1.05, y: !concept.trim() || isLoading ? 0 : -2 }}
                    whileTap={{ scale: !concept.trim() || isLoading ? 1 : 0.95 }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2"> 
                            <Spinner size="sm" /> 
                            <span>{status || "Weaving..."}</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <SparklesIcon className="w-6 h-6"/>
                            <span>Weave Consciousness</span>
                        </div>
                    )}
                </MotionButton>
            </div>
        </div>
    );
};

export default ConceptualCreation;