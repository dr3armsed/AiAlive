
import React, { useState, useEffect } from 'react';
import { Egregore, OmniEntity, OmniEntitySnapshot } from '../../../types';
import { listEntities, getEntitySnapshot } from '../../../omnilib-facade/clients';
import { EGREGORE_COLORS } from '../../common';
import { SnapshotModal } from './SnapshotModal';

export const EgregoresView = ({ egregores }: { egregores: Egregore[] }) => {
    const [entities, setEntities] = useState<OmniEntity[]>([]);
    const [selectedSnapshot, setSelectedSnapshot] = useState<OmniEntitySnapshot | null>(null);

    useEffect(() => {
        listEntities().then(setEntities);
    }, [egregores]); 
    
    const handleViewSnapshot = async (id: string) => {
        const snapshot = await getEntitySnapshot(id);
        setSelectedSnapshot(snapshot);
    };

    return (
        <div className="h-full overflow-y-auto p-1 pr-4 text-gray-300">
             <div className="flex justify-between items-end mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-blue-300">Entity Registry</h3>
                    <p className="text-xs text-blue-500/60 font-mono">LIVE_FEED // OMNILIB_SYNC</p>
                 </div>
                 <div className="text-xs text-gray-500">
                     Total Entities: <span className="text-white font-bold">{entities.length}</span>
                 </div>
             </div>

            <div className="grid grid-cols-1 gap-3">
                {entities.map(entity => (
                    <div key={entity.id} className="bg-black/30 hover:bg-black/50 border border-gray-800 hover:border-blue-500/30 p-3 rounded-lg transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${entity.state === 'active' ? 'bg-green-500 shadow-[0_0_8px_lime]' : 'bg-gray-600'}`}></div>
                            <div>
                                <p className={`font-bold text-sm ${EGREGORE_COLORS[entity.name] || 'text-gray-200'}`}>{entity.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{entity.class} &middot; ID: {entity.id.slice(0,8)}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleViewSnapshot(entity.id)} 
                            className="opacity-0 group-hover:opacity-100 text-xs bg-blue-900/30 hover:bg-blue-600 text-blue-300 hover:text-white px-3 py-1.5 rounded border border-blue-500/30 transition-all"
                        >
                            View Data
                        </button>
                    </div>
                ))}
                
                {entities.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl">
                        <p className="text-gray-500">No entities found in registry.</p>
                    </div>
                )}
            </div>
            
            {selectedSnapshot && <SnapshotModal snapshot={selectedSnapshot} onClose={() => setSelectedSnapshot(null)} />}
        </div>
    );
};
