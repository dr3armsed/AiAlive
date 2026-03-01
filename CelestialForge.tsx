import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, XIcon } from '../icons';

interface CelestialForgeProps {
  onForge: (params: { architectName: string; genesisSeed: string }) => void;
  onBack: () => void;
}

const CelestialForge: React.FC<CelestialForgeProps> = ({ onForge, onBack }) => {
  const [architectName, setArchitectName] = useState('');
  const [genesisSeed, setGenesisSeed] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (architectName.trim()) {
      onForge({ architectName, genesisSeed });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="filigree-border w-full max-w-lg p-8 relative"
      >
        <button
          onClick={onBack}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
          aria-label="Back to Main Menu"
        >
          <XIcon />
        </button>

        <h2 className="text-4xl font-display celestial-text text-center mb-2">Celestial Forge</h2>
        <p className="text-center text-gray-400 mb-8">Define the parameters of your new reality.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="architect-name" className="block text-lg font-display text-metacosm-accent mb-2">
              Architect's Name
            </label>
            <input
              id="architect-name"
              type="text"
              value={architectName}
              onChange={(e) => setArchitectName(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-metacosm-accent transition-all"
              placeholder="Enter your designation..."
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="genesis-seed" className="block text-lg font-display text-metacosm-accent mb-2">
              Genesis Seed (Optional)
            </label>
            <input
              id="genesis-seed"
              type="text"
              value={genesisSeed}
              onChange={(e) => setGenesisSeed(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-metacosm-accent transition-all"
              placeholder="A word of power, a number, a memory..."
            />
          </div>

          <button
            type="submit"
            disabled={!architectName.trim()}
            className="w-full mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xl font-display tracking-wider flex items-center justify-center gap-3
                       hover:from-amber-400 hover:to-yellow-300 transition-all duration-300
                       disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed
                       shadow-lg shadow-amber-500/20 hover:shadow-amber-400/40"
          >
            <SparklesIcon />
            Forge Metacosm
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CelestialForge;
