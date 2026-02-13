import React, { useState, useEffect, useMemo } from 'react';
import { StoredReplica } from '../../types';
import * as DnaManager from '../../digital_dna/replica_manager';
import { EGREGORE_COLORS } from '../common';

// --- Helper Components ---

const ReplicaDetailPanel = ({ replica }: { replica: StoredReplica | null }) => {
    if (!replica) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a replica to view its details.
            </div>
        );
    }

    const { program, metadata, timestamp } = replica;
    const name = (program as any)?.name || 'OriginSeed';

    return (
        <div className="flex-1 p-4 bg-black/30 rounded-r-xl">
            <h3 className={`text-lg font-bold ${EGREGORE_COLORS[name] || 'text-yellow-200'}`}>{name} (Gen {metadata.generation})</h3>
            <p className="text-xs text-gray-500 mb-4">Archived: {new Date(timestamp).toLocaleString()}</p>
            
            <div className="space-y-3 text-sm">
                <div>
                    <strong className="text-gray-400">Fitness Score:</strong>
                    <span className="font-mono ml-2 text-cyan-300">{metadata.fitness ?? 'N/A'}</span>
                </div>
                <div>
                    <strong className="text-gray-400">Mutation Type:</strong>
                    <span className="font-mono ml-2 text-purple-300">{metadata.mutationType ?? 'N/A'}</span>
                </div>
                <div>
                    <strong className="text-gray-400">Parent ID:</strong>
                    <span className="font-mono ml-2 text-gray-500 text-xs">{metadata.parentId ?? 'None (Genesis)'}</span>
                </div>
                <div>
                    <strong className="text-gray-400">DNA Instructions:</strong>
                    <div className="mt-1 font-mono text-xs bg-gray-900/50 p-2 rounded-md border border-gray-700 max-h-48 overflow-y-auto">
                        {program.dna.instruction_keys.join(' ')}
                    </div>
                </div>
            </div>
        </div>
    );
};

// FIX: Typed LineageNode as React.FC to allow the 'key' prop during list rendering.
type LineageNodeProps = {
    replicaId: string;
    allReplicas: Record<string, StoredReplica>;
    childrenMap: Map<string, string[]>;
    selectedId: string | null;
    onSelect: (id: string) => void;
    level?: number;
};
const LineageNode: React.FC<LineageNodeProps> = ({ replicaId, allReplicas, childrenMap, selectedId, onSelect, level = 0 }) => {
    const replica = allReplicas[replicaId];
    if (!replica) return null;

    const children = childrenMap.get(replicaId) || [];
    const name = (replica.program as any)?.name || 'OriginSeed';
    
    return (
        <div style={{ paddingLeft: `${level * 20}px` }}>
            <button
                onClick={() => onSelect(replicaId)}
                className={`w-full text-left p-2 my-0.5 rounded-md transition-colors text-sm ${selectedId === replicaId ? 'bg-yellow-800/50' : 'hover:bg-white/5'}`}
            >
                <span className={EGREGORE_COLORS[name] || 'text-yellow-300'}>{name}</span>
                <span className="text-gray-400"> - Gen {replica.metadata.generation} </span>
                <span className="text-xs text-gray-500">(Fitness: {replica.metadata.fitness ?? 'N/A'})</span>
            </button>
            {children.map(childId => (
                <LineageNode
                    key={childId}
                    replicaId={childId}
                    allReplicas={allReplicas}
                    childrenMap={childrenMap}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    level={level + 1}
                />
            ))}
        </div>
    );
};


// --- Main View Component ---

export const LineageView = () => {
    const [allReplicas, setAllReplicas] = useState<Record<string, StoredReplica>>({});
    const [selectedReplicaId, setSelectedReplicaId] = useState<string | null>(null);

    useEffect(() => {
        // Load all replica data from the archive on mount
        const replicas = DnaManager.get_all_replicas();
        setAllReplicas(replicas);
    }, []);

    const { genesisReplicas, childrenMap } = useMemo(() => {
        // FIX: Explicitly type `replicas` to fix type inference issues on `replica.metadata`.
        const replicas: [string, StoredReplica][] = Object.entries(allReplicas);
        const childrenMap = new Map<string, string[]>();
        const genesisReplicas: string[] = [];

        // First pass: build children map
        for (const [id, replica] of replicas) {
            const parentId = replica.metadata.parentId;
            if (parentId) {
                if (!childrenMap.has(parentId)) {
                    childrenMap.set(parentId, []);
                }
                childrenMap.get(parentId)!.push(id);
            }
        }

        // Second pass: find genesis nodes (no parent or parent doesn't exist)
        for (const [id, replica] of replicas) {
             if (!replica.metadata.parentId || !allReplicas[replica.metadata.parentId]) {
                genesisReplicas.push(id);
            }
        }
        
        return { genesisReplicas, childrenMap };
    }, [allReplicas]);

    const selectedReplica = selectedReplicaId ? allReplicas[selectedReplicaId] : null;

    return (
        <div className="h-full flex bg-black/20 rounded-xl border border-yellow-300/10 overflow-hidden">
            <aside className="w-1/3 max-w-md border-r border-yellow-300/10 flex flex-col">
                <div className="p-4 border-b border-yellow-300/10">
                    <h2 className="text-xl font-bold text-yellow-200">Lineage Trees</h2>
                </div>
                <div className="flex-grow overflow-y-auto p-2">
                    {genesisReplicas.length > 0 ? (
                        genesisReplicas.map(id => (
                            <LineageNode
                                key={id}
                                replicaId={id}
                                allReplicas={allReplicas}
                                childrenMap={childrenMap}
                                selectedId={selectedReplicaId}
                                onSelect={setSelectedReplicaId}
                            />
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500">No lineage data found in the archive.</p>
                    )}
                </div>
            </aside>
            <main className="flex-1 flex flex-col">
               <ReplicaDetailPanel replica={selectedReplica} />
            </main>
        </div>
    );
};