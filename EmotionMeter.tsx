import React from 'react';

// FIX: Typed EmotionMeter as React.FC to allow the 'key' prop during list rendering.
type EmotionMeterProps = {
    label: string;
    value: number;
};

export const EmotionMeter: React.FC<EmotionMeterProps> = ({ label, value }) => (
    <div className="w-full text-xs">
        <div className="flex justify-between mb-0.5">
            <span className="capitalize text-gray-400">{label}</span>
            <span>{(value * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${value * 100}%` }}></div>
        </div>
    </div>
);
