
import React, { useState, useMemo } from 'react';
import { Egregore } from '../../../../types';

type Props = {
    egregores: Egregore[];
    isGenerating: boolean;
    onStart: (parentAId: string, parentBId: string) => void;
};

export const FusionTab: React.FC<Props> = ({ egregores, isGenerating, onStart }) => {
    const [parentAId, setParentAId] = useState('');
    const [parentBId, setParentBId] = useState('');

    const isReady = parentAId && parentBId && parentAId !== parentBId;

    const parentA = egregores.find(e => e.id === parentAId);
    const parentB = egregores.find(e => e.id === parentBId);

    const fusionAnalysis = useMemo(() => {
        if (!parentA || !parentB) return null;
        
        const dnaA = new Set(parentA.dna.instruction_keys);
        const dnaB = new Set(parentB.dna.instruction_keys);
        
        const intersection = parentA.dna.instruction_keys.filter(k => dnaB.has(k));
        const uniqueA = parentA.dna.instruction_keys.filter(k => !dnaB.has(k));
        const uniqueB = parentB.dna.instruction_keys.filter(k => !dnaA.has(k));
        
        const totalGenePool = new Set([...parentA.dna.instruction_keys, ...parentB.dna.instruction_keys]).size;
        const overlapPercent = (intersection.length / totalGenePool) * 100;

        return { intersection, uniqueA, uniqueB, overlapPercent };
    }, [parentA, parentB]);

    return (
        <div className="space-y-6 animate-fade-in">
            <p className="text-xs text-gray-500 -mt-2 border-l-2 border-yellow-600/30 pl-3 italic">
                The Fusion Protocol merges the DigitalDNA and personas of two existing Egregores to create a new evolutionary branch.
            </p>
            
            <div className="grid grid-cols-2 gap-4 relative">
                {/* Visual Connector */}
                <div className="absolute left-1/2 top-8 bottom-8 w-px bg-gray-700 -translate-x-1/2"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black border border-yellow-500 rounded-full flex items-center justify-center z-10 text-[10px] text-yellow-500 font-bold">
                    +
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Parent Alpha</label>
                    <select 
                        value={parentAId}
                        onChange={e => setParentAId(e.target.value)}
                        className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 text-sm focus:border-yellow-500 outline-none" 
                        disabled={isGenerating}
                    >
                        <option value="">Select Source</option>
                        {egregores.filter(e => e.id !== parentBId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1 text-right">Parent Beta</label>
                    <select 
                        value={parentBId}
                        onChange={e => setParentBId(e.target.value)}
                        className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 text-sm focus:border-yellow-500 outline-none text-right" 
                        disabled={isGenerating}
                    >
                        <option value="">Select Source</option>
                         {egregores.filter(e => e.id !== parentAId).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
            </div>

            {fusionAnalysis && (
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-xs">
                    <div className="flex justify-between mb-2 text-gray-400 uppercase font-bold tracking-wider text-[10px]">
                        <span>Genetic Compatibility</span>
                        <span>{fusionAnalysis.overlapPercent.toFixed(0)}% Overlap</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500/50" style={{ width: `${(fusionAnalysis.uniqueA.length / (fusionAnalysis.uniqueA.length + fusionAnalysis.intersection.length + fusionAnalysis.uniqueB.length)) * 100}%` }}></div>
                        <div className="h-full bg-purple-500" style={{ width: `${(fusionAnalysis.intersection.length / (fusionAnalysis.uniqueA.length + fusionAnalysis.intersection.length + fusionAnalysis.uniqueB.length)) * 100}%` }}></div>
                        <div className="h-full bg-red-500/50" style={{ width: `${(fusionAnalysis.uniqueB.length / (fusionAnalysis.uniqueA.length + fusionAnalysis.intersection.length + fusionAnalysis.uniqueB.length)) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-gray-500">
                        <span>{parentA?.name} Genes</span>
                        <span>Shared</span>
                        <span>{parentB?.name} Genes</span>
                    </div>
                </div>
            )}

            <button 
                onClick={() => onStart(parentAId, parentBId)}
                className="w-full py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                disabled={isGenerating || !isReady}
            >
                {isGenerating ? 'Fusing Pattern Buffers...' : 'Initiate Genetic Fusion'}
            </button>
        </div>
    );
};
