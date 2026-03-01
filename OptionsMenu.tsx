import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameOptions, GraphicsQuality } from '../types';
import { loadOptions, saveOptions, defaultOptions } from '../services/optionsService';
import { XIcon } from './icons';
import Toggle from './ui/Toggle';
import Slider from './ui/Slider';
import clsx from 'clsx';

interface OptionsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (options: GameOptions) => void;
}

type OptionsTab = 'Graphics' | 'Audio' | 'Gameplay';

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={clsx(
            "px-4 py-2 text-sm font-medium transition-colors",
            active ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400 hover:text-white'
        )}
    >
        {children}
    </button>
);


const OptionsMenu: React.FC<OptionsMenuProps> = ({ isOpen, onClose, onSave }) => {
    const [options, setOptions] = useState<GameOptions>(loadOptions);
    const [activeTab, setActiveTab] = useState<OptionsTab>('Graphics');

    useEffect(() => {
        if (isOpen) {
            setOptions(loadOptions());
        }
    }, [isOpen]);

    const handleSave = () => {
        saveOptions(options);
        onSave(options);
        onClose();
    };
    
    const handleReset = () => {
        setOptions(defaultOptions);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="filigree-border w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 flex flex-col gap-4 h-[80vh]">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-display celestial-text">Options</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                    </div>

                    <div className="border-b border-amber-400/20">
                        <TabButton active={activeTab === 'Graphics'} onClick={() => setActiveTab('Graphics')}>Graphics</TabButton>
                        <TabButton active={activeTab === 'Audio'} onClick={() => setActiveTab('Audio')}>Audio</TabButton>
                        <TabButton active={activeTab === 'Gameplay'} onClick={() => setActiveTab('Gameplay')}>Gameplay</TabButton>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {activeTab === 'Graphics' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Quality Preset</label>
                                    <select 
                                        value={options.graphics.quality} 
                                        onChange={e => setOptions(o => ({...o, graphics: {...o.graphics, quality: e.target.value as GraphicsQuality}}))}
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <Toggle label="Particle Effects" checked={options.graphics.particleEffects} onChange={c => setOptions(o => ({...o, graphics: {...o.graphics, particleEffects: c}}))} />
                                <Toggle label="Post-Processing (Glow)" checked={options.graphics.postProcessing} onChange={c => setOptions(o => ({...o, graphics: {...o.graphics, postProcessing: c}}))} />
                            </div>
                        )}
                        {activeTab === 'Audio' && (
                            <div className="space-y-4">
                                <Slider label="Master Volume" value={options.audio.master} onChange={v => setOptions(o => ({...o, audio: {...o.audio, master: v}}))} />
                                <Slider label="Sound Effects" value={options.audio.sfx} onChange={v => setOptions(o => ({...o, audio: {...o.audio, sfx: v}}))} />
                                <Slider label="Music" value={options.audio.music} onChange={v => setOptions(o => ({...o, audio: {...o.audio, music: v}}))} />
                            </div>
                        )}
                         {activeTab === 'Gameplay' && (
                            <div className="space-y-4">
                                <Toggle label="Use A* Pathfinding" description="More accurate but slightly slower pathfinding." checked={options.gameplay.useAStarPathfinding} onChange={c => setOptions(o => ({...o, gameplay: {...o.gameplay, useAStarPathfinding: c}}))} />
                                <Toggle label="Show Turn Timer" description="Display the countdown to the next turn." checked={options.gameplay.showTurnTimer} onChange={c => setOptions(o => ({...o, gameplay: {...o.gameplay, showTurnTimer: c}}))} />
                                <Toggle label="Enable Autosave" description="Automatically saves every 10 turns (not yet implemented)." checked={options.gameplay.autoSave} onChange={c => setOptions(o => ({...o, gameplay: {...o.gameplay, autoSave: c}}))} disabled/>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-amber-400/10">
                         <button onClick={handleReset} className="px-4 py-2 text-sm rounded-lg bg-red-800/50 hover:bg-red-700/50 text-red-200">Reset to Defaults</button>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-gray-600/50 hover:bg-gray-500/50">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 text-sm rounded-lg bg-green-600/50 hover:bg-green-500/50 font-bold">Save</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OptionsMenu;
