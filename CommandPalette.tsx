import React, { useState, useMemo, MouseEvent } from 'react';
import { useMetacosmState, useMetacosmDispatch } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import type { ViewId, EgregoreId } from '@/types';
import { Action } from '@/types';

interface Command {
    id: string;
    title: string;
    action: () => void;
    category: string;
}

const CommandPaletteAction = (dispatch: React.Dispatch<Action>, viewId: ViewId, title: string, category: string): Command => ({
    id: `view-${viewId}`,
    title: `View: ${title}`,
    action: () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewId });
        dispatch({ type: 'SET_COMMAND_PALETTE_OPEN', payload: false });
    },
    category
});

export const CommandPalette = () => {
    const dispatch = useMetacosmDispatch();
    const state = useMetacosmState();
    const [query, setQuery] = useState('');

    const commands: Command[] = useMemo(() => [
        { id: 'toggle-palette', title: 'Close Command Palette', action: () => dispatch({ type: 'SET_COMMAND_PALETTE_OPEN', payload: false }), category: 'General' },
        CommandPaletteAction(dispatch, 'sanctum', 'Architectural Sanctum', 'Navigation'),
        CommandPaletteAction(dispatch, 'workbench', 'AI Workbench', 'Navigation'),
        CommandPaletteAction(dispatch, 'museum', 'Artifact Museum', 'Navigation'),
        CommandPaletteAction(dispatch, 'observatory', 'Data Observatory', 'Navigation'),
        CommandPaletteAction(dispatch, 'surveillance', 'Surveillance', 'Navigation'),
        CommandPaletteAction(dispatch, 'frf_matrix', 'FRF Matrix', 'Navigation'),
        ...state.egregores.filter(e => !e.is_core_frf).map(e => ({
            id: `select-egregore-${e.id}`,
            title: `Observe Egregore: ${e.name}`,
            action: () => {
                dispatch({ type: 'SET_PANTHEON_SELECTION', payload: e.id });
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'workbench' });
                dispatch({ type: 'SET_COMMAND_PALETTE_OPEN', payload: false });
            },
            category: 'Egregores'
        }))
    ], [dispatch, state.egregores]);
    
    const fuse = new Fuse(commands, { keys: ['title', 'category'], threshold: 0.3 });
    const results = query ? fuse.search(query).map(result => result.item) : commands;

    const handleClose = () => dispatch({ type: 'SET_COMMAND_PALETTE_OPEN', payload: false });

    return (
        <motion.div
            {...{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
            }}
            className="modal-overlay"
            onClick={handleClose}
        >
            <motion.div
                {...{
                    initial: { y: -20, opacity: 0},
                    animate: { y: 0, opacity: 1},
                    exit: { y: -20, opacity: 0},
                }}
                className="filigree-border w-full max-w-2xl shadow-2xl overflow-hidden"
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
                <input 
                    type="text" 
                    id="command-palette-search"
                    name="command-palette-search"
                    placeholder="Search commands..." 
                    className="w-full bg-transparent p-4 text-white text-lg focus:outline-none border-b border-amber-400/20" 
                    autoFocus 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <ul className="max-h-[60vh] overflow-y-auto">
                    {results.map((cmd) => (
                        <li key={cmd.id}>
                            <button 
                                className="w-full text-left p-4 hover:bg-amber-400/10 transition-colors duration-150 flex justify-between items-center"
                                onClick={cmd.action}
                            >
                                <span>{cmd.title}</span>
                                <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-md">{cmd.category}</span>
                            </button>
                        </li>
                    ))}
                     {results.length === 0 && <li className="p-4 text-center text-gray-500">No commands found.</li>}
                </ul>
            </motion.div>
        </motion.div>
    );
};