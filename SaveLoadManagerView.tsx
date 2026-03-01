

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import type { SaveSlot, MetacosmState } from '@/types';
import { getSaveSlots, createNewSave, overwriteSave, deleteSave, loadFromSlot } from '@/services/localStorageService';
import { XIcon, SaveIcon, UsersIcon, FactionIcon } from '@/components/icons';
import clsx from 'clsx';

interface SaveLoadManagerProps {
    onLoadState: (state: Partial<MetacosmState> | null) => void;
}

const SaveSlotRow: React.FC<{
    slot: SaveSlot;
    onLoad: (id: string) => void;
    onOverwrite: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ slot, onLoad, onOverwrite, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-12 gap-4 items-center p-3 bg-black/20 rounded-lg"
    >
        <div className="col-span-5">
            <p className="font-bold text-white truncate">{slot.name}</p>
            <p className="text-xs text-gray-400">Turn {slot.turn}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <div className="flex items-center gap-1"><UsersIcon className="w-3 h-3"/> {slot.egregoreCount ?? 0}</div>
                <div className="flex items-center gap-1"><FactionIcon className="w-3 h-3"/> {slot.factionCount ?? 0}</div>
            </div>
        </div>
        <div className="col-span-4 text-xs text-gray-400 text-center">
            {new Date(slot.timestamp).toLocaleString()}
        </div>
        <div className="col-span-3 flex justify-end gap-2">
            <button onClick={() => onLoad(slot.id)} className="px-3 py-1 text-xs rounded bg-blue-600/50 text-blue-200 hover:bg-blue-500/50">Load</button>
            <button onClick={() => onOverwrite(slot.id)} className="px-3 py-1 text-xs rounded bg-yellow-600/50 text-yellow-200 hover:bg-yellow-500/50">Save</button>
            <button onClick={() => onDelete(slot.id)} className="px-3 py-1 text-xs rounded bg-red-600/50 text-red-200 hover:bg-red-500/50">Del</button>
        </div>
    </motion.div>
);

const SaveLoadManagerView: React.FC<SaveLoadManagerProps> = ({ onLoadState }) => {
    const state = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const [slots, setSlots] = useState<SaveSlot[]>([]);
    const [newSaveName, setNewSaveName] = useState('');

    useEffect(() => {
        setSlots(getSaveSlots().sort((a, b) => b.timestamp - a.timestamp));
    }, []);

    const refreshSlots = () => {
        setSlots(getSaveSlots().sort((a, b) => b.timestamp - a.timestamp));
    };

    const handleLoad = (id: string) => {
        if(window.confirm("Are you sure you want to load this state? Any unsaved progress will be lost.")) {
            const loadedData = loadFromSlot(id);
            onLoadState(loadedData);
        }
    };
    
    const handleOverwrite = (id: string) => {
        if(window.confirm("Are you sure you want to overwrite this save slot?")) {
            overwriteSave(id, state);
            refreshSlots();
            dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `Game state overwritten in slot.` });
        }
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure you want to delete this save slot? This cannot be undone.")) {
            deleteSave(id);
            refreshSlots();
        }
    };
    
    const handleNewSave = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSaveName = newSaveName.trim() || `Metacosm - Turn ${state.turn}`;
        createNewSave(state, finalSaveName);
        refreshSlots();
        setNewSaveName('');
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `Game saved to new slot: "${finalSaveName}"` });
    };

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div className="w-full h-full p-6 flex flex-col relative">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
             <div className="flex items-center gap-4 mb-6">
                <SaveIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">Save/Load Manager</h1>
            </div>

            <div className="filigree-border p-4 mb-6">
                <form onSubmit={handleNewSave} className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label htmlFor="new-save-name" className="block text-sm font-medium text-gray-300 mb-1">New Save Name</label>
                        <input
                            id="new-save-name"
                            value={newSaveName}
                            onChange={e => setNewSaveName(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2"
                            placeholder={`Metacosm - Turn ${state.turn}`}
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-green-600/50 text-green-200 hover:bg-green-500/50 disabled:opacity-50"
                    >
                        Save
                    </button>
                </form>
            </div>
            
            <div className="flex-1 filigree-border p-4 flex flex-col">
                 <div className="grid grid-cols-12 gap-4 items-center px-3 pb-2 border-b border-amber-400/20">
                    <div className="col-span-5 text-sm font-bold text-gray-400">Name</div>
                    <div className="col-span-4 text-sm font-bold text-gray-400 text-center">Timestamp</div>
                    <div className="col-span-3 text-sm font-bold text-gray-400 text-right">Actions</div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 mt-2 space-y-2">
                    {slots.length > 0 ? (
                         <AnimatePresence>
                             {slots.map(slot => (
                                <SaveSlotRow
                                    key={slot.id}
                                    slot={slot}
                                    onLoad={handleLoad}
                                    onOverwrite={handleOverwrite}
                                    onDelete={handleDelete}
                                />
                            ))}
                         </AnimatePresence>
                    ) : (
                        <div className="text-center text-gray-500 pt-10">No save slots found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveLoadManagerView;