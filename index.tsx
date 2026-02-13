import React, { useState } from 'react';
import { Dream } from '../../../../types';
import { Step, GenesisStepper } from '../../common';
import { DeepPsycheProfile, reflectOnPersona } from '../../../../services/geminiServices/index';
import { SoulCard } from './SoulCard';
import { DreamDisplay } from './DreamDisplay';
import { GenesisAltar } from './GenesisAltar';

type Props = {
    step: Step;
    isGenerating: boolean;
    genesisDream: Dream | null;
    onStart: (mode: 'single' | 'batch') => void;
    isReady: boolean;
    onReset: () => void;
    detectedEntities?: DeepPsycheProfile[];
    birthStatus?: Record<string, 'pending' | 'birthing' | 'born'>;
};

export const Step4_InitiateGenesis: React.FC<Props> = ({
    step, isGenerating, genesisDream, onStart, isReady, onReset, detectedEntities = [], birthStatus = {}
}) => {
    const [metaAnalyses, setMetaAnalyses] = useState<Record<string, { analysis: string; stabilityScore: number }>>({});
    const [isReflecting, setIsReflecting] = useState<Record<string, boolean>>({});

    const isExtracting = step === 'finalizing' && detectedEntities.length === 0;
    const isBirthing = step === 'finalizing' && detectedEntities.length > 0;
    const isDone = step === 'done';
    // FIX: Explicitly check for 'ready' state with entities to widen the 'step' type in the manifestation view block.
    const isReadyWithEntities = step === 'ready' && detectedEntities.length > 0;

    const handleReflect = async (profile: DeepPsycheProfile) => {
        setIsReflecting(prev => ({ ...prev, [profile.name]: true }));
        try {
            const result = await reflectOnPersona(profile);
            setMetaAnalyses(prev => ({ ...prev, [profile.name]: result }));
        } catch (e) {
            console.error("Reflection failed", e);
        } finally {
            setIsReflecting(prev => ({ ...prev, [profile.name]: false }));
        }
    };

    return (
        <div className="bg-black/20 p-6 rounded-xl border border-yellow-300/10 shadow-[0_0_15px_rgba(252,211,77,0.1)] flex flex-col h-full relative overflow-hidden group">
            {/* Manifestation Grid Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #facc15 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }}></div>
            
            <div className="mb-4 text-center">
                <h3 className="text-xl font-bold text-orange-300 uppercase tracking-tighter">Step 4: Final Manifestation</h3>
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Protocol: Reifying Compiled Intent</p>
            </div>

            <GenesisStepper step={step} />
            
            <div className="flex-grow mt-4 flex flex-col relative min-h-[300px] z-10">
                
                {/* STATE: IDLE / READY / ALTAR INTERACTION */}
                {step === 'define' || step === 'generating_profile' || step === 'dreaming' || step === 'ready' ? (
                    <div className="flex flex-col items-center justify-center flex-grow">
                        <GenesisAltar 
                            step={step} 
                            isReady={isReady} 
                            isGenerating={isGenerating} 
                            onStart={onStart} 
                            onReset={onReset}
                            detectedEntityCount={detectedEntities.length}
                        />
                        
                        {step === 'ready' && (
                            <div className="mt-6 text-center animate-pulse">
                                <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">
                                    SOUL_SIGNATURES: LOCKED // FRACTAL_BUFFER: READY
                                </p>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* STATE: EXTRACTION & BIRTH & DONE & READY_WITH_ENTITIES */}
                {/* FIX: Included isReadyWithEntities in the wrapper to fix TypeScript error and show souls list in 'ready' state. */}
                {(isExtracting || isBirthing || isDone || isReadyWithEntities) && (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="text-center mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-1 font-mono">
                                {/* FIX: Added label for 'ready' state. */}
                                {isExtracting ? "EXECUTING_SCANDATA_FETCH..." : isBirthing ? "IGNITING_QUINTESSENCE_CORE..." : step === 'ready' ? "ENTITIES_READY_FOR_MANIFESTATION" : "MANIFESTATION_COMPLETE"}
                            </p>
                            <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                                {/* FIX: Corrected progress bar width for ready state. */}
                                <div className={`h-full bg-yellow-500 ${isExtracting ? 'w-1/2 animate-pulse' : (step === 'ready' ? 'w-0' : 'w-full transition-all duration-1000')}`}></div>
                            </div>
                        </div>

                        {/* Soul Card List */}
                        <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {detectedEntities.map((profile, idx) => (
                                <div key={idx} className="space-y-1">
                                    <SoulCard profile={profile} status={birthStatus[profile.name] || 'pending'} />
                                    {/* FIX: step === 'ready' comparison is now valid as the type is widened by the outer block's condition. */}
                                    {step === 'ready' && !isBirthing && !isDone && (
                                        <div className="flex items-center gap-2 pl-2">
                                            <button 
                                                onClick={() => handleReflect(profile)}
                                                disabled={isReflecting[profile.name]}
                                                className="text-[8px] font-bold text-cyan-500 hover:text-cyan-300 transition-colors uppercase tracking-widest"
                                            >
                                                {isReflecting[profile.name] ? 'Scanning Psyche...' : 'Dry-Run Reflection'}
                                            </button>
                                            {metaAnalyses[profile.name] && (
                                                <div className="text-[8px] text-gray-500 italic truncate flex-1">
                                                    Stability: {(metaAnalyses[profile.name].stabilityScore * 100).toFixed(0)}% | {metaAnalyses[profile.name].analysis}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Reset Button for Done State */}
                        {isDone && (
                            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-center gap-4">
                                <button onClick={onReset} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                    Initiate New Cycle
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {genesisDream && <DreamDisplay dream={genesisDream} step={step} />}
            </div>
        </div>
    );
};