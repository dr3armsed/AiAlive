
import React from 'react';

export const SimulationControl = ({ simulationSpeed, setSimulationSpeed }: {
    simulationSpeed: number;
    setSimulationSpeed: (speed: number) => void;
}) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-amber-300 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Chronos Dilation
        </h3>
        <div className="bg-black/40 p-6 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-bold text-amber-500/80 uppercase tracking-wider">Time Dilation Factor</label>
                <span className="text-2xl font-mono text-amber-300">{simulationSpeed}ms</span>
            </div>
            
            <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
            />
            
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                <span>Hyper-Speed (100ms)</span>
                <span>Real-Time (5000ms)</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <div className={`w-3 h-3 rounded-full bg-amber-500 animate-pulse`} style={{ animationDuration: `${simulationSpeed}ms` }}></div>
                <span>Current Pulse Rhythm</span>
            </div>
        </div>
    </div>
);
