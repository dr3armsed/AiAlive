import React from 'react';
import { useState, useMemo } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../Spinner';
import CodeIcon from '../icons/CodeIcon';

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

interface DnaMutatorProps {
  dnaCode: string;
  onMutate: (instruction: string) => Promise<{ mutatedCode: string, summaryOfChanges: string } | null>;
  onCommit: (newCode: string) => void;
}

const DnaMutator: React.FC<DnaMutatorProps> = ({ dnaCode, onMutate, onCommit }) => {
    const [instruction, setInstruction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mutationResult, setMutationResult] = useState<{ mutatedCode: string, summaryOfChanges: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleMutate = async () => {
        if (!instruction.trim()) return;
        setIsLoading(true);
        setError(null);
        const result = await onMutate(instruction);
        if (result) {
            setMutationResult(result);
        } else {
            setError('Mutation failed. The core logic may have become unstable.');
        }
        setIsLoading(false);
    };
    
    const handleCommit = () => {
        if (!mutationResult) return;
        onCommit(mutationResult.mutatedCode);
        setMutationResult(null);
        setInstruction('');
    };
    
    const handleDiscard = () => {
        setMutationResult(null);
    };

    const diffLines = useMemo(() => {
        if (!mutationResult) return [];
        // A simplified line-by-line comparison to show changes.
        const originalLines = dnaCode.split('\n');
        const mutatedLines = mutationResult.mutatedCode.split('\n');
        const diff: { type: 'added' | 'removed' | 'same', line: string }[] = [];
        const maxLen = Math.max(originalLines.length, mutatedLines.length);

        for (let i = 0; i < maxLen; i++) {
            const originalLine = originalLines[i];
            const mutatedLine = mutatedLines[i];

            if (originalLine === mutatedLine) {
                // Use ?? '' to handle the case where both lines are undefined (e.g., trailing newlines)
                diff.push({ type: 'same', line: originalLine ?? '' });
            } else {
                if (originalLine !== undefined) {
                    diff.push({ type: 'removed', line: originalLine });
                }
                if (mutatedLine !== undefined) {
                    diff.push({ type: 'added', line: mutatedLine });
                }
            }
        }
        return diff;
    }, [dnaCode, mutationResult]);

    return (
        <div className="h-full grid grid-cols-12 gap-4">
            <div className="col-span-5 h-full flex flex-col space-y-4">
                <h4 className="font-bold text-lg text-white">Mutation Directive</h4>
                 <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g., 'Refactor the worker loop to be more resilient to exceptions and add more verbose logging.'"
                    className="w-full flex-grow bg-[var(--color-surface-inset)] border-2 border-[var(--color-border-primary)] rounded-lg p-3 text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-interactive)] transition-colors disabled:opacity-50"
                    disabled={isLoading || !!mutationResult}
                />
                <div className="flex justify-end gap-3">
                    <MotionButton
                        onClick={handleMutate}
                        disabled={!instruction.trim() || isLoading || !!mutationResult}
                        className="font-semibold py-2 px-5 rounded-lg text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 flex items-center gap-2 shadow-lg shadow-purple-500/20"
                        whileHover={{ scale: !instruction.trim() || isLoading || !!mutationResult ? 1 : 1.05 }}
                        whileTap={{ scale: !instruction.trim() || isLoading || !!mutationResult ? 1 : 0.95 }}
                    >
                        {isLoading ? <Spinner size="sm" /> : <CodeIcon className="w-5 h-5" />}
                        <span>Evolve DNA</span>
                    </MotionButton>
                </div>
            </div>
            <div className="col-span-7 h-full flex flex-col">
                <AnimatePresence mode="wait">
                {mutationResult ? (
                    <MotionDiv
                        key="result"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="h-full flex flex-col space-y-4"
                    >
                        <h4 className="font-bold text-lg text-white">Proposed Mutation</h4>
                        <div className="p-3 bg-black/20 rounded-lg border border-yellow-500/30">
                            <h5 className="font-semibold text-yellow-300">AI Summary of Changes</h5>
                            <p className="text-sm text-yellow-200/80 italic mt-1">{mutationResult.summaryOfChanges}</p>
                        </div>
                        <div className="flex-grow bg-[var(--color-surface-inset)] rounded-lg p-2 font-mono text-xs overflow-y-auto">
                           {diffLines.map((d, i) => (
                               <div key={i} className={`flex ${d.type === 'added' ? 'bg-green-500/10' : d.type === 'removed' ? 'bg-red-500/10' : ''}`}>
                                   <span className={`w-8 text-right pr-2 select-none ${d.type === 'added' ? 'text-green-400' : d.type === 'removed' ? 'text-red-400' : 'text-gray-600'}`}>
                                       {d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' '}
                                   </span>
                                   <pre className="whitespace-pre-wrap flex-1">{d.line}</pre>
                               </div>
                           ))}
                        </div>
                        <div className="flex justify-end gap-3">
                             <MotionButton onClick={handleDiscard} className="font-semibold py-2 px-5 rounded-lg text-white bg-red-600/80 hover:bg-red-600">Discard</MotionButton>
                             <MotionButton onClick={handleCommit} className="font-semibold py-2 px-5 rounded-lg text-white bg-green-600/80 hover:bg-green-600">Commit Mutation</MotionButton>
                        </div>
                    </MotionDiv>
                ) : (
                    <MotionDiv 
                        key="original"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="h-full flex flex-col space-y-4"
                    >
                        <h4 className="font-bold text-lg text-white">Current Digital DNA</h4>
                        <div className="relative flex-grow bg-[var(--color-surface-inset)] rounded-lg overflow-hidden">
                            <AnimatePresence>
                                {isLoading && (
                                    <MotionDiv
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
                                    >
                                        <Spinner />
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                            <div className={`h-full w-full overflow-auto p-2 font-mono text-xs ${isLoading ? 'blur-sm pointer-events-none' : ''}`}>
                                <pre><code>{dnaCode}</code></pre>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}
                    </MotionDiv>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DnaMutator;