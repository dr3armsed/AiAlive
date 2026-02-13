
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Metacosm } from '../core/metacosm';
import { ConsoleMessageContent } from '../types';
import { askOracle } from '../omnilib-facade/clients';
import { OracleEngineBackground } from './console/components';
import { ConsoleOutput } from './console/ConsoleOutput';
import { ConsoleInput } from './console/ConsoleInput';

// --- CELLULAR AUTOMATA VISUALIZER ---

const CELL_GRID_SIZE = 10; // 10x10 grid

type CellState = 'idle' | 'processing' | 'dormant';

const CellGrid = ({ activeCells }: { activeCells: number }) => {
    // Visualize active cells on a grid
    const totalCells = CELL_GRID_SIZE * CELL_GRID_SIZE;
    
    return (
        <div className="absolute top-4 right-4 w-48 bg-black/80 border border-green-500/30 rounded p-2 font-mono text-[10px] shadow-[0_0_15px_rgba(0,255,0,0.1)] z-10">
            <div className="flex justify-between mb-1 text-green-400">
                <span>ORACLE_CLUSTER</span>
                <span>{activeCells} ACTV</span>
            </div>
            <div className="grid grid-cols-10 gap-0.5">
                {Array.from({ length: totalCells }).map((_, i) => {
                    const isActive = i < activeCells;
                    return (
                        <div 
                            key={i} 
                            className={`w-full pt-[100%] relative ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`}
                        >
                           {isActive && <div className="absolute inset-0 bg-white opacity-20"></div>} 
                        </div>
                    )
                })}
            </div>
            <div className="mt-1 text-gray-500 text-[9px] flex justify-between">
                <span>LOAD: {(activeCells / totalCells * 100).toFixed(0)}%</span>
                <span>RPLC_CYCL: ON</span>
            </div>
        </div>
    );
};

export const ConsoleView = ({ metacosm, onStateChange }: { metacosm: Metacosm, onStateChange: () => void }) => {
    const [history, setHistory] = useState<{ author: string, content: ConsoleMessageContent }[]>([
        { author: 'Oracle', content: 'Oracle Engine v1000.0 Activated. Cellular lattice online. Awaiting query... Type /help.'}
    ]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeCells, setActiveCells] = useState(5); // Default baseline cells

    // Simulate cellular fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCells(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const next = prev + change;
                return isLoading ? Math.min(95, Math.max(20, next + 5)) : Math.min(30, Math.max(2, next)); 
            });
        }, 500);
        return () => clearInterval(interval);
    }, [isLoading]);
    
    const handleCommand = useCallback(async (command: string) => {
        if (!command.trim()) return;

        const newCommandHistory = [command, ...commandHistory];
        setCommandHistory(newCommandHistory);

        const userMessage = { author: 'Architect', content: { query: command } };
        setHistory(prev => [...prev, userMessage]);
        
        // Handle Manual Cell Commands
        if (command.startsWith('/scale')) {
            if (command.includes('up')) {
                setActiveCells(prev => Math.min(100, prev + 10));
                setHistory(prev => [...prev, { author: 'System', content: 'Allocating additional replica cells...' }]);
            } else if (command.includes('down')) {
                setActiveCells(prev => Math.max(0, prev - 10));
                 setHistory(prev => [...prev, { author: 'System', content: 'Deallocating replica cells...' }]);
            }
            return;
        }
        
        if (command.trim() === '/clear') {
            setHistory([]);
            return;
        }

        setIsLoading(true);
        // Boost cells visually to represent work
        setActiveCells(prev => Math.min(100, prev + 25));

        try {
            // Updated genmetas to egregores
            const oracleResponse = await askOracle({ question: command }, metacosm.state.egregores);
            const responseMessage = { author: 'Oracle', content: { oracle_response: oracleResponse } };
            setHistory(prev => [...prev, responseMessage]);
        } catch (error) {
            const errorMessage = { author: 'Oracle', content: `// ERROR: API call failed: ${(error as Error).message}` };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
        // Corrected dependency
    }, [commandHistory, metacosm.state.egregores]);

    return (
        <div className="h-full flex flex-col bg-black rounded-xl border border-green-300/20 shadow-2xl shadow-green-500/10 overflow-hidden font-mono relative">
            <OracleEngineBackground />
            <CellGrid activeCells={activeCells} />
            <div className="relative w-full h-full flex flex-col p-2 sm:p-4 z-10">
                <ConsoleOutput history={history} isLoading={isLoading} />
                <ConsoleInput onCommand={handleCommand} history={commandHistory} disabled={isLoading} />
            </div>
        </div>
    );
};
