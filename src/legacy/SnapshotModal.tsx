import React from 'react';
import { OmniEntitySnapshot } from '../../../types';
import { EGREGORE_COLORS } from '../../common';

export const SnapshotModal = ({ snapshot, onClose }: { snapshot: OmniEntitySnapshot, onClose: () => void}) => {
     return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#2a2a2e] p-6 rounded-lg border border-gray-600 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <h3 className={`text-xl font-bold ${EGREGORE_COLORS[snapshot.name] || 'text-white'} mb-2`}>{snapshot.name}</h3>
                <p className="text-sm text-gray-400 mb-4">Entity Snapshot (ID: {snapshot.id})</p>
                <div className="text-sm space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    <p><strong>Class:</strong> {snapshot.class}</p>
                    <p><strong>State:</strong> <span className={snapshot.state === 'active' ? 'text-green-400' : 'text-gray-500'}>{snapshot.state}</span></p>
                    <p><strong>Created:</strong> {new Date(snapshot.created).toLocaleString()}</p>
                    <p><strong>Traits:</strong> {snapshot.traits.join(', ')}</p>
                    <p><strong>Capabilities:</strong> {snapshot.capabilities.join(', ')}</p>
                     <p><strong>Provenance Origin:</strong> {snapshot.provenance?.origin}</p>
                    <p><strong>Audit Log Size:</strong> {snapshot.audit_log_size}</p>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2 rounded-md bg-gray-700 hover:bg-gray-600">Close</button>
            </div>
        </div>
    );
};
