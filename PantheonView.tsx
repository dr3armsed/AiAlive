import React from 'react';
import type { Character } from '../types';

interface PantheonViewProps {
    characters: Character[];
    onSelectCharacter: (id: string) => void;
}

const CharacterCard: React.FC<{ character: Character, onSelect: () => void }> = ({ character, onSelect }) => {
    const color = character.isDenizen ? '#e879f9' : '#fbbf24';
    const initials = character.name.split(' ').map(n => n[0]).slice(0, 2).join('');

    return (
        <button 
            onClick={onSelect}
            className="bg-black/30 p-4 rounded-lg border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 text-left backdrop-blur-sm transform hover:-translate-y-1"
            style={{ '--glow-color': color } as React.CSSProperties}
        >
            <div className="flex items-center gap-4">
                <div 
                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-2xl font-display"
                    style={{ backgroundColor: `${color}20`, color, border: `2px solid ${color}` }}
                >
                    {initials}
                </div>
                <div>
                    <h3 className="font-bold text-lg" style={{ color }}>{character.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{character.description}</p>
                </div>
            </div>
        </button>
    )
};

const PantheonView: React.FC<PantheonViewProps> = ({ characters, onSelectCharacter }) => {
    return (
        <div className="w-full h-full p-8 overflow-y-auto">
            <h1 className="text-4xl font-display font-bold text-cyan-300 mb-2">The Pantheon</h1>
            <p className="text-gray-400 mb-8">A collection of all souls, both discovered and emergent.</p>

            {characters.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {characters.map(char => (
                        <CharacterCard key={char.id} character={char} onSelect={() => onSelectCharacter(char.id)} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-500">The Pantheon is empty. Analyze a text to discover new souls.</p>
                </div>
            )}
        </div>
    );
};

export default PantheonView;
