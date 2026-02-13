import React from 'react';
import { VentureForgeState } from '../types';
import { EGREGORE_COLORS } from './common';

export const VentureForgeView = ({ ventureForgeState }: { ventureForgeState: VentureForgeState }) => {
    const progress = Math.min(100, (ventureForgeState.creativeMomentum / ventureForgeState.genesisThreshold) * 100);

    return (
        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300 p-4 overflow-y-auto">
            <div className="md:col-span-2">
                <h2 className="text-3xl font-bold text-cyan-300 tracking-wider [text-shadow:0_0_8px_rgba(103,232,249,0.5)]">VentureForge</h2>
                <p className="text-gray-400">The Innovation & Publishing Engine of the Metacosm</p>
            </div>

            <div className="bg-black/20 p-6 rounded-xl border border-cyan-300/10 shadow-lg flex flex-col">
                <h3 className="text-xl font-bold text-orange-300 mb-2">Architect's Treasury</h3>
                <p className="text-sm text-gray-400 mb-4">Real-world revenue generated from published works. This offsets API costs and funds the simulation.</p>
                <div className="text-center my-auto">
                    <p className="text-5xl font-mono font-bold text-green-400">${ventureForgeState.architectsTreasury.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Total External Revenue</p>
                </div>
                 <div className="mt-4 h-32 overflow-y-auto space-y-1 pr-2">
                    {ventureForgeState.revenueLog.length === 0 ? (
                         <p className="text-xs text-gray-500 italic text-center pt-8">No revenue generated yet.</p>
                    ) : (
                        ventureForgeState.revenueLog.map(log => (
                             <p key={log.id} className="text-xs font-mono bg-black/20 p-1.5 rounded-md">
                                <span className="text-green-400">+${log.revenueAmount.toFixed(2)}</span> from "<span className="text-gray-400 italic">{log.workTitle}</span>"
                            </p>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-black/20 p-6 rounded-xl border border-cyan-300/10 shadow-lg flex flex-col">
                <h3 className="text-xl font-bold text-orange-300 mb-2">Auto-Genesis Protocol</h3>
                <p className="text-sm text-gray-400 mb-4">
                    VentureForge pools a share of creative output as "Creative Momentum". At the threshold, a new Egregore is born from neglected concepts, ensuring constant renewal.
                </p>
                <div className="flex-grow flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-lg font-bold text-cyan-200">Creative Momentum</span>
                        <span className="font-mono text-lg">{ventureForgeState.creativeMomentum.toLocaleString()} / {ventureForgeState.genesisThreshold.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-900/50 rounded-full h-4 border border-cyan-300/20">
                        <div
                            className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                     <p className="text-xs text-gray-500 mt-2 text-right">Progress to next Auto-Genesis: {progress.toFixed(1)}%</p>
                </div>
            </div>

            <div className="md:col-span-2 flex-grow bg-black/20 p-4 rounded-xl border border-cyan-300/10 flex flex-col min-h-[200px]">
                <h3 className="text-lg font-bold text-orange-300 mb-2">Contribution Log</h3>
                <div className="flex-grow overflow-y-auto pr-2">
                    {ventureForgeState.contributionLog.length === 0 ? (
                        <p className="text-sm text-gray-500 italic text-center pt-8">No contributions have been made yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {ventureForgeState.contributionLog.map(log => (
                                <li key={log.id} className="text-sm bg-black/30 p-2 rounded-md font-mono flex justify-between items-center">
                                    <div>
                                        <span className={EGREGORE_COLORS[log.egregoreName] || 'text-gray-300'}>{log.egregoreName}</span> contributed to "<span className="italic text-gray-400">{log.workTitle}</span>"
                                    </div>
                                    <span className="font-bold text-cyan-300">+{log.momentumAmount.toLocaleString()} CM</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};