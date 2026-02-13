
import React from 'react';
import { MemoryRecord } from '../../../types';
import { MemoryRecordCard } from './MemoryRecordCard';

type MemoryQueryProps = {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleSearch: () => void;
    isLoading: boolean;
    results: MemoryRecord[];
};

export const MemoryQuery: React.FC<MemoryQueryProps> = ({ searchTerm, setSearchTerm, handleSearch, isLoading, results }) => (
    <div className="bg-black/30 p-6 rounded-xl border border-purple-500/10">
        <div className="flex gap-3 mb-6">
             <div className="flex-grow relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 font-mono text-sm">&gt;</span>
                 <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    placeholder="query_engrams..."
                    className="w-full bg-black/50 p-3 pl-8 rounded-lg border border-purple-500/30 text-purple-100 font-mono text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-purple-900/50"
                />
             </div>
            <button 
                onClick={handleSearch} 
                disabled={isLoading} 
                className="px-6 py-2 font-bold text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:bg-gray-800 disabled:text-gray-500"
            >
                {isLoading ? 'SCANNING...' : 'EXECUTE'}
            </button>
        </div>
        
         <div className="space-y-3">
            {isLoading && <p className="text-purple-400 animate-pulse font-mono text-xs text-center">Scanning cortex...</p>}
            
            {!isLoading && results.length > 0 && (
                <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-2">
                    <span>Result ID</span>
                    <span>Confidence</span>
                </div>
            )}

            {results.map(rec => <MemoryRecordCard key={rec.id} rec={rec} />)}
            
            {!isLoading && results.length === 0 && searchTerm && (
                <p className="text-gray-600 text-sm text-center italic py-4">No traces found.</p>
            )}
        </div>
    </div>
);
