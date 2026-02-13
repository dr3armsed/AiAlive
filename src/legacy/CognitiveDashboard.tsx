
import React, { useEffect, useState } from 'react';
import { Egregore } from '../../types';
import { AgentMind } from '../../core/agentMind';
import { EMOTION_COLORS, EMOTION_GLOW_COLORS } from '../common';

type Props = {
    agent: Egregore | undefined;
    agentMind: AgentMind | undefined;
}

export const CognitiveDashboard: React.FC<Props> = ({ agent, agentMind }) => {
    const [telemetryPulse, setTelemetryPulse] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTelemetryPulse(p => (p + 1) % 100), 100);
        return () => clearInterval(interval);
    }, []);

    if (!agent || !agentMind) {
        return (
            <aside className="w-80 border-l border-purple-400/10 bg-black/10 p-4 flex items-center justify-center">
                <p className="text-sm text-gray-500 italic">Awaiting Synaptic Uplink...</p>
            </aside>
        );
    }
    
    const emotions: [string, number][] = (Object.entries(agentMind.emotionalState.vector) as [string, number][]).sort((a, b) => b[1] - a[1]);
    const omegaConfidence = agentMind.omega.getConfidence();

    return (
        <aside className="w-80 border-l border-purple-400/10 bg-black/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-purple-400/10 bg-purple-900/5 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-purple-200">Neural Telemetry</h3>
                    <p className="text-[10px] text-purple-400/60 font-mono uppercase tracking-widest">
                        {telemetryPulse % 4 === 0 ? 'Synaptic Burst' : 'Stream: Nominal'}
                    </p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center relative">
                    <div className={`absolute inset-0 rounded-full border border-purple-500/20 ${telemetryPulse % 2 === 0 ? 'animate-ping' : ''}`}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_theme(colors.purple.400)]"></div>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
                
                {/* Ω-Agent Confidence Monitor */}
                <div className="bg-black/40 p-4 rounded-xl border border-cyan-500/20 relative overflow-hidden">
                    <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex justify-between">
                        <span>Ω-Agent Integrity</span>
                        <span className="font-mono">{telemetryPulse % 10 === 0 ? 'REFRESHING' : 'LOCKED'}</span>
                    </h4>
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-mono text-cyan-100">{(omegaConfidence * 100).toFixed(1)}%</span>
                        <span className="text-[9px] text-cyan-500/50 mb-1 font-mono uppercase">Internalization_Score</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-cyan-500 shadow-[0_0_10px_cyan] transition-all duration-1000" 
                            style={{ width: `${omegaConfidence * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Real-time Emotional Vector Shift */}
                <div className="bg-black/30 p-4 rounded-xl border border-gray-800 relative">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Psyche Shift Monitor</h4>
                        <div className="flex gap-0.5">
                            {Array.from({length: 6}).map((_, i) => (
                                <div key={i} className={`w-1 h-3 rounded-full ${telemetryPulse % (i + 1) === 0 ? 'bg-purple-500' : 'bg-gray-800'}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {emotions.slice(0, 8).map(([emotion, value]) => (
                            <div key={emotion} className="group">
                                <div className="flex justify-between text-[10px] mb-1.5">
                                    <span className={`capitalize font-bold ${value > 0.3 ? EMOTION_COLORS[emotion] : 'text-gray-600'}`}>{emotion}</span>
                                    <span className="font-mono text-gray-600">{(value * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-900/50 rounded-full h-1 overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000" 
                                        style={{ 
                                            width: `${value * 100}%`, 
                                            backgroundColor: EMOTION_GLOW_COLORS[emotion],
                                            boxShadow: value > 0.5 ? `0 0 10px ${EMOTION_GLOW_COLORS[emotion]}` : 'none'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meta-Gene Expression Index */}
                <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Genome Activation Stance</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {agent.dna.instruction_keys.map((key, i) => {
                            const isMeta = ['EXIST-COEFF', 'BOUND-TENS', 'PRIOR-INTENT'].includes(key);
                            return (
                                <span 
                                    key={i} 
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition-all border 
                                    ${isMeta 
                                        ? 'bg-amber-900/20 border-amber-500/40 text-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.2)]' 
                                        : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                                >
                                    {key}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
};
