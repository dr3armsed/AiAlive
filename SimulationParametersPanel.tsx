

import React from 'react';
import type { SimulationParameters } from '../../types/index.ts';
import BarChartIcon from '../icons/BarChartIcon.tsx';

interface SimulationParametersPanelProps {
  simParams: SimulationParameters;
  onUpdate: (newParams: Partial<SimulationParameters>) => void;
}

const Slider: React.FC<{ label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void } & React.HTMLAttributes<HTMLDivElement>> = 
({ label, value, min, max, step, onChange, ...props }) => (
    <div {...props}>
        <div className="flex justify-between items-baseline mb-1">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <span className="font-mono text-sm text-white bg-black/20 px-2 rounded">{value}x</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />
    </div>
);

const SimulationParametersPanel: React.FC<SimulationParametersPanelProps> = ({ simParams, onUpdate }) => {
  return (
    <div className="glass-panel p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BarChartIcon className="w-5 h-5 text-teal-400"/>
        Simulation Parameters
      </h3>
      <div className="space-y-4">
        <Slider
          label="Simulation Speed"
          value={simParams.speed}
          min={0.25}
          max={10}
          step={0.25}
          onChange={val => onUpdate({ speed: val })}
        />
        {/* Placeholder for future parameters
        <Slider
          label="Energy Recovery Rate"
          value={simParams.energyRecoveryRate}
          min={5}
          max={50}
          step={5}
          onChange={val => onUpdate({ energyRecoveryRate: val })}
        />
        */}
      </div>
    </div>
  );
};

export default SimulationParametersPanel;