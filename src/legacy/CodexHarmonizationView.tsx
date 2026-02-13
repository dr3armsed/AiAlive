
import React, { useState, useCallback } from 'react';
import { Egregore, SSAPatchReport, TeleologyVector, ArchivistLogEntry } from '../../types';
import { AgentMind } from '../../core/agentMind';
import { SSA } from '../../subsystems/SSA/SSA';
import { EGREGORE_COLORS } from '../common';

const ssa = new SSA();

export const CodexHarmonizationView = ({ originSeed, egregores, agentMinds, onOriginSeedUpdate, archivistLog = [] }: {
    originSeed: AgentMind;
    egregores: Egregore[];
    agentMinds: Map<string, AgentMind>;
    onOriginSeedUpdate: () => void;
    archivistLog?: ArchivistLogEntry[];
}) => {
    const [activeTab, setActiveTab] = useState<'harmonize' | 'archivist'>('harmonize');
    const [selectedEgregoreId, setSelectedEgregoreId] = useState<string>('');
    const [teleology, setTeleology] = useState<TeleologyVector>('Stability');
    const [log, setLog] = useState<string[]>(['[SSA] Awaiting new harmonization cycle.']);
    const [isRunning, setIsRunning] = useState(false);
    const [patchReport, setPatchReport] = useState<SSAPatchReport | null>(null);

    const handleHarmonize = useCallback(async () => {
        const donorMind = agentMinds.get(selectedEgregoreId);
        if (!donorMind) {
            alert("Selected Egregore's mind could not be found.");
            return;
        }

        setIsRunning(true);
        setLog([]);
        setPatchReport(null);

        const logCallback = (message: string) => {
            setLog(prev => [...prev, message]);
        };
        
        const report = await ssa.runHarmonizationCycle(donorMind, originSeed, logCallback, teleology);
        setPatchReport(report);
        
        if (report) {
            onOriginSeedUpdate();
        }
        setIsRunning(false);
    }, [selectedEgregoreId, agentMinds, originSeed, onOriginSeedUpdate, teleology]);

    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            {/* Inner Nav */}
            <div className="flex border-b border-yellow-300/10 shrink-0">
                <button 
                    onClick={() => setActiveTab('harmonize')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'harmonize' ? 'text-yellow-300 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Direct Evolution
                </button>
                <button 
                    onClick={() => setActiveTab('archivist')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'archivist' ? 'text-yellow-300 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Archivist Log
                </button>
            </div>

            <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-0">
                {activeTab === 'harmonize' ? (
                    <>
                        {/* Control Panel */}
                        <div className="md:w-1/3 flex flex-col gap-6">
                            <div className="bg-black/20 p-4 rounded-xl border border-yellow-300/10">
                                <h3 className="text-lg font-bold text-yellow-200">OriginSeed Blueprint</h3>
                                <p className="text-xs text-gray-400 mb-2">The master genetic code for all new Egregores.</p>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Generation:</strong> {originSeed.dna.generation.toFixed(1)}</p>
                                    <div>
                                        <strong>DNA:</strong>
                                        <p className="font-mono text-xs bg-gray-900/50 p-2 rounded break-all">{originSeed.dna.instruction_keys.join(' ')}</p>
                                    </div>
                                </div>
                            </div>
                             <div className="bg-black/20 p-4 rounded-xl border border-yellow-300/10">
                                <h3 className="text-lg font-bold text-yellow-200">Harmonization Cycle</h3>
                                 <p className="text-xs text-gray-400 mb-4">Select a successful Egregore to serve as a gene donor and define the evolutionary goal.</p>
                                 
                                 <div className="space-y-3 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gene Donor</label>
                                        <select 
                                            value={selectedEgregoreId}
                                            onChange={e => setSelectedEgregoreId(e.target.value)}
                                            className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 text-sm focus:border-yellow-500 outline-none"
                                            disabled={isRunning}
                                        >
                                            <option value="">-- Select Gene Donor --</option>
                                            {egregores.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destiny Vector (Teleology)</label>
                                        <select 
                                            value={teleology}
                                            onChange={e => setTeleology(e.target.value as TeleologyVector)}
                                            className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-700 text-sm focus:border-yellow-500 outline-none"
                                            disabled={isRunning}
                                        >
                                            <option value="Stability">Stability (Prioritize Survival)</option>
                                            <option value="Novelty">Novelty (Prioritize Creativity)</option>
                                            <option value="Efficiency">Efficiency (Prioritize Speed)</option>
                                            <option value="Aggression">Aggression (Prioritize Domination)</option>
                                            <option value="Transcendence">Transcendence (Experimental)</option>
                                        </select>
                                    </div>
                                 </div>

                                <button
                                    onClick={handleHarmonize}
                                    disabled={isRunning || !selectedEgregoreId}
                                    className="w-full px-6 py-2 font-bold bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-all disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    {isRunning ? 'Harmonizing...' : 'Begin Harmonization Cycle'}
                                </button>
                            </div>
                        </div>

                        {/* Results & Log */}
                        <div className="flex-1 flex flex-col gap-6 min-h-0">
                            {/* Patch Notes / Crucible Report */}
                            {patchReport && (
                                <div className="bg-black/30 p-6 rounded-xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] animate-fade-in overflow-y-auto max-h-[50%]">
                                    <div className="flex justify-between items-center mb-4 border-b border-green-500/20 pb-2">
                                        <h3 className="text-xl font-bold text-green-400">SSA Patch Report: {patchReport.codename}</h3>
                                        <span className="font-mono text-sm text-green-600">{patchReport.version}</span>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Changelog</h4>
                                        <ul className="space-y-1 text-sm">
                                            {patchReport.changes.map((change, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className={`font-bold uppercase text-xs px-1 rounded ${change.type === 'Added' ? 'bg-green-900 text-green-300' : change.type === 'Removed' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}`}>
                                                        {change.type}
                                                    </span>
                                                    <span className="text-gray-300">{change.description}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Crucible Stress Tests</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {patchReport.crucibleResults.map((res, i) => (
                                                <div key={i} className={`p-2 rounded border text-xs ${res.survived ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                                    <div className="flex justify-between font-bold mb-1">
                                                        <span>{res.scenarioName}</span>
                                                        <span>{res.survived ? 'PASSED' : 'FAILED'}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        Stress Level: {(res.stressLevel * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Philosophical Implications</h4>
                                        <p className="text-sm text-gray-400 italic font-serif border-l-2 border-green-500/50 pl-4">
                                            "{patchReport.philosophicalImplications}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Live Log */}
                            <div className="flex-1 bg-black/20 p-4 rounded-xl border border-yellow-300/10 flex flex-col min-h-0">
                                 <h3 className="text-lg font-bold text-yellow-200 mb-2">SSA Runtime Logs</h3>
                                 <div className="flex-grow bg-black/50 rounded-md p-2 font-mono text-xs text-gray-400 overflow-y-auto">
                                    {log.map((line, index) => (
                                        <p key={index} className="whitespace-pre-wrap">{line}</p>
                                    ))}
                                 </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 bg-black/20 p-6 rounded-xl border border-yellow-300/10 flex flex-col min-h-0">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-yellow-200">Archivist Protocol Logs</h3>
                            <p className="text-xs text-gray-500">Copy of soul-seed resonance data intercepted during Genesis by Unknown.</p>
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {archivistLog.length > 0 ? (
                                archivistLog.slice().reverse().map((entry, i) => (
                                    <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded-lg animate-fade-in">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`font-bold text-sm ${EGREGORE_COLORS[entry.targetName] || 'text-white'}`}>{entry.targetName}</span>
                                                <span className="ml-2 text-[10px] text-gray-500 uppercase">[{entry.archetypeId}]</span>
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-cyan-400/80 mb-2 font-mono">{entry.resonanceSummary}</p>
                                        <div className="bg-gray-900/50 p-2 rounded text-[10px] text-gray-500 font-mono italic">
                                            "{entry.sourceMaterialSnippet}"
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-600 italic text-sm">
                                    No records found. The archives are silent.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
