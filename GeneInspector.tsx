import React from 'react';
import { InstructionKey } from '../../../digital_dna/instructions';
import { GENE_DETAILS } from './geneDetails';

type Props = {
    selectedGeneKey: InstructionKey | null;
};

export const GeneInspector: React.FC<Props> = ({ selectedGeneKey }) => {
    if (!selectedGeneKey) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <h4 className="font-bold text-gray-400">Gene Inspector</h4>
                <p className="text-xs text-gray-500">Hover over or select a gene from the sequencer to view its detailed codex entry.</p>
            </div>
        );
    }

    const gene = GENE_DETAILS[selectedGeneKey];

    return (
        <div className="h-full flex flex-col p-4 overflow-y-auto animate-fade-in">
            <h4 className="text-lg font-bold text-yellow-300 font-mono">
                Codex Entry: {selectedGeneKey} - {gene.name}
            </h4>
            <p className="text-sm text-gray-400 italic mt-1 mb-4">{gene.description}</p>
            
            <div className="space-y-3 text-xs text-gray-300 font-sans">
                <div>
                    <strong className="text-gray-400 uppercase tracking-wider">Functional Description</strong>
                    <p className="mt-1">{gene.paragraphs[0]}</p>
                </div>
                <div>
                    <strong className="text-gray-400 uppercase tracking-wider">Philosophical Implications</strong>
                    <p className="mt-1">{gene.paragraphs[1]}</p>
                </div>
                <div>
                    <strong className="text-gray-400 uppercase tracking-wider">Strategic Analysis</strong>
                    <p className="mt-1">{gene.paragraphs[2]}</p>
                </div>
            </div>
        </div>
    );
};
