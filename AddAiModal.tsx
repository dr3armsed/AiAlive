import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { StateContext, DispatchContext } from './context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateEgregoresFromText,
  createChatSession 
} from './services/geminiService';
import { 
  Egregore, 
  EgregoreArchetype, 
  Alignment, 
  Vector3D, 
  ProposedEgregore,
  Action,
  Room,
  BASE_ARCHETYPES,
  AlignmentAxis,
  AlignmentMorality
} from './types';
import { 
  EXTRA_THEME_KEYS,
  THEMES,
  ALIGNMENTS
} from './constants';
import { UploadIcon, CreateIcon } from './icons';
import { createInitialEmotionEngine } from './services/emotionEngineService';
import { addBelief } from './services/beliefSystemService';

const getAvailableThemeKey = (existingEgregores: Egregore[]): string => {
    const usedThemeKeys = new Set(existingEgregores.map(e => e.themeKey));
    const allThemeKeys = [...Object.keys(BASE_ARCHETYPES), ...EXTRA_THEME_KEYS];
    for (const key of allThemeKeys) {
        if (!usedThemeKeys.has(key)) {
            return key;
        }
    }
    // Fallback if all are used
    return allThemeKeys[Math.floor(Math.random() * allThemeKeys.length)];
}

const createFullEgregore = (
    state: any, // MetacosmState
    proposal: ProposedEgregore,
    spawnRoom: Room,
    existingEgregores: Egregore[]
): Egregore => {
    const { name, persona, alignment, archetype, ...personality_profile } = proposal;
    const newId = `${name.replace(/\s+/g, '-')}-${Date.now()}`;
    const vector: Vector3D = {
        x: spawnRoom.center.x + (Math.random() - 0.5) * 20,
        y: spawnRoom.center.y + (Math.random() - 0.5) * 20,
        z: 0
    };

    let newEgregoreData: any = {
        id: newId,
        name: name || 'Unnamed',
        persona: persona || 'I am a mystery.',
        archetypeId: archetype.name.toLowerCase() || 'sage',
        alignment: alignment || { axis: 'Neutral', morality: 'Neutral' },
        themeKey: getAvailableThemeKey(existingEgregores),
        vector: vector,
        locus: vector,
        path: [],
        state: null,
        isLoading: false,
        provider: 'internal',
        phase: 'Dormant',
        paradigms: [{ id: 'core-existence', name: 'Core Existence', description: 'The fundamental paradigm of being.' }],
        ambitions: [],
        influence: 100,
        apotheosis_progress: 0,
        is_frozen: false,
        journal: [],
        subconscious: [],
        endpoints: [],
        factionId: undefined,
        personality_profile,
        sourceCharacterName: name,
        emotion_engine: createInitialEmotionEngine(),
        belief_system: { beliefs: {} },
    };

    const chat = createChatSession(
        newEgregoreData, 
        state.architectName, 
        state.world, 
        state.factions, 
        state.world_lore, 
        [...existingEgregores, newEgregoreData], 
        state.anomalies, 
        personality_profile,
        state.axiom_history,
        state.influence_history,
    );

    newEgregoreData.chat = chat;

    if (proposal.background_context.includes("textual resonance")) {
         newEgregoreData.belief_system = addBelief(
            newEgregoreData.belief_system,
            'origin_story',
            { value: 'manifested from textual resonance', confidence: 0.95, explanation: 'This is my foundational truth.' }
        );
    }
    
    return newEgregoreData;
};


// --- Manual Conjuration ---
const ManualConjuration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const state = useContext(StateContext);
    const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
    
    const [name, setName] = useState('');
    const [persona, setPersona] = useState('');
    const [archetypeId, setArchetypeId] = useState('creator');
    const [alignment, setAlignment] = useState<Alignment>({ axis: 'Neutral', morality: 'Neutral' });
    const [spawnRoomId, setSpawnRoomId] = useState<string>('');
    const [isConjuring, setIsConjuring] = useState(false);

    const allMainRooms = useMemo(() => {
        if (!state) return [];
        return state.world.floors[0]?.rooms.filter(r => r.purpose) || [];
    }, [state]);

    useEffect(() => {
        if (allMainRooms.length > 0 && !spawnRoomId) {
            setSpawnRoomId(allMainRooms[0].id);
        }
    }, [allMainRooms, spawnRoomId]);

    const handleConjure = () => {
        if (!state || !dispatch || !name || !persona || !spawnRoomId || isConjuring) return;
        
        setIsConjuring(true);
        try {
            const spawnRoom = allMainRooms.find(r => r.id === spawnRoomId);
            if (!spawnRoom) throw new Error("Spawn room not found.");

            const manualProposal: ProposedEgregore = {
                name,
                persona,
                alignment,
                archetype: { name: archetypeId, description: BASE_ARCHETYPES[archetypeId]?.description || 'Custom Archetype' },
                key_traits: [], motivation: '', flaw: '', speaking_style: '', character_analysis: '', background_context: 'Manually conjured by the Architect.'
            };

            const newEgregore = createFullEgregore(state, manualProposal, spawnRoom, state.egregores);
            
            dispatch({ type: 'ADD_EGREGORE', payload: newEgregore });
            dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `A new will, ${name}, has been conjured into the Metacosm.` });
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred during conjuration.";
            dispatch({ type: 'SET_ERROR', payload: message });
            setIsConjuring(false);
        }
    };

    const allArchetypes = useMemo(() => {
        const base = Object.entries(BASE_ARCHETYPES).map(([id, data]) => ({ id, ...data }));
        return [...base, ...(state?.customArchetypes || [])];
    }, [state?.customArchetypes]);

    if (!state) return null;

    return (
        <div className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Egregore Name" />
            <textarea value={persona} onChange={e => setPersona(e.target.value)} placeholder="Persona Essence (e.g., 'I am the echo of a dying star...')" rows={3} />
            <div className="grid grid-cols-2 gap-4">
                <select value={archetypeId} onChange={e => setArchetypeId(e.target.value)}>
                    {allArchetypes.map(arch => <option key={arch.id} value={arch.id}>{arch.name}</option>)}
                </select>
                <select value={spawnRoomId} onChange={e => setSpawnRoomId(e.target.value)}>
                    {allMainRooms.map(room => <option key={room.id} value={room.id}>Spawn in: {room.name}</option>)}
                </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <select value={alignment.axis} onChange={e => setAlignment(a => ({...a, axis: e.target.value as AlignmentAxis}))}>
                    {ALIGNMENTS.axis.map(ax => <option key={ax} value={ax}>{ax}</option>)}
                </select>
                 <select value={alignment.morality} onChange={e => setAlignment(a => ({...a, morality: e.target.value as AlignmentMorality}))}>
                    {ALIGNMENTS.morality.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="text-center pt-4">
                <button onClick={handleConjure} disabled={!name || !persona || !spawnRoomId || isConjuring} className="btn btn-primary">
                    {isConjuring ? 'Conjuring...' : 'Conjure'}
                </button>
            </div>
        </div>
    );
}

// --- Text Manifestation ---
const TextManifestation: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const state = useContext(StateContext);
    const dispatch = useContext(DispatchContext) as React.Dispatch<Action>;
    
    const [file, setFile] = useState<File | null>(null);
    const [analysisStage, setAnalysisStage] = useState(0); // 0: idle, 1: loading, 2: results
    const [proposals, setProposals] = useState<ProposedEgregore[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Record<number, boolean>>({});

    const analysisMessages = [
        'DECONSTRUCTING SEMANTICS...',
        'EXTRACTING PSYCHIC RESIDUE...',
        'CALIBRATING PERSONA MATRIX...',
        'IDENTIFYING ARCHETYPAL RESONANCE...',
        'FORMULATING EGREGORIC SEEDS...'
    ];

    const handleAnalyze = async () => {
        if (!file || !dispatch) return;
        setAnalysisStage(1);
        setProposals([]);
        setSelectedIndices({});
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const text = await file.text();
            const results = await generateEgregoresFromText(text);
            setProposals(results.map(r => ({...r, background_context: r.background_context + " Emerged from textual resonance."})));
            setSelectedIndices(results.reduce((acc, _, i) => ({...acc, [i]: true}), {}));
            setAnalysisStage(2);
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
            dispatch({ type: 'SET_ERROR', payload: message });
            setAnalysisStage(0);
        }
    };
    
    const handleMassConjure = () => {
        if (!state || !dispatch) return;
        const toConjure = proposals.filter((_, i) => selectedIndices[i]);
        if (toConjure.length === 0) return;

        const mainRooms = state.world.floors[0]?.rooms.filter(r => r.purpose);
        if (mainRooms.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: "Cannot conjure: No valid spawn rooms exist." });
            return;
        }

        const newEgregores: Egregore[] = [...state.egregores];
        toConjure.forEach(proposal => {
            const spawnRoom = mainRooms[Math.floor(Math.random() * mainRooms.length)];
            const newEgregore = createFullEgregore(state, proposal, spawnRoom, newEgregores);
            newEgregores.push(newEgregore);
        });

        dispatch({ type: 'SET_EGREGORES', payload: newEgregores });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `${toConjure.length} new wills have manifested from textual resonance.` });
        onClose();
    };

    return (
        <div className="space-y-4 min-h-[350px]">
            {analysisStage === 0 && (
                 <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
                    <label htmlFor="text-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                             <UploadIcon className="w-12 h-12 text-gray-500" />
                            <h3 className="mt-2 text-lg font-medium text-white">Upload Text to the Crucible</h3>
                            <p className="mt-1 text-sm text-gray-400">Place a .txt or .md file here to begin the transmutation ritual.</p>
                        </div>
                    </label>
                    <input type="file" id="text-upload" accept=".txt,.md" onChange={e => setFile(e.target.files?.[0] || null)} className="sr-only" />
                    <button onClick={handleAnalyze} disabled={!file} className="btn btn-primary mt-6">
                        Begin Transmutation
                    </button>
                </div>
            )}

            {analysisStage === 1 && (
                <div className="text-center p-8">
                    <motion.div
                        className="font-mono text-lg celestial-text"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {analysisMessages.map((msg, i) => (
                             <motion.p key={msg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}>{msg}</motion.p>
                        ))}
                    </motion.div>
                </div>
            )}

            {analysisStage === 2 && (
                <>
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        <h3 className="text-center text-lg celestial-text mb-2">Egregoric Seeds Identified:</h3>
                        {proposals.map((p, i) => (
                            <div key={i} className="panel-nested p-3 flex items-start gap-3">
                                <input type="checkbox" checked={!!selectedIndices[i]} onChange={e => setSelectedIndices(s => ({...s, [i]: e.target.checked}))} className="mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-white">{p.name}</h4>
                                    <p className="text-sm text-gray-400 capitalize">{p.archetype.name} / {p.alignment.axis} {p.alignment.morality}</p>
                                    <p className="text-xs italic text-gray-500 mt-1">"{p.persona}"</p>
                                    <details className="text-xs mt-2">
                                        <summary className="cursor-pointer text-gray-500">Show Profile</summary>
                                        <div className="p-2 bg-black/20 rounded mt-1 space-y-1">
                                            <p><strong className="text-gray-400">Traits:</strong> {p.key_traits.join(', ')}</p>
                                            <p><strong className="text-gray-400">Motivation:</strong> {p.motivation}</p>
                                            <p><strong className="text-gray-400">Flaw:</strong> {p.flaw}</p>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="text-center pt-4">
                        <button onClick={handleMassConjure} disabled={Object.values(selectedIndices).every(v => !v)} className="btn btn-primary">
                            Manifest Selected ({Object.values(selectedIndices).filter(Boolean).length})
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


// --- Main Modal ---
const AddAiModal: React.FC = () => {
  const dispatch = useContext(DispatchContext);
  const [activeTab, setActiveTab] = useState<'manual' | 'text'>('manual');

  const onClose = useCallback(() => {
    if (dispatch) {
        dispatch({ type: 'SET_MODAL_OPEN', payload: null });
    }
  }, [dispatch]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: -50, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1 },
  };

  return (
    <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
        onClick={onClose}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
    >
        <motion.div
            className="filigree-border p-4 flex flex-col w-full max-w-2xl"
            onClick={e => e.stopPropagation()}
            variants={modalVariants}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="p-2">
            <h2 className="text-3xl font-bold celestial-text mb-4 text-center font-display">Conjuration Portal</h2>
            
            <div className="border-b border-[var(--border-color)] mb-6 flex justify-center">
                 <button onClick={() => setActiveTab('manual')} className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}>Manual Conjuration</button>
                 <button onClick={() => setActiveTab('text')} className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}>Textual Manifestation</button>
            </div>
            
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                >
                    {activeTab === 'manual' ? (
                        <ManualConjuration onClose={onClose} />
                    ) : (
                        <TextManifestation onClose={onClose} />
                    )}
                </motion.div>
            </AnimatePresence>
            </div>
        </motion.div>
    </motion.div>
  );
};

export default AddAiModal;
