import React from 'react';
import { MemorySummary } from '../../../types';

export const MemorySummaryDisplay = ({ summary }: { summary: MemorySummary | null }) => (
    <div className="bg-black/20 p-4 rounded-lg mb-4">
        <h4 className="font-semibold mb-2">Store Summary</h4>
        {summary ? (
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                {Object.entries(summary).map(([key, value]) => (
                    <div key={key} className="bg-black/20 p-2 rounded">
                        <p className="font-bold text-lg text-cyan-300">{value as number}</p>
                        <p className="text-xs text-gray-400 capitalize">{key.replace('_', ' ')}</p>
                    </div>
                ))}
            </div>
        ) : <p className="text-gray-500">Loading summary...</p>}
    </div>
);
