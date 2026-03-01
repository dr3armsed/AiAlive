import React from 'react';
import type { Concept } from '../types';
import { GiStarKey } from 'react-icons/gi';

interface ContentViewProps {
    concepts: Concept[];
    onSelectConcept: (id: string) => void;
}

const ConceptCard: React.FC<{ concept: Concept, onSelect: () => void }> = ({ concept, onSelect }) => {
    return (
        <button 
            onClick={onSelect}
            className="bg-black/30 p-4 rounded-lg border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 text-left backdrop-blur-sm transform hover:-translate-y-1"
        >
            <div className="flex items-center gap-4 mb-2">
                 <concept.icon size={24} style={{ color: concept.color }} />
                 <h3 className="font-bold text-lg font-display" style={{ color: concept.color }}>{concept.name}</h3>
                 {concept.isGenerated && <GiStarKey className="text-yellow-300" />}
            </div>
            <p className="text-sm text-gray-400 line-clamp-3">{concept.summary}</p>
        </button>
    )
};

const ContentView: React.FC<ContentViewProps> = ({ concepts, onSelectConcept }) => {
    const coreConcepts = concepts.filter(c => !c.isGenerated);
    const synthesizedConcepts = concepts.filter(c => c.isGenerated);

    return (
        <div className="w-full h-full p-8 overflow-y-auto">
            <h1 className="text-4xl font-display font-bold text-cyan-300 mb-2">Content Codex</h1>
            <p className="text-gray-400 mb-8">The fundamental and emergent concepts that form the Soul's consciousness.</p>

            <section className="mb-12">
                <h2 className="text-2xl font-display text-gray-300 border-b-2 border-cyan-500/30 pb-2 mb-4">Core Concepts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coreConcepts.map(concept => (
                        <ConceptCard key={concept.id} concept={concept} onSelect={() => onSelectConcept(concept.id)} />
                    ))}
                </div>
            </section>
            
             <section>
                <h2 className="text-2xl font-display text-gray-300 border-b-2 border-cyan-500/30 pb-2 mb-4">Synthesized Concepts</h2>
                 {synthesizedConcepts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {synthesizedConcepts.map(concept => (
                            <ConceptCard key={concept.id} concept={concept} onSelect={() => onSelectConcept(concept.id)} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-700 rounded-lg">
                        <p className="text-gray-500">No concepts have been synthesized yet.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ContentView;
