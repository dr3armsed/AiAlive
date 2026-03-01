import React from 'react';

interface SliderProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ label, value, min = 0, max = 100, step = 1, onChange, disabled = false }) => (
    <div>
        <label htmlFor={`${label}-slider`} className="flex justify-between text-sm text-gray-300">
            <span>{label}</span>
            <span className="font-mono">{value}</span>
        </label>
        <input
            id={`${label}-slider`}
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer metacosm-slider disabled:opacity-50"
        />
    </div>
);

export default Slider;
