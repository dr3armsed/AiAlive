import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OptionsMenu from './OptionsMenu';
import { SettingsIcon } from './icons';
import { saveOptions } from '../services/optionsService';
import type { GameOptions } from '../types';
import CelestialForge from './start_screens/CelestialForge';

interface MainMenuProps {
    onNewGame: (params: { architectName: string; genesisSeed: string }) => void;
    onLoadGame: () => void;
    onContinue: () => void;
    isContinueAvailable: boolean;
}

const MenuButton = ({ onClick, children, disabled }: {onClick: () => void, children: React.ReactNode, disabled?: boolean}) => (
    <motion.button
        onClick={onClick}
        variants={{
            hidden: { opacity: 0, y: 20 }, 
            visible: { opacity: 1, y: 0 }
        }}
        whileHover={!disabled ? { scale: 1.05, textShadow: "0 0 8px #ffe18d" } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        disabled={disabled}
        className="px-8 py-3 filigree-border text-xl font-display tracking-wider text-metacosm-accent hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </motion.button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onLoadGame, onContinue, isContinueAvailable }) => {
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [showForge, setShowForge] = useState(false);
    
    const handleSaveOptions = useCallback((options: GameOptions) => {
        // For now, just save. If animation needs to be re-rendered, a more complex state
        // update (like changing a key on the component) would be needed here.
        console.log("Options saved.", options);
    }, []);

    const handleForge = (params: { architectName: string, genesisSeed: string }) => {
        onNewGame(params);
        setShowForge(false);
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center text-white p-4 overflow-hidden relative">
            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'backOut' }}
                    className="text-center mb-12"
                >
                    <h1 className="text-7xl font-display celestial-text mb-2">Metacosm</h1>
                    <h2 className="text-2xl holographic-text font-sans font-light" data-text="Architect Interface">Architect Interface</h2>
                </motion.div>
                
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.15, delayChildren: 0.8 } }
                    }}
                    className="flex flex-col items-center gap-6"
                >
                    <MenuButton key="continue" onClick={onContinue} disabled={!isContinueAvailable}>
                        Continue Session
                    </MenuButton>
                    <MenuButton key="new" onClick={() => setShowForge(true)}>
                        New Metacosm
                    </MenuButton>
                    <MenuButton key="load" onClick={onLoadGame}>
                        Load Game
                    </MenuButton>
                    <MenuButton key="options" onClick={() => setIsOptionsOpen(true)}>
                        Options
                    </MenuButton>
                </motion.div>
            </div>
             <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                onClick={() => setIsOptionsOpen(true)}
                className="absolute bottom-6 right-6 p-3 rounded-full filigree-border text-gray-400 hover:text-metacosm-accent"
                aria-label="Options"
             >
                <SettingsIcon />
             </motion.button>
            <AnimatePresence>
                {isOptionsOpen && <OptionsMenu isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} onSave={handleSaveOptions} />}
                {showForge && <CelestialForge onForge={handleForge} onBack={() => setShowForge(false)} />}
            </AnimatePresence>
        </div>
    );
};
