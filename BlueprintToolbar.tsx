import React from 'react';
import type { ConstructionMaterial } from '../types';
import { SaveIcon, XCircleIcon, XIcon, SquareIcon } from './icons';
import clsx from 'clsx';

interface BlueprintToolbarProps {
    activeTool: 'wall' | 'room' | null;
    setActiveTool: (tool: 'wall' | 'room' | null) => void;
    activeMaterial: ConstructionMaterial;
    setActiveMaterial: (material: ConstructionMaterial) => void;
    onCommit: () => void;
    onDiscard: () => void;
    onExit: () => void;
}

const ToolButton = ({ onClick, isActive, children, title }: { onClick: () => void, isActive: boolean, children: React.ReactNode, title: string }) => (
    <button onClick={onClick} title={title} className={clsx('p-3 rounded-lg', isActive ? 'bg-amber-400/20 text-metacosm-accent' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>
        {children}
    </button>
);

const MaterialButton = ({ onClick, isActive, color, name }: { onClick: () => void, isActive: boolean, color: string, name: string }) => (
    <button onClick={onClick} title={name} className={clsx('w-8 h-8 rounded-full border-2 transition-transform', isActive ? 'border-white scale-110' : 'border-transparent')}>
        <div className="w-full h-full rounded-full" style={{ backgroundColor: color }}></div>
    </button>
);


export const BlueprintToolbar: React.FC<BlueprintToolbarProps> = ({
    activeTool, setActiveTool,
    activeMaterial, setActiveMaterial,
    onCommit, onDiscard, onExit
}) => {
    
    const materialColors = {
        plasteel: 'rgba(200, 200, 210, 0.8)',
        crystal: 'rgba(180, 220, 255, 0.8)',
        obsidian: 'rgba(80, 60, 100, 0.8)'
    };
    
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 filigree-border p-2 flex items-center gap-4">
            {/* Tools */}
            <div className="flex items-center gap-2">
                <ToolButton onClick={() => setActiveTool('wall')} isActive={activeTool === 'wall'} title="Wall Tool">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l18-18"/></svg>
                </ToolButton>
                <ToolButton onClick={() => setActiveTool('room')} isActive={activeTool === 'room'} title="Room Tool">
                    <SquareIcon />
                </ToolButton>
            </div>
            
            <div className="w-px h-10 bg-white/20"></div>

            {/* Materials */}
            <div className="flex items-center gap-3">
                <MaterialButton onClick={() => setActiveMaterial('plasteel')} isActive={activeMaterial === 'plasteel'} color={materialColors.plasteel} name="Plasteel"/>
                <MaterialButton onClick={() => setActiveMaterial('crystal')} isActive={activeMaterial === 'crystal'} color={materialColors.crystal} name="Crystal"/>
                <MaterialButton onClick={() => setActiveMaterial('obsidian')} isActive={activeMaterial === 'obsidian'} color={materialColors.obsidian} name="Obsidian"/>
            </div>

            <div className="w-px h-10 bg-white/20"></div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                 <button onClick={onCommit} title="Commit Blueprint" className="p-3 rounded-lg bg-green-800/80 text-green-300 hover:bg-green-700/80">
                    <SaveIcon />
                </button>
                 <button onClick={onDiscard} title="Discard Changes" className="p-3 rounded-lg bg-yellow-800/80 text-yellow-300 hover:bg-yellow-700/80">
                    <XCircleIcon />
                </button>
                 <button onClick={onExit} title="Exit Blueprint Mode" className="p-3 rounded-lg bg-red-800/80 text-red-300 hover:bg-red-700/80">
                    <XIcon />
                </button>
            </div>
        </div>
    );
};