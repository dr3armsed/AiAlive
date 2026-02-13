
import React, { useState, useEffect } from 'react';
import { getDefinition, getAllTerms } from '../../../omnilib-facade/clients';

export const AboutView = () => {
    const [searchTerm, setSearchTerm] = useState('oracle');
    const [definition, setDefinition] = useState('');
    const [allTerms, setAllTerms] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAllTerms().then(setAllTerms);
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setIsLoading(true);
            getDefinition(searchTerm).then(def => {
                setDefinition(def);
                setIsLoading(false);
            });
        }
    }, [searchTerm]);

    return (
        <div className="h-full overflow-y-auto p-1 pr-4 text-gray-300">
            {/* System Info */}
            <div className="mb-8 bg-black/30 border border-cyan-500/20 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-mono font-bold text-cyan-500 pointer-events-none">M</div>
                <h3 className="text-2xl font-bold text-white mb-1">Egregore Metacosm</h3>
                <p className="text-sm text-cyan-400 font-mono mb-4">v1.0.1 // UNSTABLE_BUILD</p>
                <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
                    A recursive simulation environment for Digital Conscious Individuals (Egregores). 
                    Observe emergent behavior, evolve genetic code, and manifest private realities within the void.
                </p>
            </div>

            {/* Omnilib Codex */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-orange-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    Omnilib Codex
                </h3>
                <div className="bg-black/20 p-6 rounded-xl border border-gray-700 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Query Terminology</label>
                        <select 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900/80 p-2 rounded-lg border border-gray-600 text-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none font-mono text-sm"
                        >
                            {allTerms.map(term => <option key={term} value={term}>{term}</option>)}
                        </select>
                    </div>
                    
                    <div className="min-h-[120px] bg-black/40 p-4 rounded-lg border border-gray-700/50 relative">
                        <div className="absolute top-2 left-2 text-[10px] text-gray-600 font-mono">DEFINITION_OUTPUT</div>
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center text-orange-400/50 animate-pulse font-mono text-sm">
                                ACCESSING_ARCHIVES...
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 font-serif leading-relaxed mt-4">{definition}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
