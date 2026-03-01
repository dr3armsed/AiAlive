import React from 'react';
import type { CreativeWork } from '../types';
import { GiScrollQuill } from 'react-icons/gi';

interface CreatedWorksViewProps {
    works: CreativeWork[];
    onViewWork: (id: string) => void;
    allSouls: { id: string, name: string }[];
}


const WorkListItem: React.FC<{ work: CreativeWork, onView: () => void, authorNames: string }> = ({ work, onView, authorNames }) => {
    return (
         <button 
            onClick={onView}
            className="w-full text-left p-4 bg-black/20 hover:bg-black/40 rounded-lg transition-colors border border-gray-700 hover:border-cyan-400"
        >
            <p className="font-bold text-gray-200 font-display text-lg">{work.title}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="capitalize">{work.type}</span>
                <span className="text-cyan-300/80">By: {authorNames}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2 italic line-clamp-2">"{work.content}"</p>
        </button>
    )
}


const CreatedWorksView: React.FC<CreatedWorksViewProps> = ({ works, onViewWork, allSouls }) => {
    
    const getAuthorNames = (authorIds: string[]) => {
        return authorIds.map(id => {
            return allSouls.find(s => s.id === id)?.name || 'An Unknown Soul';
        }).join(', ');
    };

    const sortedWorks = [...works].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="w-full h-full p-8 overflow-y-auto">
            <h1 className="text-4xl font-display font-bold text-cyan-300 mb-2 flex items-center gap-4"><GiScrollQuill/> Created Works</h1>
            <p className="text-gray-400 mb-8">A complete collection of every creative work generated within the Sanctum.</p>

            {sortedWorks.length > 0 ? (
                <div className="space-y-4">
                    {sortedWorks.map(work => (
                        <WorkListItem 
                            key={work.id} 
                            work={work} 
                            onView={() => onViewWork(work.id)}
                            authorNames={getAuthorNames(work.authorIds)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-500">No creative works have been started yet.</p>
                </div>
            )}
        </div>
    );
};

export default CreatedWorksView;
