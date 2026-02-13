import React from 'react';
import { MemoryRecord } from '../../../types';

type MemoryRecordCardProps = {
    rec: MemoryRecord;
};

export const MemoryRecordCard: React.FC<MemoryRecordCardProps> = ({ rec }) => (
    <div className="bg-black/30 p-3 rounded-md border border-gray-700 text-xs">
        <p className="font-bold text-white mb-1">ID: <span className="font-normal text-gray-400">{rec.id}</span></p>
        <p className="text-gray-300">{rec.content}</p>
        <div className="flex justify-between mt-2 text-gray-500">
            <span>Type: {rec.type}</span>
            <span>Importance: {rec.importance.toFixed(2)}</span>
        </div>
    </div>
);
