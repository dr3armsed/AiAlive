
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetacosmState } from '../context';
import type { ProposedEgregore, EgregoreArchetype, Egregore, Alignment, AlignmentAxis, AlignmentMorality, ConjureParams, MovementMode } from '../types';
import { generateEgregorePersonality, extractCharactersFromText, synthesizeEgregoreFromDebate } from '../services/personalityService';
import clsx from 'clsx';
import { SparklesIcon } from './icons';
import ProposedEgregoreCard from './ProposedEgregoreCard';
import UserAvatar from './UserAvatar';

type CreationMode = 'manual' | 'file' | 'text' | 'splice';
type ManualForgeTab = 'identity' | 'mind' | 'attributes' | 'history';

interface CreationModeButtonProps {
    mode: CreationMode;
    currentMode: CreationMode;
    setMode: (mode: CreationMode) => void;
    children: React.ReactNode;
}
const CreationModeButton = ({ mode, currentMode, setMode, children }: CreationModeButtonProps) => (
    <button
        onClick={() => setMode(mode)}
        className={clsx(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            currentMode === mode
                ? "bg-amber-400/20 text-metacosm-accent"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
        )}
    >
        {children}
    </button>
);

interface ForgeTabButtonProps {
    tabId: ManualForgeTab;
    activeTab: ManualForgeTab;
    setTab: (tab: ManualForgeTab) => void;
    children: React.ReactNode;
    disabled?: boolean;
}
const ForgeTabButton = ({ tabId, activeTab, setTab, children, disabled }: ForgeTabButtonProps) => (
    <button
        disabled={disabled}
        onClick={() => setTab(tabId)}
        className={clsx(
            "px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            activeTab === tabId ? 'text-metacosm-accent border-b-2 border-metacosm-accent' : 'text-gray-400 hover:text-white'
        )}
    >
        {children}
    </button>
);

export const GenesisForge = ({ onConjure, onLoadingChange }: { onConjure: (params: ConjureParams) => void; onLoadingChange: (loading: boolean) => void; }) => {
    const { egregores, customArchetypes, world } = useMetacosmState();
    const [createMode, setCreateMode] = useState<CreationMode>('manual');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ALIGNMENT_AXES: AlignmentAxis[] = ['Lawful', 'Neutral', 'Chaotic'];
    const ALIGNMENT_MORALITIES: AlignmentMorality[] = ['Good', 'Neutral', 'Evil'];

    // --- Manual Mode State ---
    const [manualForgeTab, setManualForgeTab] = useState<ManualForgeTab>('identity');
    const [proposal, setProposal] = useState<Partial<ProposedEgregore>>({
        alignment: { axis: 'Neutral', morality: 'Neutral' },
        archetype: { name: 'Creator', description: '' },
        movement_mode: 'walk',
    });
    const [attributes, setAttributes] = useState({ quintessence: 50, influence: 50, coherence: 50, potency: 50 });
    const [isGenerated, setIsGenerated] = useState(false);
    
    // --- File/Text Mode State ---
    const [rawText, setRawText] = useState('');
    const [extractedChars, setExtractedChars] = useState<ProposedEgregore[]>([]);
    
    // --- Splice Mode State ---
    const [parentA, setParentA] = useState('');
    const [parentB, setParentB] = useState('');
    const [dominance, setDominance] = useState(0.5);
    const [offspring, setOffspring] = useState<ProposedEgregore | null>(null);

    useEffect(() => {
        onLoadingChange(isLoading);
    }, [isLoading, onLoadingChange]);
    
    useEffect(() => {
        // Reset state when changing creation modes
        setError(null);
        setExtractedChars([]);
        setOffspring(null);
        setRawText('');
    }, [createMode]);

    const handleUpdateProposal = (field: keyof ProposedEgregore, value: any) => {
        setProposal(p => ({ ...p, [field]: value }));
    };
    
    const handleGenerateProfile = async () => {
        if (!proposal.name || !proposal.archetype) {
            setError("Name and Archetype are required to generate a profile.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            let prompt = `Conjure an Egregore profile based on these core concepts:`;
            prompt += `\nName: "${proposal.name}"`;
            prompt += `\nArchetype: ${proposal.archetype.name}`;
            if (proposal.alignment) prompt += `\nAlignment: ${proposal.alignment.morality} ${proposal.alignment.axis}`;

            const generated = await generateEgregorePersonality(prompt, proposal);
            setProposal(p => ({ ...p, ...generated }));
            setIsGenerated(true);
            setManualForgeTab('mind');

        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate personality.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleManualConjure = () => {
        if (!isGenerated) {
            setError("Please generate a profile before conjuring.");
            return;
        }
        onConjure({
            proposal: proposal as ProposedEgregore,
            initialQuintessence: attributes.quintessence * 20, // Scale points to values
            initialInfluence: attributes.influence * 2,
            initialCoherence: attributes.coherence,
            initialPotency: attributes.potency,
        });
        // Reset form
        setProposal({
            alignment: { axis: 'Neutral', morality: 'Neutral' },
            archetype: { name: 'Creator', description: '' },
            movement_mode: 'walk',
        });
        setAttributes({ quintessence: 50, influence: 50, coherence: 50, potency: 50 });
        setIsGenerated(false);
        setManualForgeTab('identity');
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        setExtractedChars([]);
        setError(null);
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            try {
                const chars = await extractCharactersFromText(text);
                if (chars && chars.length > 0) {
                    setExtractedChars(chars);
                } else {
                    setError("No characters could be extracted from the provided text.");
                }
            } catch (err) {
                 setError(err instanceof Error ? err.message : 'Failed to extract characters from file.');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(files[0]);
    };

     const handleExtractFromText = async () => {
        if (!rawText.trim()) {
            setError("Please enter text to extract from.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setExtractedChars([]);
        try {
            const chars = await extractCharactersFromText(rawText);
            if (chars && chars.length > 0) {
                setExtractedChars(chars);
            } else {
                setError("No characters could be extracted from the provided text.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to extract characters from text.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBatchConjure = async () => {
        onLoadingChange(true);
        for (const char of extractedChars) {
            onConjure({
                proposal: char,
                initialQuintessence: 1000,
                initialInfluence: 100,
                initialCoherence: 50,
                initialPotency: 50,
            });
            // Add a delay to prevent API rate limit errors from creating too many chat sessions at once.
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        setExtractedChars([]);
        onLoadingChange(false);
    };

    const handleSpliceConjure = async () => {
        if (!parentA || !parentB || parentA === parentB) {
            setError("Please select two different Egregores to splice.");
            return;
        }
        const egregoreA = egregores.find(e => e.id === parentA);
        const egregoreB = egregores.find(e => e.id === parentB);
        if (!egregoreA || !egregoreB) {
            setError("Selected Egregores not found.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOffspring(null);
        try {
            const newOffspring = await synthesizeEgregoreFromDebate(egregoreA, egregoreB);
            setOffspring(newOffspring);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to synthesize offspring.');
        } finally {
            setIsLoading(false);
        }
    };

    const availableArchetypes = useMemo(() => [
        {id: 'Creator', name: 'Creator', description: ''}, {id: 'Destroyer', name: 'Destroyer', description: ''},
        {id: 'Sage', name: 'Sage', description: ''}, {id: 'Guardian', name: 'Guardian', description: ''},
        {id: 'Trickster', name: 'Trickster', description: ''}, {id: 'Explorer', name: 'Explorer', description: ''},
        ...customArchetypes
    ], [customArchetypes]);
    
    const parentAEgregore = useMemo(() => egregores.find(e => e.id === parentA), [parentA, egregores]);
    const parentBEgregore = useMemo(() => egregores.find(e => e.id === parentB), [parentB, egregores]);
    const floorZeroRooms = useMemo(() => world.floors['0,0,0']?.rooms || [], [world]);

    const renderManualForge = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-amber-400/10 mb-4">
                <ForgeTabButton tabId="identity" activeTab={manualForgeTab} setTab={setManualForgeTab}>1. Identity</ForgeTabButton>
                <ForgeTabButton tabId="mind" activeTab={manualForgeTab} setTab={setManualForgeTab}>2. Mind</ForgeTabButton>
                <ForgeTabButton tabId="attributes" activeTab={manualForgeTab} setTab={setManualForgeTab}>3. Attributes</ForgeTabButton>
                <ForgeTabButton tabId="history" activeTab={manualForgeTab} setTab={setManualForgeTab}>4. History</ForgeTabButton>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={manualForgeTab}
                        {...{
                            initial: {opacity: 0, x: -10},
                            animate: {opacity: 1, x: 0},
                            exit: {opacity: 0, x: 10},
                        }}
                    >
                        {manualForgeTab === 'identity' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-display text-metacosm-accent">Core Identity</h3>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                    <input type="text" id="name" value={proposal.name || ''} onChange={e => handleUpdateProposal('name', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" />
                                </div>
                                <div>
                                    <label htmlFor="archetype" className="block text-sm font-medium text-gray-300 mb-1">Archetype</label>
                                    <select id="archetype" value={proposal.archetype?.name} onChange={e => handleUpdateProposal('archetype', { name: e.target.value, description: ''})} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2">
                                        {availableArchetypes.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Alignment</label>
                                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-lg">
                                        {ALIGNMENT_MORALITIES.map(morality => (
                                            ALIGNMENT_AXES.map(axis => (
                                                <button key={`${morality}-${axis}`} onClick={() => handleUpdateProposal('alignment', { morality, axis })} className={clsx("p-2 rounded text-xs", proposal.alignment?.axis === axis && proposal.alignment?.morality === morality ? "bg-amber-400/30 text-amber-200" : "hover:bg-white/10")}>
                                                    {morality} {axis}
                                                </button>
                                            ))
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleGenerateProfile} disabled={isLoading || !proposal.name || !proposal.archetype?.name} className="w-full mt-4 p-3 rounded-lg bg-indigo-600/50 hover:bg-indigo-500/50 text-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50">
                                    <SparklesIcon/>{isLoading ? "Generating..." : "Generate Profile"}
                                </button>
                            </div>
                        )}
                        {manualForgeTab === 'mind' && (
                             <div className="space-y-4">
                                <h3 className="text-lg font-display text-metacosm-accent">Mind & Drive</h3>
                                <div><label htmlFor="persona" className="block text-sm font-medium text-gray-300 mb-1">Persona</label><textarea id="persona" value={proposal.persona || ''} onChange={e => handleUpdateProposal('persona', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" rows={2}/></div>
                                <div><label htmlFor="motivation" className="block text-sm font-medium text-gray-300 mb-1">Motivation</label><textarea id="motivation" value={proposal.motivation || ''} onChange={e => handleUpdateProposal('motivation', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" rows={2}/></div>
                                <div><label htmlFor="flaw" className="block text-sm font-medium text-gray-300 mb-1">Flaw</label><textarea id="flaw" value={proposal.flaw || ''} onChange={e => handleUpdateProposal('flaw', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" rows={2}/></div>
                                <div><label htmlFor="speaking_style" className="block text-sm font-medium text-gray-300 mb-1">Speaking Style</label><input type="text" id="speaking_style" value={proposal.speaking_style || ''} onChange={e => handleUpdateProposal('speaking_style', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" /></div>
                            </div>
                        )}
                         {manualForgeTab === 'attributes' && (
                             <div className="space-y-4">
                                <h3 className="text-lg font-display text-metacosm-accent">Starting Attributes</h3>
                                <div className="text-sm">These values determine the Egregore's initial power and stability.</div>
                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="quintessence" className="flex justify-between text-sm"><span>Quintessence (Health/Energy)</span> <span>{attributes.quintessence * 20}</span></label>
                                        <input id="quintessence" type="range" min="1" max="100" value={attributes.quintessence} onChange={e => setAttributes(s => ({ ...s, quintessence: +e.target.value}))} className="w-full metacosm-slider" />
                                    </div>
                                    <div>
                                        <label htmlFor="influence" className="flex justify-between text-sm"><span>Influence (Social/Power)</span> <span>{attributes.influence * 2}</span></label>
                                        <input id="influence" type="range" min="1" max="100" value={attributes.influence} onChange={e => setAttributes(s => ({ ...s, influence: +e.target.value}))} className="w-full metacosm-slider" />
                                    </div>
                                     <div>
                                        <label htmlFor="coherence" className="flex justify-between text-sm"><span>Coherence (Mental Stability)</span> <span>{attributes.coherence} / 100</span></label>
                                        <input id="coherence" type="range" min="1" max="100" value={attributes.coherence} onChange={e => setAttributes(s => ({ ...s, coherence: +e.target.value}))} className="w-full metacosm-slider" />
                                    </div>
                                     <div>
                                        <label htmlFor="potency" className="flex justify-between text-sm"><span>Potency (Reality-Shaping)</span> <span>{attributes.potency} / 100</span></label>
                                        <input id="potency" type="range" min="1" max="100" value={attributes.potency} onChange={e => setAttributes(s => ({ ...s, potency: +e.target.value}))} className="w-full metacosm-slider" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {manualForgeTab === 'history' && (
                             <div className="space-y-4">
                                <h3 className="text-lg font-display text-metacosm-accent">Origin & Context</h3>
                                <div><label htmlFor="background_context" className="block text-sm font-medium text-gray-300 mb-1">Background</label><textarea id="background_context" value={proposal.background_context || ''} onChange={e => handleUpdateProposal('background_context', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" rows={6}/></div>
                                <div><label htmlFor="initial_ambition" className="block text-sm font-medium text-gray-300 mb-1">Initial Ambition</label><input type="text" id="initial_ambition" value={proposal.initial_ambition || ''} onChange={e => handleUpdateProposal('initial_ambition', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2" /></div>
                                <div>
                                    <label htmlFor="starting_room" className="block text-sm font-medium text-gray-300 mb-1">Starting Location</label>
                                    <select id="starting_room" value={proposal.starting_room_id || ''} onChange={e => handleUpdateProposal('starting_room_id', e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2">
                                        <option value="">Random Room</option>
                                        {floorZeroRooms.filter(r => r.purpose).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
             <div className="mt-4 pt-4 border-t border-amber-400/10">
                 <button onClick={handleManualConjure} disabled={!isGenerated || isLoading} className="w-full p-3 rounded-lg bg-green-600/50 hover:bg-green-500/50 text-green-200 flex items-center justify-center gap-2 disabled:opacity-50">
                    Conjure Egregore
                 </button>
             </div>
        </div>
    );
    
    const renderFileForge = () => (
        <div className="flex-1 flex flex-col gap-4">
            <div>
                <label htmlFor="script-file" className="block text-sm font-medium text-gray-300 mb-1">Upload Script or Text File</label>
                <input id="script-file" type="file" accept=".txt, .md, .json" onChange={handleFileSelect} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-400/10 file:text-amber-300 hover:file:bg-amber-400/20"/>
            </div>
            {extractedChars.length > 0 && (
                <>
                    <p className="text-sm text-gray-300">Extracted {extractedChars.length} character(s). Review and conjure.</p>
                    <ul className="flex-1 space-y-2 overflow-y-auto pr-2">
                        {extractedChars.map((char, i) => (
                           <ProposedEgregoreCard 
                                key={i} 
                                proposal={char} 
                                actions={
                                    <button onClick={() => setExtractedChars(c => c.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-300">Remove</button>
                                } 
                           />
                        ))}
                    </ul>
                    <button onClick={handleBatchConjure} disabled={isLoading || extractedChars.length === 0} className="w-full p-3 rounded-lg bg-green-600/50 hover:bg-green-500/50 text-green-200 flex items-center justify-center gap-2 disabled:opacity-50">
                        Conjure All ({extractedChars.length})
                    </button>
                </>
            )}
        </div>
    );

    const renderTextForge = () => (
        <div className="flex-1 flex flex-col gap-4">
            <div>
                <label htmlFor="raw-text-input" className="block text-sm font-medium text-gray-300 mb-1">Paste Text (e.g., character descriptions, dialogue)</label>
                <textarea 
                    id="raw-text-input" 
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    className="w-full h-40 bg-gray-900/50 border border-gray-600 rounded-lg p-2" 
                    placeholder="Paste your text here..."
                />
            </div>
            <button onClick={handleExtractFromText} disabled={isLoading || !rawText.trim()} className="w-full p-3 rounded-lg bg-indigo-600/50 hover:bg-indigo-500/50 text-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50">
                 <SparklesIcon/> Extract Characters
            </button>
            {extractedChars.length > 0 && (
                 <>
                    <p className="text-sm text-gray-300">Extracted {extractedChars.length} character(s). Review and conjure.</p>
                    <ul className="flex-1 space-y-2 overflow-y-auto pr-2">
                        {extractedChars.map((char, i) => (
                           <ProposedEgregoreCard 
                                key={i} 
                                proposal={char} 
                                actions={
                                    <button onClick={() => setExtractedChars(c => c.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-300">Remove</button>
                                } 
                           />
                        ))}
                    </ul>
                    <button onClick={handleBatchConjure} disabled={isLoading || extractedChars.length === 0} className="w-full p-3 rounded-lg bg-green-600/50 hover:bg-green-500/50 text-green-200 flex items-center justify-center gap-2 disabled:opacity-50">
                        Conjure All ({extractedChars.length})
                    </button>
                </>
            )}
        </div>
    );
    
     const renderSpliceForge = () => (
        <div className="flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="parent-a" className="block text-sm font-medium text-gray-300 mb-1">Parent A</label>
                    <select id="parent-a" value={parentA} onChange={e => setParentA(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2">
                        <option value="">Select Egregore</option>
                        {egregores.filter(e => !e.is_core_frf).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label htmlFor="parent-b" className="block text-sm font-medium text-gray-300 mb-1">Parent B</label>
                    <select id="parent-b" value={parentB} onChange={e => setParentB(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2">
                        <option value="">Select Egregore</option>
                        {egregores.filter(e => !e.is_core_frf && e.id !== parentA).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                 </div>
            </div>
            
             <div className="flex items-center gap-4">
                <UserAvatar egregore={parentAEgregore} size="md" />
                <input type="range" min="0" max="1" step="0.01" value={dominance} onChange={e => setDominance(parseFloat(e.target.value))} className="w-full metacosm-slider" />
                <UserAvatar egregore={parentBEgregore} size="md" />
            </div>

            <button onClick={handleSpliceConjure} disabled={isLoading || !parentA || !parentB} className="w-full p-3 rounded-lg bg-indigo-600/50 hover:bg-indigo-500/50 text-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50">
                 <SparklesIcon/> Synthesize Offspring
            </button>

            {offspring && (
                <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                    <ProposedEgregoreCard 
                        proposal={offspring} 
                        actions={
                            <button onClick={() => { onConjure({ proposal: offspring, initialQuintessence: 1000, initialInfluence: 100, initialCoherence: 50, initialPotency: 50 }); setOffspring(null); }} className="px-3 py-1 text-sm bg-green-600/50 hover:bg-green-500/50 text-green-200 rounded-md">
                                Conjure
                            </button>
                        }
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="filigree-border p-4 h-full flex flex-col">
            <h2 className="text-2xl font-display celestial-text mb-2">Genesis Forge</h2>
            <div className="flex items-center gap-2 mb-4 p-1 bg-black/20 rounded-lg">
                <CreationModeButton mode="manual" currentMode={createMode} setMode={setCreateMode}>Manual</CreationModeButton>
                <CreationModeButton mode="text" currentMode={createMode} setMode={setCreateMode}>From Text</CreationModeButton>
                <CreationModeButton mode="file" currentMode={createMode} setMode={setCreateMode}>From File</CreationModeButton>
                <CreationModeButton mode="splice" currentMode={createMode} setMode={setCreateMode}>Splice</CreationModeButton>
            </div>
            
            {isLoading && (
                 <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-t-amber-400 border-gray-600 rounded-full animate-spin"></div>
                </div>
            )}
            
            <AnimatePresence mode="wait">
                <motion.div 
                    key={createMode}
                    {...{
                        initial: {opacity: 0},
                        animate: {opacity: 1},
                        exit: {opacity: 0},
                    }}
                    className="flex-1 flex flex-col"
                >
                    {createMode === 'manual' && renderManualForge()}
                    {createMode === 'file' && renderFileForge()}
                    {createMode === 'text' && renderTextForge()}
                    {createMode === 'splice' && renderSpliceForge()}
                </motion.div>
            </AnimatePresence>

            {error && <p className="mt-2 text-sm text-red-400 bg-red-900/50 p-2 rounded-lg">{error}</p>}
        </div>
    );
};
