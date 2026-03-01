

import React from 'react';
import { FiZoomIn, FiZoomOut, FiCompass } from 'react-icons/fi';

interface ViewControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onCenterView: () => void;
    onZoomChange: (newZoom: number) => void;
    className?: string;
}

const ViewControls = ({ zoom, onZoomIn, onZoomOut, onCenterView, onZoomChange, className }: ViewControlsProps) => (
    <div className={`flex flex-col gap-2 p-2 rounded-lg bg-black/50 filigree-border ${className}`}>
        <button onClick={onZoomIn} className="p-2 rounded-full hover:bg-amber-400/20 text-white" title="Zoom In">
            <FiZoomIn />
        </button>
        <input
            type="range"
            min="0.1"
            max="2"
            step="0.01"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-20 appearance-none bg-transparent accent-metacosm-accent cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/25 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-metacosm-accent"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
        />
        <button onClick={onZoomOut} className="p-2 rounded-full hover:bg-amber-400/20 text-white" title="Zoom Out">
            <FiZoomOut />
        </button>
        <button onClick={onCenterView} className="p-2 mt-2 rounded-full hover:bg-amber-400/20 text-white" title="Center View">
            <FiCompass />
        </button>
    </div>
);

export default ViewControls;