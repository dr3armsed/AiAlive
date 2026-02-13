
import React from 'react';
import { Egregore } from '../../types';
import { AgentMind } from '../../core/agentMind';

type Props = {
    agent: Egregore;
    agentMind: AgentMind;
};

export const FocusIntentTab: React.FC<Props> = ({ agent, agentMind }) => {
    return (
        <div className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-black/20 animate-fade-in space-y-6">
            
            {/* Header */}
            <div className="border-b border-purple-500/20 pb-4">
                <h3 className="text-2xl font-bold text-white mb-1">Focus & Intent</h3>
                <p className="text-xs text-purple-300 font-mono uppercase tracking-widest">Metacosmic Will // Goal Architecture</p>
            </div>

            {/* Current Cognitive Focus */}
            <div className="bg-purple-900/10 border border-purple-500/30 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-2">Current Cognitive Focus</h4>
                <p className="text-xl text-white font-serif leading-relaxed italic">
                    "{agentMind.cognitiveFocus || 'Awaiting Stimulus...'}"
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Active Goal Processing
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ambitions */}
                <div className="bg-black/30 border border-gray-700 p-5 rounded-xl">
                    <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Grand Ambitions
                    </h4>
                    <ul className="space-y-3">
                        {agent.ambitions.map((ambition, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-gray-300">
                                <span className="text-yellow-500/50 font-mono">0{idx + 1}</span>
                                <span>{ambition}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Core Values */}
                <div className="bg-black/30 border border-gray-700 p-5 rounded-xl">
                    <h4 className="text-sm font-bold text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Core Values
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {agent.coreValues.map((val, idx) => (
                            <span key={idx} className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded-full text-xs text-cyan-300 font-bold">
                                {val}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Self Conception */}
            <div className="bg-black/30 border border-gray-700 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Self-Conception</h4>
                <p className="text-sm text-gray-400 italic">
                    "{agentMind.selfConception || agent.persona}"
                </p>
            </div>
        </div>
    );
};
