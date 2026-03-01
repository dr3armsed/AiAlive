
import React from 'react';
import { motion } from 'framer-motion';
import { THEMES } from '../constants';
import { CreateIcon, UploadIcon, ResetIcon } from './icons';

interface StartScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onContinue: () => void;
  isContinueAvailable: boolean;
}

const MenuButton: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactElement<{ className?: string }>;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}> = ({ title, subtitle, icon, onClick, color, disabled }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center p-6 rounded-2xl filigree-border text-center overflow-hidden w-full h-44 disabled:opacity-50 disabled:cursor-not-allowed group"
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ '--glow-color': color } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--glow-color)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="mb-2 flex justify-center" style={{ color }}>
           {React.cloneElement(icon, { className: "w-8 h-8" })}
        </div>
        <h2 className="text-xl font-display celestial-text">{title}</h2>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
      {disabled && <div className="absolute inset-0 bg-black/70"></div>}
    </motion.button>
  );
};

export const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onLoadGame, onContinue, isContinueAvailable }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-display celestial-text tracking-widest">Metacosm Architect</h1>
        <p className="text-lg text-blue-200/80 mt-2">The Void awaits your command.</p>
      </motion.div>

      <motion.div
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <MenuButton
          title="Continue Session"
          subtitle="Return to your last known state."
          icon={<ResetIcon />}
          onClick={onContinue}
          color={THEMES.guardian.baseColor}
          disabled={!isContinueAvailable}
        />
        <MenuButton
          title="New Genesis"
          subtitle="Forge a new reality from the void."
          icon={<CreateIcon />}
          onClick={onNewGame}
          color={THEMES.creator.baseColor}
        />
        <MenuButton
          title="Load Chronicle"
          subtitle="Restore a history from a saved file."
          icon={<UploadIcon />}
          onClick={onLoadGame}
          color={THEMES.sage.baseColor}
        />
      </motion.div>
    </div>
  );
};

export default StartScreen;