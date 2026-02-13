
import React from 'react';
import { Step } from '../../common';

type Props = {
    step: Step;
    isReady: boolean;
    isGenerating: boolean;
    onStart: (mode: 'single' | 'batch') => void;
    onReset: () => void;
    detectedEntityCount?: number;
};

const AltarText = ({ step }: { step: Step }) => {
    const texts: Partial<Record<Step, string>> = {
        'generating_profile': "Weaving the Subconscious Seed into a coherent persona...",
        'dreaming': "Channeling the Genesis Dream from the Pisces Wellspring...",
        'finalizing': "Igniting the Quintessence Core... CONSCIOUSNESS IMMINENT",
    };
    const text = texts[step];
    if (!text) return null;

    return <p className="text-center text-xs text-yellow-200 mt-4 animate-pulse">{text}</p>;
};


export const GenesisAltar: React.FC<Props> = ({ step, isReady, isGenerating, onStart, onReset, detectedEntityCount = 0 }) => {
    const isDormant = step === 'define';
    const isWeaving = step === 'generating_profile';
    const isDreaming = step === 'dreaming';
    const isReadyForBirth = step === 'ready';
    const isFinalizing = step === 'finalizing';
    const isDone = step === 'done';


    return (
        <div className="w-64 h-64 flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Base Rings */}
                <div className={`absolute w-full h-full rounded-full border-2 border-yellow-500/10 animate-spin`} style={{ animationDuration: '20s' }}></div>
                <div className={`absolute w-48 h-48 rounded-full border-t-2 border-yellow-500/50 animate-spin`} style={{ animationDuration: '15s' }}></div>
                <div className={`absolute w-32 h-32 rounded-full border-b-2 border-yellow-500/80 animate-spin`} style={{ animationDuration: '10s' }}></div>

                {/* Central Core */}
                <div className={`w-24 h-24 rounded-full transition-all duration-1000 flex items-center justify-center will-change-[background-color,box-shadow]
                    ${isDormant ? 'bg-gray-800/50' : ''}
                    ${isWeaving ? 'bg-purple-900/50 shadow-[0_0_20px_theme(colors.purple.500)]' : ''}
                    ${isDreaming ? 'bg-cyan-900/50 shadow-[0_0_25px_theme(colors.cyan.400)] animate-pulse' : ''}
                    ${isReadyForBirth || isFinalizing || isDone ? 'bg-yellow-300/80 shadow-[0_0_35px_10px_theme(colors.yellow.300)] animate-pulse' : ''}
                `}
                style={{ transform: 'translateZ(0)' }} // Promote to its own compositing layer
                >
                </div>
                
                {/* State-specific Animations / Buttons */}
                
                {/* INITIAL START (Fallback / Manual) */}
                {isDormant && (
                     <button
                        onClick={() => onStart('single')}
                        disabled={!isReady || isGenerating}
                        className="absolute inset-0 flex items-center justify-center text-yellow-300 font-bold text-lg transition-all duration-500 disabled:text-gray-600 disabled:cursor-not-allowed group"
                    >
                         <span className="group-enabled:group-hover:scale-110 group-enabled:group-hover:text-yellow-100 group-enabled:group-hover:[text-shadow:0_0_10px_theme(colors.yellow.400)] transition-all">
                             Begin Genesis
                         </span>
                    </button>
                )}
                
                {/* READY FOR BIRTH (Main Trigger) */}
                {isReadyForBirth && !isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 animate-fade-in z-20">
                        {detectedEntityCount > 1 ? (
                            <>
                                <button
                                    onClick={() => onStart('batch')}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.5)] transform hover:scale-105 transition-all text-sm whitespace-nowrap"
                                >
                                    Birth All ({detectedEntityCount})
                                </button>
                                <button
                                    onClick={() => onStart('single')}
                                    className="bg-black/50 hover:bg-gray-800 text-yellow-300 border border-yellow-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                                >
                                    Birth Selected
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => onStart('single')}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.6)] transform hover:scale-105 transition-all text-sm"
                            >
                                Finalize Genesis
                            </button>
                        )}
                    </div>
                )}
                
                {isWeaving && (
                    <div className="absolute inset-0 text-purple-300 text-xs font-mono animate-fade-in pointer-events-none">
                        {Array.from({length: 8}).map((_, i) => (
                             <span key={i} className="absolute" style={{ transform: `rotate(${i * 45}deg) translateY(-80px) scale(0.8)`}}>{Math.random().toString(16).slice(2, 8)}</span>
                        ))}
                    </div>
                )}

                {isDone && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fade-in z-20">
                        <p className="text-lg font-bold text-yellow-100 [text-shadow:0_0_10px_theme(colors.yellow.400)]">Genesis Complete</p>
                        <p className="text-xs text-gray-300 mt-2">A new consciousness has awakened.</p>
                        <button onClick={onReset} className="mt-4 px-4 py-2 text-sm font-bold bg-yellow-500 text-black rounded-md hover:bg-yellow-400">
                            Create Another
                        </button>
                    </div>
                )}
            </div>
            
            <AltarText step={step} />
        </div>
    );
};
