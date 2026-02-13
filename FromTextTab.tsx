
import React, { useMemo, useState } from 'react';
import { ProposedEgregore, EgregoreArchetype } from '../../../../types';
import { Icons } from '../../../common';
import { extractDeepPersonalities, DeepPsycheProfile } from '../../../../services/geminiServices/index';

type Props = {
    proposal: Partial<ProposedEgregore>;
    handleProposalChange: (field: keyof Omit<ProposedEgregore, 'dna'>, value: any) => void;
    sourceMaterial: string;
    setSourceMaterial: (value: string) => void;
    sourceFile: File | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleClearFile: () => void;
    isGenerating: boolean;
    applyDnaPreset: (archetypeId: string) => void;
    baseArchetypes: EgregoreArchetype[];
    onEntitiesDetected: (entities: DeepPsycheProfile[]) => void;
};

export const FromTextTab: React.FC<Props> = ({
    proposal, handleProposalChange, sourceMaterial, setSourceMaterial, sourceFile, handleFileChange, handleClearFile, isGenerating, applyDnaPreset, baseArchetypes, onEntitiesDetected
}) => {
    const [isScanning, setIsScanning] = useState(false);
    
    // Calculate "Entropy" (complexity/richness) of the source material
    const entropyStats = useMemo(() => {
        const length = sourceMaterial.length;
        const words = sourceMaterial.split(/\s+/).filter(w => w.length > 0).length;
        const uniqueWords = new Set(sourceMaterial.toLowerCase().split(/\s+/)).size;
        const richness = words > 0 ? uniqueWords / words : 0;
        
        let score = 0;
        if (length > 50) score += 20;
        if (length > 200) score += 20;
        if (length > 1000) score += 20;
        if (richness > 0.5) score += 20;
        if (richness > 0.7) score += 20;
        
        return { score, words, richness };
    }, [sourceMaterial]);

    const getEntropyColor = (score: number) => {
        if (score < 40) return 'text-gray-500';
        if (score < 70) return 'text-yellow-500';
        return 'text-purple-400';
    };

    const getEntropyLabel = (score: number) => {
        if (score < 20) return 'Void (Empty)';
        if (score < 40) return 'Sparse (Minimal)';
        if (score < 70) return 'Coherent (Standard)';
        if (score < 90) return 'Rich (High Fidelity)';
        return 'Dense (Hyper-Complex)';
    };

    const handleScan = async () => {
        if (!sourceMaterial || sourceMaterial.length < 20) return;
        setIsScanning(true);
        try {
            const entities = await extractDeepPersonalities(sourceMaterial);
            onEntitiesDetected(entities);
        } catch (e) {
            console.error("Scan failed", e);
        } finally {
            setIsScanning(false);
        }
    };

    // Check if the current archetype is a custom detected one
    const isCustomArchetype = proposal.archetypeId && !baseArchetypes.some(a => a.id === proposal.archetypeId);

    return (
        <div className="space-y-4 animate-fade-in">
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Designation (Name)</label>
                    <input 
                        type="text" 
                        value={proposal.name} 
                        onChange={e => handleProposalChange('name', e.target.value)} 
                        placeholder="Enter Name..." 
                        className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 text-sm focus:border-yellow-500 outline-none transition-colors" 
                        disabled={isGenerating} 
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Core Archetype</label>
                    <select 
                        value={proposal.archetypeId} 
                        onChange={e => { handleProposalChange('archetypeId', e.target.value); applyDnaPreset(e.target.value); }} 
                        className={`w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 text-sm focus:border-yellow-500 outline-none transition-colors ${isCustomArchetype ? 'text-cyan-400 font-bold border-cyan-500/50' : ''}`}
                        disabled={isGenerating}
                    >
                        {baseArchetypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        
                        {/* Dynamically render detected archetype if it's not in the base list */}
                        {isCustomArchetype && (
                            <option value={proposal.archetypeId} className="bg-cyan-900 text-cyan-300">
                                ✨ {proposal.archetypeId} (Detected)
                            </option>
                        )}
                    </select>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-bold uppercase text-gray-500">Subconscious Seed (Source Material)</label>
                    <div className="flex gap-4 items-center">
                        <button 
                            onClick={handleScan} 
                            disabled={isScanning || sourceMaterial.length < 20}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${isScanning ? 'text-yellow-500 border-yellow-500 animate-pulse' : 'text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10'}`}
                        >
                            {isScanning ? 'Scanning Resonance...' : 'Analyze Resonance'}
                        </button>
                        <div className={`text-[10px] font-mono ${getEntropyColor(entropyStats.score)}`}>
                            Entropy: {getEntropyLabel(entropyStats.score)} ({entropyStats.score}%)
                        </div>
                    </div>
                </div>
                
                {sourceFile && (
                    <div className="flex items-center justify-between bg-gray-800/50 p-1.5 rounded-md mb-2 text-xs border border-yellow-500/30">
                        <span className="truncate text-gray-300 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                            {sourceFile.name}
                        </span>
                        <button onClick={handleClearFile} className="text-red-400 hover:text-red-300 font-bold px-2" disabled={isGenerating}>DISCARD</button>
                    </div>
                )}
                
                <div className="relative">
                    <textarea 
                        value={sourceMaterial} 
                        onChange={e => setSourceMaterial(e.target.value)} 
                        rows={8} 
                        className="w-full bg-black/40 p-3 rounded-md border border-gray-700 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all text-sm font-mono text-gray-300 placeholder-gray-700 resize-none" 
                        placeholder="Paste the soul-seed here. It can be a poem, a code snippet, a diary entry, or chaos..." 
                        disabled={isGenerating}
                    ></textarea>
                    
                    {/* Entropy Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 rounded-b-md overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${entropyStats.score < 50 ? 'bg-gray-500' : 'bg-gradient-to-r from-yellow-600 to-purple-500'}`} 
                            style={{ width: `${entropyStats.score}%` }}
                        ></div>
                    </div>
                </div>

                <label className={`cursor-pointer text-xs flex items-center justify-center gap-2 mt-3 py-2 border border-dashed border-gray-700 rounded-md transition-all ${isGenerating ? 'text-gray-600' : 'hover:border-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/5'}`}>
                    {Icons.upload} 
                    <span>Upload Source File (.txt)</span>
                    <input type="file" onChange={handleFileChange} className="hidden" accept=".txt" disabled={isGenerating} />
                </label>
            </div>
        </div>
    );
};
