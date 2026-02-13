import React from 'react';
import { InstructionKey } from '../../../../digital_dna/instructions';
import { Gene } from '../../../../digital_dna/digital_dna';
import { GENE_GROUPS } from './constants';

type Props = {
    currentGenes: InstructionKey[];
    genes: Gene[];
    onGeneToggle: (key: InstructionKey, checked: boolean) => void;
    onHoverGene: (key: InstructionKey) => void;
    onModifyGene?: (key: InstructionKey, strength: number) => void;
};

export const GeneSequencer: React.FC<Props> = ({ currentGenes, genes, onGeneToggle, onHoverGene, onModifyGene }) => {
    return (
        <div className="space-y-4 pr-2 overflow-y-auto custom-scrollbar h-full">
            {Object.entries(GENE_GROUPS).map(([groupName, { keys, icon, description }]) => (
                <div key={groupName}>
                    <h4 className="text-[10px] font-bold uppercase text-gray-500 mb-1.5 flex items-center gap-2 sticky top-0 bg-gray-900/95 p-1 z-10 backdrop-blur-sm rounded border-b border-gray-800">
                        {icon} {groupName}
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                        {keys.map(key => {
                            const isSelected = currentGenes.includes(key);
                            const geneData = genes.find(g => g.key === key);
                            
                            return (
                                <div 
                                    key={key} 
                                    onMouseEnter={() => onHoverGene(key)}
                                    className={`p-1.5 rounded transition-all border group/gene
                                        ${isSelected 
                                            ? 'bg-yellow-900/10 border-yellow-500/30' 
                                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <label className={`flex items-center gap-2 cursor-pointer text-xs font-mono font-bold ${isSelected ? 'text-yellow-200' : 'text-gray-500'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected} 
                                                onChange={(e) => onGeneToggle(key, e.target.checked)} 
                                                className="accent-yellow-500 w-3 h-3" 
                                            />
                                            {key}
                                            {geneData?.is_regulatory && <span className="text-[8px] bg-purple-900/40 text-purple-400 px-1 rounded">REG</span>}
                                        </label>
                                        {isSelected && geneData && (
                                            <span className="text-[9px] font-mono text-yellow-600/70">STR: {geneData.allele_strength.toFixed(2)}</span>
                                        )}
                                    </div>
                                    
                                    {/* Advanced: Allele Strength Slider for selected genes */}
                                    {isSelected && onModifyGene && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover/gene:opacity-100 transition-opacity">
                                            <span className="text-[8px] text-gray-600 uppercase">Dominance</span>
                                            <input 
                                                type="range"
                                                min="0.1"
                                                max="1.0"
                                                step="0.05"
                                                value={geneData?.allele_strength || 0.5}
                                                onChange={(e) => onModifyGene(key, parseFloat(e.target.value))}
                                                className="flex-grow h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-yellow-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
