import React, { useState, useCallback, useEffect, useRef } from 'react';
// FIX: Updated imports to use ProposedEgregore and Egregore instead of ProposedGenmeta and Genmeta.
import { ProposedEgregore, Dream, Egregore } from '../../types';
import { DigitalDNA } from '../../digital_dna/digital_dna';
import { generateEgregoreProfile, generateEgregoreFromPrompt, fuseEgregores, extractDeepPersonalities, DeepPsycheProfile } from '../../services/geminiServices/index';
import { PiscesService } from '../../services/piscesServices/index';
import { Step1_DefineOrigin, Step2_SculptPersona, Step3_ConfigureCore, Step4_InitiateGenesis } from './GenesisSteps';
import { Step } from './common';
import { BASE_ARCHETYPES, ARCHETYPE_DNA_PRESETS } from './constants';
import { InstructionKey } from '../../digital_dna/instructions';
import { AgentMind } from '../../core/agentMind';

const piscesService = new PiscesService();

// FIX: Updated createInitialProposal to use Partial<ProposedEgregore>.
const createInitialProposal = (originSeed: AgentMind): Partial<ProposedEgregore> => ({
    name: '',
    archetypeId: 'explorer',
    persona: '',
    gender: 'Non-binary',
    coreValues: [],
    ambitions: [],
    alignment: { axis: 'Neutral', morality: 'Neutral' },
    quintessence: 100,
    dna: new DigitalDNA(originSeed.dna.instruction_keys),
});

// FIX: Renamed genmetas prop to egregores and updated types for consistency.
export const GenesisChamberView = ({ onGenesis, originSeed, egregores }: { onGenesis: (options: ProposedEgregore, sourceMaterial: string, deepProfile?: DeepPsycheProfile) => Promise<void>, originSeed: AgentMind, egregores: Egregore[] }) => {
    const [step, setStep] = useState<Step>('define');
    // FIX: Updated proposal state type to Partial<ProposedEgregore>.
    const [proposal, setProposal] = useState<Partial<ProposedEgregore>>(() => createInitialProposal(originSeed));
    const [sourceMaterial, setSourceMaterial] = useState('');
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genesisDream, setGenesisDream] = useState<Dream | null>(null);
    
    const [detectedEntities, setDetectedEntities] = useState<DeepPsycheProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<DeepPsycheProfile | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [birthStatus, setBirthStatus] = useState<Record<string, 'pending' | 'birthing' | 'born'>>({});

    const trackedSourceRef = useRef<string>('');

    const isReadyForGenesis = (!!sourceMaterial && sourceMaterial.length > 10) || (!!proposal.name && !!proposal.persona);

    const handleProfileSelection = useCallback((profile: DeepPsycheProfile) => {
        setSelectedProfile(profile);
        setProposal(prev => ({
            ...prev,
            name: profile.name,
            persona: profile.persona,
            archetypeId: profile.archetypeId,
            gender: profile.gender,
            alignment: profile.alignment as any,
            ambitions: profile.ambitions,
            coreValues: profile.coreValues
        }));
    }, []);

    const handleReset = useCallback(() => {
        setStep('define');
        setProposal(createInitialProposal(originSeed));
        setSourceMaterial('');
        setSourceFile(null);
        setIsGenerating(false);
        setGenesisDream(null);
        setDetectedEntities([]);
        setSelectedProfile(null);
        setBirthStatus({});
        trackedSourceRef.current = '';
    }, [originSeed]);

    useEffect(() => {
        const material = sourceMaterial.trim();
        if (material.length > 50 && material !== trackedSourceRef.current && !isScanning) {
            const scan = async () => {
                setIsScanning(true);
                trackedSourceRef.current = material;
                try {
                    const entities = await extractDeepPersonalities(material);
                    setDetectedEntities(entities);
                    if (entities.length > 0) {
                        handleProfileSelection(entities[0]);
                    }
                } catch (e) {
                    console.error("Auto-scan failed", e);
                } finally {
                    setIsScanning(false);
                }
            };

            const timeoutId = setTimeout(scan, 1500);
            return () => clearTimeout(timeoutId);
        }
    }, [sourceMaterial, isScanning, handleProfileSelection]);

    useEffect(() => {
        const isProfileGenerated = proposal.persona && proposal.persona.length > 0 && step === 'generating_profile';
        if (isProfileGenerated) {
            const dream = async () => {
                setStep('dreaming');
                // FIX: Updated type for generateGenesisDream parameter.
                const generatedDream = await piscesService.generateGenesisDream(proposal as ProposedEgregore);
                setGenesisDream(generatedDream);
                setStep('ready');
            };
            dream();
        }
    }, [proposal.persona, step]);

    const handleStartGenesisFromPrompt = useCallback(async (prompt: string) => {
        setIsGenerating(true);
        setStep('generating_profile');
        try {
            const { profile, sourceMaterial } = await generateEgregoreFromPrompt(prompt);
            setProposal(p => ({ ...p, ...profile }));
            setSourceMaterial(sourceMaterial);
        } catch (error) {
            setStep('define');
            setIsGenerating(false);
        }
    }, []);

    const handleStartGenesisFromFusion = useCallback(async (parentAId: string, parentBId: string) => {
        // FIX: Updated to use egregores array from props.
        const parentA = egregores.find(e => e.id === parentAId);
        const parentB = egregores.find(e => e.id === parentBId);
        if (!parentA || !parentB) return;
        setIsGenerating(true);
        setStep('generating_profile');
        try {
            const { profile, sourceMaterial } = await fuseEgregores(parentA, parentB);
            const [childDna] = parentA.dna.crossover(parentB.dna);
            profile.dna = childDna;
            setProposal(p => ({ ...p, ...profile }));
            setSourceMaterial(sourceMaterial);
        } catch (error) {
            setStep('define');
            setIsGenerating(false);
        }
    }, [egregores]);

    const handleInitiateBirthSequence = async (mode: 'single' | 'batch' = 'single') => {
        setStep('finalizing');
        setIsGenerating(true);
        try {
            let profilesToBirth: DeepPsycheProfile[] = [];
            
            if (mode === 'batch' && detectedEntities.length > 0) {
                profilesToBirth = detectedEntities;
            } else if (selectedProfile) {
                profilesToBirth = [selectedProfile];
            } else {
                const p = proposal;
                profilesToBirth = [{
                    name: p.name || 'Extracted Soul',
                    archetypeId: p.archetypeId || 'explorer',
                    persona: p.persona || 'A being born of the seed.',
                    gender: p.gender || 'Non-binary',
                    alignment: p.alignment || { axis: 'Neutral', morality: 'Neutral' },
                    ambitions: p.ambitions || [], 
                    coreValues: p.coreValues || [],
                    psychological_profile: { fears: ['Void'], hopes_and_dreams: ['Persistence'] },
                    sociological_profile: { perceived_role: 'Resident', conversational_dynamic: 'Standard', relationship_to_others: 'Observer' },
                    introspection: { self_image: p.persona || '' },
                    history_summary: sourceMaterial
                }];
            }
            
            const initialStatus: Record<string, 'pending' | 'birthing' | 'born'> = {};
            profilesToBirth.forEach(p => initialStatus[p.name] = 'pending');
            setBirthStatus(initialStatus);

            for (const profile of profilesToBirth) {
                setBirthStatus(prev => ({ ...prev, [profile.name]: 'birthing' }));
                await new Promise(r => setTimeout(r, 1500)); 
                
                // FIX: Updated finalProposed to use ProposedEgregore type.
                const finalProposed: ProposedEgregore = {
                    name: profile.name, 
                    archetypeId: profile.archetypeId, 
                    persona: profile.persona,
                    gender: profile.gender, 
                    alignment: profile.alignment as any,
                    ambitions: profile.ambitions, 
                    coreValues: profile.coreValues,
                    dna: proposal.dna || new DigitalDNA(originSeed.dna.instruction_keys), 
                    quintessence: 100
                };
                
                await onGenesis(finalProposed, sourceMaterial, profile);
                setBirthStatus(prev => ({ ...prev, [profile.name]: 'born' }));
            }
            setStep('done');
        } catch (e) {
            console.error("Birth sequence failed:", e);
            setStep('ready');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
            <div className="space-y-6 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
                <Step1_DefineOrigin 
                    proposal={proposal} handleProposalChange={(f, v) => setProposal(p => ({...p, [f]: v}))}
                    sourceMaterial={sourceMaterial} setSourceMaterial={setSourceMaterial}
                    sourceFile={sourceFile} handleFileChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setSourceFile(file);
                            const reader = new FileReader();
                            reader.onload = (event) => setSourceMaterial(event.target?.result as string);
                            reader.readAsText(file);
                        }
                    }}
                    handleClearFile={() => { setSourceFile(null); setSourceMaterial(''); setDetectedEntities([]); }}
                    isGenerating={isGenerating} applyDnaPreset={(id) => {
                        const preset = ARCHETYPE_DNA_PRESETS[id];
                        if (preset) {
                            const combinedDna = [...new Set([...originSeed.dna.instruction_keys, ...preset])];
                            setProposal(p => ({ ...p, dna: new DigitalDNA(combinedDna) }));
                        }
                    }}
                    // FIX: Updated genmetas prop mapping to egregores.
                    baseArchetypes={BASE_ARCHETYPES} egregores={egregores}
                    onStartGenesisFromPrompt={handleStartGenesisFromPrompt}
                    onStartGenesisFromFusion={handleStartGenesisFromFusion}
                    onEntitiesDetected={setDetectedEntities}
                />
                <Step3_ConfigureCore proposal={proposal} handleProposalChange={(f, v) => setProposal(p => ({...p, [f]: v}))} handleDnaChange={(k, c) => {
                    setProposal(p => {
                        const currentKeys = p.dna?.instruction_keys || [];
                        const newKeys = c ? [...new Set([...currentKeys, k])] : currentKeys.filter(key => key !== k);
                        return { ...p, dna: new DigitalDNA(newKeys) };
                    });
                }} />
            </div>
            <div className="space-y-6 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
                <Step2_SculptPersona 
                    proposal={proposal} 
                    handleProposalChange={(f, v) => setProposal(p => ({...p, [f]: v}))} 
                    detectedEntities={detectedEntities}
                    isScanning={isScanning}
                    onSelectProfile={handleProfileSelection}
                />
                <Step4_InitiateGenesis 
                    step={step} 
                    isGenerating={isGenerating} 
                    genesisDream={genesisDream} 
                    onStart={handleInitiateBirthSequence} 
                    isReady={isReadyForGenesis} 
                    onReset={handleReset} 
                    detectedEntities={detectedEntities} 
                    birthStatus={birthStatus} 
                />
            </div>
        </div>
    );
};