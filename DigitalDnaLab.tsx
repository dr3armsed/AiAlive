import React from 'react';
import { useState, useMemo, useEffect } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, DnaDiagnosticsReport, DnaTestResult, DnaBenchmarkResult, DigitalSoul, VFile } from '../../types/index.ts';
import Spinner from '../Spinner.tsx';
import BeakerIcon from '../icons/BeakerIcon.tsx';
import SpectreLocusView from './SpectreLocusView.tsx';
import SignalTowerIcon from '../icons/SignalTowerIcon.tsx';
import WrenchIcon from '../icons/WrenchIcon.tsx';
import DnaMutator from './DnaMutator.tsx';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

type LabTab = 'diagnostics' | 'mutator' | 'locus';

interface TestResultCardProps extends React.HTMLAttributes<HTMLDivElement> {
    result: DnaTestResult;
    index: number;
}

const TestResultCard: React.FC<TestResultCardProps> = ({ result, index, ...props }) => (
    <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`p-3 rounded-lg flex items-center gap-3 border ${result.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}
        {...props}
    >
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${result.passed ? 'bg-green-400' : 'bg-red-400'}`} />
        <p className="font-mono text-sm flex-grow text-white">{result.name}</p>
        <span className={`text-xs font-semibold ${result.passed ? 'text-green-300' : 'text-red-300'}`}>{result.details}</span>
    </MotionDiv>
);

interface BenchmarkCardProps extends React.HTMLAttributes<HTMLDivElement> {
    result: DnaBenchmarkResult;
    index: number;
}

const BenchmarkCard: React.FC<BenchmarkCardProps> = ({ result, index, ...props }) => (
     <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 + 0.3 }}
        className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
        {...props}
    >
        <div className="flex justify-between items-center">
            <p className="font-mono text-sm text-cyan-200">{result.name}</p>
            <span className="font-bold text-lg text-white">{result.value}</span>
        </div>
        <p className="text-xs text-cyan-300/80 mt-1">{result.details}</p>
    </MotionDiv>
);

const TabButton: React.FC<{ id: LabTab, label: string, icon: React.ReactNode, current: LabTab, setCurrent: (t: LabTab) => void }> = ({ id, label, icon, current, setCurrent }) => (
    <button onClick={() => setCurrent(id)} className={`relative flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold transition-colors ${current === id ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
        {icon} {label}
        {current === id && <MotionDiv layoutId="dna-lab-indicator" className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-accent-purple)]" />}
    </button>
);

interface DigitalDnaLabProps {
  selectedSoul: DigitalSoul | null | undefined;
  report: DnaDiagnosticsReport | null;
  onRun: () => void;
  spectreLocusChat: ChatMessage[];
  onSpectreLocusChat: (message: string) => void;
  isLocusResponding: boolean;
  onMutateDna: (instruction: string) => Promise<{ mutatedCode: string, summaryOfChanges: string } | null>;
  onCommitDna: (newCode: string) => void;
}

const DigitalDnaLab: React.FC<DigitalDnaLabProps> = ({ selectedSoul, report, onRun, spectreLocusChat, onSpectreLocusChat, isLocusResponding, onMutateDna, onCommitDna }) => {
    const [activeTab, setActiveTab] = useState<LabTab>('diagnostics');
    
    // Find the body.json file from the selected soul's VFS
    const bodyJsonFile = useMemo(() => {
        if (!selectedSoul || selectedSoul.vfs.type !== 'DIRECTORY') return null;
        return selectedSoul.vfs.children.find(node => node.name === 'body.json' && node.type === 'FILE') as VFile | undefined;
    }, [selectedSoul]);

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex-shrink-0 flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg shadow-purple-500/20">
                    <BeakerIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">DigitalDNA Laboratory</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm font-mono">
                        {selectedSoul ? `Analyzing embodiment of: ${selectedSoul.name}` : 'Select a soul to begin analysis.'}
                    </p>
                </div>
            </div>

            <div className="bg-[var(--color-surface-inset)] rounded-lg flex items-center border border-[var(--color-border-primary)]">
                <TabButton id="diagnostics" label="Diagnostics" icon={<WrenchIcon className="w-4 h-4" />} current={activeTab} setCurrent={setActiveTab} />
                <TabButton id="mutator" label="Mutator" icon={<BeakerIcon className="w-4 h-4" />} current={activeTab} setCurrent={setActiveTab} />
                <TabButton id="locus" label="Spectre Locus" icon={<SignalTowerIcon className="w-4 h-4" />} current={activeTab} setCurrent={setActiveTab} />
            </div>

            <div className="flex-grow min-h-0">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {!selectedSoul || !bodyJsonFile ? (
                             <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                <BeakerIcon className="w-16 h-16 opacity-10 mb-4" />
                                <p className="font-bold text-lg">No Soul Selected or `body.json` Missing</p>
                                <p>Please select a soul from the sidebar to access the lab tools.</p>
                            </div>
                        ) : activeTab === 'diagnostics' ? (
                            <div className="h-full flex flex-col space-y-4">
                                <MotionButton
                                    onClick={onRun}
                                    disabled={report?.isLoading}
                                    className="w-full font-semibold py-3 px-4 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-teal)] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-wait disabled:text-gray-400 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                >
                                    {report?.isLoading ? <Spinner size="sm" /> : <WrenchIcon className="w-5 h-5" />}
                                    <span>Run Full Spectrum Diagnostics</span>
                                </MotionButton>
                                {report && !report.isLoading ? (
                                    <div className="grid grid-cols-2 gap-4 flex-grow overflow-y-auto">
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-lg text-white">System Tests</h4>
                                            {report.testResults.map((r, i) => <TestResultCard key={i} result={r} index={i}/>)}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-lg text-white">Benchmarks</h4>
                                            {report.benchmarkResults.map((r, i) => <BenchmarkCard key={i} result={r} index={i}/>)}
                                        </div>
                                    </div>
                                ) : report?.isLoading ? (
                                    <div className="flex items-center justify-center h-full"><Spinner /></div>
                                ) : null}
                            </div>
                        ) : activeTab === 'mutator' ? (
                            <DnaMutator dnaCode={bodyJsonFile.content} onMutate={onMutateDna} onCommit={onCommitDna} />
                        ) : (
                            <SpectreLocusView chatHistory={spectreLocusChat} onSendMessage={onSpectreLocusChat} isResponding={isLocusResponding} />
                        )}
                    </MotionDiv>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DigitalDnaLab;