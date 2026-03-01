
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import { XIcon, DataStructureIcon } from '../components/icons';
import TreeView, { TreeNode } from '../components/TreeView';
import FileContentView from '../components/FileContentView';

const SpectreBrowserView = () => {
    const state = useMetacosmState();
    const dispatch = useMetacosmDispatch();
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };
    
    const fileTree = useMemo((): TreeNode => {
        const egregoresNode: TreeNode = {
            id: 'egregores',
            name: 'Egregores',
            children: state.egregores.map(e => ({
                id: `egregore-${e.id}`,
                name: `${e.name}_${e.id.slice(0, 5)}`,
                children: [
                    {
                        id: `egregore-${e.id}-core`, name: 'Core', children: [
                            { id: `egregore-${e.id}-injector`, name: 'axiom_injector.json', content: { type: 'json', data: e.personality_profile } },
                            { id: `egregore-${e.id}-signature`, name: 'signature.profile', content: { type: 'json', data: { alignment: e.alignment, archetype: e.archetypeId, movement_mode: e.movement_mode } } },
                        ]
                    },
                    {
                        id: `egregore-${e.id}-quintessence`, name: 'Quintessence', children: [
                            { id: `egregore-${e.id}-well`, name: 'current_well.dat', content: { type: 'json', data: { quintessence: e.quintessence, influence: e.influence, coherence: e.coherence, potency: e.potency } } },
                        ]
                    },
                    {
                        id: `egregore-${e.id}-state`, name: 'State', children: [
                            { id: `egregore-${e.id}-active`, name: 'active_parameters.cfg', content: { type: 'json', data: { phase: e.phase, is_frozen: e.is_frozen, is_metacosm_core: e.is_metacosm_core, locus: e.locus, vector: e.vector, path_length: e.path.length } } },
                        ]
                    }
                ]
            }))
        };

        const frfNode: TreeNode = {
            id: 'frf', name: 'FRF', children: [
                 { id: 'frf-logs', name: 'FractureLogs', content: { type: 'json', data: state.egregores.filter(e => e.phase === 'Fractured').map(e => ({id: e.id, name: e.name, turn: state.turn})) } }
            ]
        };

        const scannersNode: TreeNode = {
            id: 'scanners', name: 'Scanners', children: [
                { id: 'scanners-stability', name: 'StabilityScanner', content: { type: 'text', data: 'Reports on Egregore fracture rates.' } },
                { id: 'scanners-performance', name: 'PerformanceScanner', content: { type: 'text', data: 'Monitors total entity count.' } },
                { id: 'scanners-upgrade', name: 'UpgradeScanner', content: { type: 'text', data: 'Identifies potential for system evolution.' } },
                { id: 'scanners-modularization', name: 'ModularizationScanner', content: { type: 'text', data: 'Checks for conceptual bloat.' } },
            ]
        };
        
        const systemNode: TreeNode = {
            id: 'system', name: 'System', children: [
                {id: 'system-architect', name: 'Architect', content: { type: 'json', data: { name: state.architectName, aether: state.architect_aether, attention: state.architect_attention_score } } },
                {id: 'system-handshake', name: 'Handshake_Protocols', content: {type: 'text', data: 'Protocols for entity registration and validation.'}},
                {id: 'system-rollback', name: 'Rollback_Cache', content: {type: 'json', data: { snapshots: state.stateHistory.length, last_snapshot_turn: state.stateHistory.length > 0 ? state.stateHistory[state.stateHistory.length - 1].turn : 'N/A' }}},
            ]
        };

        return {
            id: 'root',
            name: '/Metacosm',
            children: [egregoresNode, frfNode, scannersNode, systemNode]
        };
    }, [state]);

    return (
        <div className="w-full h-full p-6 flex flex-col relative">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
            <div className="flex items-center gap-4 mb-6">
                <DataStructureIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">Spectre Browser</h1>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                <div className="md:col-span-1 filigree-border p-4 overflow-y-auto">
                    <TreeView node={fileTree} onSelect={setSelectedNode} selectedNode={selectedNode} />
                </div>
                <div className="md:col-span-2 filigree-border p-4 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <FileContentView selectedNode={selectedNode} />
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SpectreBrowserView;