
import React, { useState, useEffect } from 'react';
import { Metacosm } from '../../../core/metacosm';
import { PersistenceService } from '../../../services/persistenceService';

export const SaveLoadState = ({ metacosm, onLoadState, onExport }: {
    metacosm: Metacosm;
    onLoadState: (serializedState: string) => void;
    onExport?: () => void;
}) => {
    const [saveSlots, setSaveSlots] = useState<any[]>([]);

    useEffect(() => {
        const saves = JSON.parse(localStorage.getItem('metacosm_saves') || '[]');
        setSaveSlots(saves);
    }, []);

    const handleSave = (slot: number) => {
        const saves = [...saveSlots];
        const serializedState = metacosm.serialize();
        saves[slot] = {
            timestamp: new Date().toISOString(),
            turn: JSON.parse(serializedState).turn,
            data: serializedState
        };
        localStorage.setItem('metacosm_saves', JSON.stringify(saves));
        setSaveSlots(saves);
    };

    const handleLoad = (slot: number) => {
        if (saveSlots[slot]) {
            if(window.confirm(`WARNING: Reality Overwrite Imminent.\n\nLoading slot ${slot + 1} will erase the current timeline. Continue?`)) {
                onLoadState(saveSlots[slot].data);
            }
        }
    };

    const handleExportClick = async () => {
        if (onExport) {
            await onExport();
        } else {
             await PersistenceService.exportUniverse(metacosm, {}, {}); 
        }
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Timeline Anchors
                </h3>
                <button onClick={handleExportClick} className="text-xs bg-cyan-900/50 hover:bg-cyan-800 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded flex items-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Universe (.zip)
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`p-4 rounded-xl border transition-all relative overflow-hidden group ${saveSlots[i] ? 'bg-black/40 border-amber-500/30 hover:border-amber-400' : 'bg-black/20 border-gray-800 border-dashed'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold uppercase tracking-widest ${saveSlots[i] ? 'text-amber-500' : 'text-gray-600'}`}>
                                Slot {i + 1}
                            </span>
                            {saveSlots[i] && <span className="text-[10px] text-amber-300/50 border border-amber-500/20 px-1 rounded">ACTIVE</span>}
                        </div>
                        
                        {saveSlots[i] ? (
                            <>
                                <p className="text-2xl font-bold text-white mb-1">Turn {saveSlots[i].turn}</p>
                                <p className="text-xs text-gray-500 font-mono mb-4">{new Date(saveSlots[i].timestamp).toLocaleString()}</p>
                                <div className="flex gap-2">
                                     <button onClick={() => handleLoad(i)} className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded uppercase tracking-wide transition-colors">Restore</button>
                                     <button onClick={() => handleSave(i)} className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded uppercase tracking-wide transition-colors">Overwrite</button>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center min-h-[80px]">
                                 <p className="text-xs text-gray-600 italic mb-2">Empty Timeline</p>
                                 <button onClick={() => handleSave(i)} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-bold text-xs rounded uppercase tracking-wide transition-colors">
                                     Create Anchor
                                 </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
