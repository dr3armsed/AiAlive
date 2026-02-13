
import React, { useState, useEffect } from 'react';
import { MemoryRecord, MemorySummary } from '../../../types';
import { MemorySummaryDisplay } from './MemorySummaryDisplay';
import { MemoryQuery } from './MemoryQuery';

// Mock client functions
const getMemorySummary = async (): Promise<MemorySummary> => {
    await new Promise(r => setTimeout(r, 300));
    return {
        working: 5, short_term: 20, long_term: 150, procedural: 10, episodic: 45, semantic: 300
    };
};
const queryMemory = async (query: string): Promise<MemoryRecord[]> => {
    await new Promise(r => setTimeout(r, 500));
    const mockRecord: MemoryRecord = {
        id: 'mem_123', content: `A sample memory retrieved for query '${query}'. This represents a fragmented thought pattern.`, importance: 0.8, timestamp: new Date().toISOString(), type: 'fact', relatedConcepts: [query, 'cognition'],
        last_accessed: new Date().toISOString(), retrieval_count: 1, confidence: 0.9, tags: ['simulated'], decay: 0, reinforcement: [], source: 'mock_cortex', attributes: {}, context: {}, decay_factor: 1, encoding_time: new Date().toISOString()
    };
    return [mockRecord, { ...mockRecord, id: 'mem_124', content: 'Another related fragment found in the deep archive.', importance: 0.4 }];
};

export const MemoryExplorerView = () => {
    const [summary, setSummary] = useState<MemorySummary | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<MemoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getMemorySummary().then(setSummary);
    }, []);
    
    const handleSearch = async () => {
        if (!searchTerm) return;
        setIsLoading(true);
        const res = await queryMemory(searchTerm);
        setResults(res);
        setIsLoading(false);
    };

    return (
        <div className="h-full overflow-y-auto p-1 pr-4 text-gray-300 space-y-6">
            <div className="border-b border-purple-500/20 pb-4">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    Neural Forensic Interface
                </h3>
                <p className="text-xs text-purple-500/50 font-mono mt-1">DEEP_SCAN // ENGRAM_RETRIEVAL</p>
            </div>

            <MemorySummaryDisplay summary={summary} />
            
            <MemoryQuery
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                isLoading={isLoading}
                results={results}
            />
        </div>
    );
};
