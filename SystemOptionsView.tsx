


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import { XIcon, SettingsIcon } from '../components/icons';
import { AXIOM_NAMES } from '../constants';
import type { SystemConfig, CosmicAxioms, GameOptions } from '@/types';

const Toggle = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: () => void }) => (
     <div className="flex items-center justify-between">
        <div>
            <label htmlFor={`${label}-toggle`} className="text-gray-300">{label}</label>
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <button
            id={`${label}-toggle`}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-green-600' : 'bg-gray-600'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);


const SystemOptionsView = () => {
    const { system_config, cosmic_axioms, options: globalOptions } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const [config, setConfig] = useState<SystemConfig>(system_config);
    const [options, setOptions] = useState<GameOptions>(globalOptions);
    const [axioms, setAxioms] = useState<CosmicAxioms>(cosmic_axioms);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const configChanged = JSON.stringify(config) !== JSON.stringify(system_config);
        const optionsChanged = JSON.stringify(options) !== JSON.stringify(globalOptions);
        const axiomsChanged = JSON.stringify(axioms) !== JSON.stringify(cosmic_axioms);
        setHasChanges(configChanged || optionsChanged || axiomsChanged);
    }, [config, options, axioms, system_config, globalOptions, cosmic_axioms]);

    const handleConfigChange = (field: keyof SystemConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };
    
    const handleOptionChange = (field: keyof GameOptions['gameplay'], value: any) => {
        setOptions(prev => ({ ...prev, gameplay: { ...prev.gameplay, [field]: value } }));
    };

    const handleAxiomChange = (axiom: keyof CosmicAxioms, value: number) => {
        setAxioms(prev => ({ ...prev, [axiom]: value }));
    };

    const handleSaveChanges = () => {
        dispatch({ type: 'UPDATE_SYSTEM_CONFIG', payload: config });
        dispatch({ type: 'APPLY_OPTIONS', payload: options });
        Object.keys(axioms).forEach(key => {
            const axiomKey = key as keyof CosmicAxioms;
            if (axioms[axiomKey] !== cosmic_axioms[axiomKey]) {
                dispatch({ type: 'UPDATE_SINGLE_AXIOM', payload: { axiom: axiomKey, value: axioms[axiomKey] } });
            }
        });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: 'System options have been updated.' });
    };
    
    const handleResetToDefaults = () => {
        setConfig(system_config);
        setOptions(globalOptions);
        setAxioms(cosmic_axioms);
    };

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div className="w-full h-full p-6 pt-24 flex flex-col relative overflow-y-auto">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20" aria-label="Return to Sanctum">
                <XIcon />
            </button>
            <div className="flex items-center gap-4 mb-6">
                <SettingsIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">System Options</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Loop Control */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="filigree-border p-4 space-y-4">
                    <h2 className="text-xl font-display text-metacosm-accent">Game Loop Control</h2>
                    <Toggle 
                        label="Enable Game Loop Watchdog"
                        checked={config.watchdogEnabled}
                        onChange={() => handleConfigChange('watchdogEnabled', !config.watchdogEnabled)}
                    />
                     <div>
                        <label htmlFor="turn-interval-slider" className="flex justify-between text-sm text-gray-300">
                            <span>Turn Interval Speed</span>
                            <span>{((config.turnInterval || 0) / 1000).toFixed(1)}s</span>
                        </label>
                        <input
                            id="turn-interval-slider"
                            type="range"
                            min="5000" max="60000" step="1000"
                            value={config.turnInterval || 0}
                            onChange={(e) => handleConfigChange('turnInterval', Number(e.target.value))}
                            className="w-full appearance-none bg-transparent accent-metacosm-accent cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/25 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-metacosm-accent"
                        />
                    </div>
                </motion.div>

                {/* Architect Settings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.1}} className="filigree-border p-4 space-y-4">
                    <h2 className="text-xl font-display text-metacosm-accent">Rollback & Continuity Settings</h2>
                    <div>
                        <label htmlFor="aether-regen-slider" className="flex justify-between text-sm text-gray-300">
                            <span>Aether Regeneration Rate (per turn)</span>
                            <span>{config.aetherRegenRate || 0}</span>
                        </label>
                        <input
                            id="aether-regen-slider"
                            type="range"
                            min="0" max="20" step="1"
                            value={config.aetherRegenRate || 0}
                            onChange={(e) => handleConfigChange('aetherRegenRate', Number(e.target.value))}
                            className="w-full appearance-none bg-transparent accent-metacosm-accent cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/25 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-metacosm-accent"
                        />
                    </div>
                    <Toggle 
                        label="Disable Reset on Load Failure"
                        description="Prevents auto-deletion of corrupted save files."
                        checked={config.disableResetOnLoadFailure}
                        onChange={() => handleConfigChange('disableResetOnLoadFailure', !config.disableResetOnLoadFailure)}
                    />
                     <Toggle 
                        label="Protect Egregores on Rollback"
                        description="Preserves newly created Egregores during a turn rollback."
                        checked={config.protectEgregoresOnRollback}
                        onChange={() => handleConfigChange('protectEgregoresOnRollback', !config.protectEgregoresOnRollback)}
                    />
                    <Toggle 
                        label="Protect Works on Rollback"
                        description="Preserves new Lore and Ancillae during a turn rollback."
                        checked={config.protectWorksOnRollback}
                        onChange={() => handleConfigChange('protectWorksOnRollback', !config.protectWorksOnRollback)}
                    />
                </motion.div>
                
                {/* Gameplay Options */}
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}} className="filigree-border p-4 space-y-4">
                     <h2 className="text-xl font-display text-metacosm-accent">Gameplay Options</h2>
                     <Toggle 
                        label="Enable A* Pathfinding"
                        description="Activates advanced pathfinding for Egregores."
                        checked={options.gameplay.useAStarPathfinding}
                        onChange={() => handleOptionChange('useAStarPathfinding', !options.gameplay.useAStarPathfinding)}
                    />
                 </motion.div>

                {/* Cosmic Axioms */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.3}} className="md:col-span-2 filigree-border p-4">
                    <h2 className="text-xl font-display text-metacosm-accent mb-4">Cosmic Axiom Tuner</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {Object.keys(axioms).map((key) => (
                             <div key={key}>
                                <label htmlFor={`${key}-slider`} className="flex justify-between text-sm text-gray-300">
                                    <span>{AXIOM_NAMES[key]}</span>
                                    <span>{((axioms[key as keyof CosmicAxioms]) || 0).toFixed(2)}</span>
                                </label>
                                <input
                                    id={`${key}-slider`}
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={(axioms[key as keyof CosmicAxioms]) || 0}
                                    onChange={(e) => handleAxiomChange(key as keyof CosmicAxioms, Number(e.target.value))}
                                    className="w-full appearance-none bg-transparent accent-metacosm-accent cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/25 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-metacosm-accent"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {hasChanges && (
                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="mt-6 flex justify-end gap-3 p-4 filigree-border bg-black/30 sticky bottom-6">
                    <button onClick={handleResetToDefaults} className="px-6 py-2 rounded-lg bg-gray-600/50 hover:bg-gray-500/50 text-gray-200">Reset</button>
                    <button onClick={handleSaveChanges} className="px-6 py-2 rounded-lg bg-green-600/50 hover:bg-green-500/50 text-green-200 font-bold">Save Changes</button>
                </motion.div>
            )}
        </div>
    );
};

export default SystemOptionsView;
