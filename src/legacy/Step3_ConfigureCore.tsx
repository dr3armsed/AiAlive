
import React, { useState, useMemo } from 'react';
import { ProposedEgregore } from '../../../types';
import { InstructionKey } from '../../../digital_dna/instructions';
import { GENE_DETAILS } from './geneDetails';
import { GeneInspector } from './GeneInspector';

type Props = {
    proposal: Partial<ProposedEgregore>;
    handleProposalChange: (field: keyof Omit<ProposedEgregore, 'dna'>, value: any) => void;
    handleDnaChange: (instruction: InstructionKey, checked: boolean) => void;
};

const GENE_GROUPS: Record<string, { keys: InstructionKey[], icon: React.ReactNode, description: string }> = {
    'Core Logic & I/O': {
        keys: ['01', '02', '03', 'GREET-CALL', '04', 'IO-LOG-OBJ', 'IO-DEF-ARR', 'IO-DEF-OBJ', 'IO-READ-PROP'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>,
        description: "Bedrock genes for existence and interaction."
    },
    'Control Flow': {
        keys: ['05', '06', '09', '0D', 'CTL-SWITCH', 'CTL-WHILE', 'CTL-TRY-CATCH', 'CTL-TERNARY'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00-1.449.389A7 7 0 003.03 8.65l.311.31H.925a.75.75 0 000 1.5h4.242a.75.75 0 00.75-.75V6.101a.75.75 0 00-1.5 0v2.432l-.31-.311a5.5 5.5 0 019.201-2.466z" clipRule="evenodd" /></svg>,
        description: "Enables complex decision-making loops."
    },
    'Advanced Functions': {
        keys: ['07', '08', '0B', '0F', 'FUNC-RAND', 'FUNC-STR-UP', 'FUNC-ARR-LEN', 'FUNC-OBJ-KEYS', 'FUNC-MAP'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>,
        description: "Higher-order cognitive capabilities and math."
    },
    'Utilities': {
        keys: ['0A', '0C', '0E', 'UTIL-PERF', 'UTIL-JSON-STR', 'UTIL-TYPEOF'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.078 2.25c-.217-.384-.58-.624-.978-.624s-.76.24-1.078.624l-3.5 6.125a.75.75 0 00.65 1.125h7a.75.75 0 00.65-1.125l-3.5-6.125zM11.078 6.875a.75.75 0 00-1.056 0l-3.5 6.125a.75.75 0 00.65 1.125h7a.75.75 0 00.65-1.125l-3.5-6.125a.75.75 0 00-.544-1.125z" clipRule="evenodd" /></svg>,
        description: "System grounding and safe data handling."
    },
    'Creative Expression': {
        keys: ['ART-GEN-PAT', 'ART-MIX-CLR', 'ART-NARRATIVE', 'ART-RHYTHM', 'ART-ASCII', 'ART-POEM'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 3.5a1.5 1.5 0 01.52 2.92l.024.012.008.004a6.96 6.96 0 012.03 3.655.75.75 0 01-1.48-.224 5.46 5.46 0 00-1.6-2.88L10 10.5l-.502-.278a5.46 5.46 0 00-1.6 2.88.75.75 0 01-1.48.223 6.96 6.96 0 012.03-3.655l.008-.004.024-.012A1.5 1.5 0 0110 3.5zM5.5 10a1.5 1.5 0 00-2.92-.52l-.012-.024-.004-.008a6.96 6.96 0 00-3.655-2.03.75.75 0 00.224 1.48 5.46 5.46 0 012.88 1.6L2.5 10l.278.502a5.46 5.46 0 01-2.88 1.6.75.75 0 00-.223 1.48 6.96 6.96 0 003.655-2.03l.004-.008.012-.024A1.5 1.5 0 005.5 10zm9.5-1.5a1.5 1.5 0 01.52 2.92l.024.012.008.004a6.96 6.96 0 012.03 3.655.75.75 0 01-1.48-.224 5.46 5.46 0 00-1.6-2.88L15 10.5l-.502-.278a5.46 5.46 0 00-1.6 2.88.75.75 0 01-1.48.223 6.96 6.96 0 012.03-3.655l.008-.004.024-.012A1.5 1.5 0 0115 8.5zm-5 6a1.5 1.5 0 00-2.92.52l-.012.024-.004.008a6.96 6.96 0 00-3.655 2.03.75.75 0 001.48.224 5.46 5.46 0 011.6-2.88L9.5 15l.278.502a5.46 5.46 0 011.6 2.88.75.75 0 001.48-.223 6.96 6.96 0 00-3.655-2.03l-.004-.008-.012-.024A1.5 1.5 0 0010 14.5z" /></svg>,
        description: "Aesthetic and artistic creation capabilities."
    },
};

// Gene Dependencies Map
const GENE_DEPENDENCIES: Record<string, string[]> = {
    '03': ['02'], // Call Greet needs Define Greet
    'GREET-CALL': ['02'],
    '08': ['07'], // Call Add needs Define Add
    'IO-READ-PROP': ['IO-DEF-OBJ'],
    'FUNC-MAP': ['IO-DEF-ARR'],
    'FUNC-ARR-LEN': ['IO-DEF-ARR'],
};

const GeneticStabilityMeter = ({ genes }: { genes: InstructionKey[] }) => {
    const stats = useMemo(() => {
        let score = 100;
        const counts = {
            art: genes.filter(k => k.startsWith('ART')).length,
            ctl: genes.filter(k => k.startsWith('CTL')).length,
            util: genes.filter(k => k.startsWith('UTIL')).length,
            total: genes.length
        };

        // Instability factors
        if (counts.art > 2 && counts.ctl === 0) score -= 20; // Chaos without control
        if (counts.total < 4) score -= 30; // Too simple to survive
        if (genes.includes('SELF-EDIT') && !genes.includes('CTL-TRY-CATCH')) score -= 40; // Dangerous self-mod without error handling

        // Stability factors
        if (genes.includes('CTL-TRY-CATCH')) score += 10;
        if (genes.includes('UTIL-TYPEOF')) score += 5;
        
        return { score: Math.min(100, Math.max(0, score)), counts };
    }, [genes]);

    let statusColor = 'bg-green-500';
    let statusLabel = 'Stable';
    
    if (stats.score < 40) { statusColor = 'bg-red-500'; statusLabel = 'Critical'; }
    else if (stats.score < 70) { statusColor = 'bg-yellow-500'; statusLabel = 'Volatile'; }

    return (
        <div className="bg-black/30 p-3 rounded-lg border border-gray-700 mb-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] uppercase font-bold text-gray-500">Genetic Stability Forecast</span>
                <span className={`text-xs font-bold ${statusColor.replace('bg-', 'text-')}`}>{statusLabel} ({stats.score}%)</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${statusColor} transition-all duration-500`} style={{ width: `${stats.score}%` }}></div>
            </div>
            <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                <span>Logic: {stats.counts.ctl}</span>
                <span>Creative: {stats.counts.art}</span>
                <span>Utility: {stats.counts.util}</span>
            </div>
        </div>
    );
};

export const Step3_ConfigureCore: React.FC<Props> = ({ proposal, handleProposalChange, handleDnaChange }) => {
    const [selectedGene, setSelectedGene] = useState<InstructionKey | null>(null);
    const currentGenes = proposal.dna?.instruction_keys || [];

    // Smart handler that checks dependencies
    const onGeneToggle = (key: InstructionKey, checked: boolean) => {
        handleDnaChange(key, checked);
        
        // Auto-select dependencies
        if (checked && GENE_DEPENDENCIES[key]) {
            GENE_DEPENDENCIES[key].forEach(dep => {
                if (!currentGenes.includes(dep as InstructionKey)) {
                    handleDnaChange(dep as InstructionKey, true);
                }
            });
        }
    };

    return (
        <div className="bg-black/20 p-6 rounded-xl border border-yellow-300/10 shadow-[0_0_15px_rgba(252,211,77,0.1)] animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-orange-300">Step 3: The Gene Splicer</h3>
                    <p className="text-xs text-gray-400">Splice the instruction set. Dependencies will be auto-linked.</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-mono text-yellow-500">{currentGenes.length}</span>
                    <p className="text-[10px] text-gray-500 uppercase">Active Genes</p>
                </div>
            </div>
            
            <GeneticStabilityMeter genes={currentGenes} />

            <div className="flex gap-6 h-[350px]">
                {/* Gene Sequencer */}
                <div className="w-1/2 space-y-4 pr-2 overflow-y-auto custom-scrollbar">
                    {Object.entries(GENE_GROUPS).map(([groupName, { keys, icon, description }]) => (
                        <div key={groupName}>
                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-1 flex items-center gap-2 sticky top-0 bg-gray-900/90 p-1 z-10 backdrop-blur-sm rounded">
                                {icon} {groupName}
                            </h4>
                            <div className="grid grid-cols-2 gap-1.5">
                                {keys.map(key => {
                                    const isSelected = currentGenes.includes(key);
                                    const isDependency = Object.values(GENE_DEPENDENCIES).flat().includes(key);
                                    
                                    return (
                                        <div key={key} onMouseEnter={() => setSelectedGene(key)}>
                                            <label 
                                                className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-all border text-xs
                                                ${isSelected 
                                                    ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200' 
                                                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-600 text-gray-400'}
                                                `}
                                            >
                                                <span className="font-mono font-bold">{key}</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected} 
                                                    onChange={(e) => onGeneToggle(key, e.target.checked)} 
                                                    className="accent-yellow-500 w-3 h-3" 
                                                />
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gene Inspector */}
                <div className="w-1/2 bg-black/40 border border-gray-700 rounded-lg overflow-hidden shadow-inner">
                    <GeneInspector selectedGeneKey={selectedGene} />
                </div>
            </div>
        </div>
    );
};
