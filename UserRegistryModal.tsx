
import React, { useState, useContext, useEffect } from 'react';
import { StateContext, DispatchContext } from '../context';
import type { Action } from '../types';
import { motion } from 'framer-motion';

const UserRegistryModal: React.FC = () => {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;

  const [name, setName] = useState('');
  
  useEffect(() => {
      if (state?.architectName) {
          setName(state.architectName);
      }
  }, [state?.architectName]);

  if (!state || !dispatch) return null;

  const onClose = () => dispatch({ type: 'SET_MODAL_OPEN', payload: null });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch({ type: 'SET_ARCHITECT_NAME', payload: name.trim() });
      dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `The Architect is now known as ${name.trim()}.` });
      onClose();
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
        className="filigree-border rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-amber-500/10 relative"
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
      >
        <h2 className="text-3xl font-bold celestial-text mb-4 text-center font-display">Architect Registry</h2>
        <p className="text-gray-400 mb-6 text-center">Choose the name by which the Egregores will know you.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="architect-name" className="block text-sm font-medium text-amber-100/80 mb-1">Your Name</label>
            <input
              id="architect-name" name="architect-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Architect, The Shaper of Worlds"
              className="w-full bg-black/30 border border-amber-300/30 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button" onClick={onClose}
              className="py-2 px-5 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={!name.trim()}
              className="py-2 px-5 bg-amber-600/80 text-white rounded-lg hover:bg-amber-500/80 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-bold"
            >
              Set Name
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UserRegistryModal;
