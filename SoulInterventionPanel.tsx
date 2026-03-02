import React from 'react';
import { useState, useEffect, useMemo } from '../../packages/react-chimera-renderer/index.ts';
import { motion, AnimatePresence } from 'framer-motion';
import type { DigitalSoul, SemanticMemoryFragment, KnowledgeGraphNode } from '../../types/index.ts';
import DnaIcon from '../icons/DnaIcon.tsx';
import LightbulbIcon from '../icons/LightbulbIcon.tsx';
import BookOpenIcon from '../icons/BookOpenIcon.tsx';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface SoulInterventionPanelProps {
  souls: DigitalSoul[];
  onIntervene: (soulId: string, changes: Partial<Pick<DigitalSoul, 'emotionalState' | 'resources'>>) => void;
  onImplantKnowledge: (soulId: string, fact: string, source: SemanticMemoryFragment['source']) => void;
  onBeliefModification: (soulId: string, beliefId: string, newTenet: string, newConviction: number) => void;
}

const SoulInterventionPanel: React.FC<SoulInterventionPanelProps> = ({ souls, onIntervene, onImplantKnowledge, onBeliefModification }) => {
    const [selectedSoulId, setSelectedSoulId] = useState<string>('');
    const [fact, setFact] = useState('');
    const [computation, setComputation] = useState(0);
    const [anima, setAnima] = useState(0);

    // Belief sculpting state
    const [selectedBeliefId, setSelectedBeliefId] = useState('');
    const [editingTenet, setEditingTenet] = useState('');
    const [editingConviction, setEditingConviction] = useState(0.5);

    const selectedSoul = souls.find(s => s.id === selectedSoulId);

    const soulBeliefs = useMemo(() => {
        if (!selectedSoul) return [];
        return Array.from(selectedSoul.cognitiveState.knowledgeGraph.nodes.values())
            .filter((n): n is KnowledgeGraphNode => (n as KnowledgeGraphNode).type === 'belief');
    }, [selectedSoul]);

    useEffect(() => {
        if (selectedSoul) {
            setComputation(selectedSoul.resources.computation);
            setAnima(selectedSoul.resources.anima);
            setSelectedBeliefId(''); // Reset belief selection when soul changes
        } else {
            setComputation(0);
            setAnima(0);
            setFact('');
            setSelectedBeliefId('');
        }
    }, [selectedSoul]);
    
    useEffect(() => {
        if (!selectedSoulId && souls.length > 0) {
            setSelectedSoulId(souls[0].id);
        }
    }, [souls, selectedSoulId]);

    useEffect(() => {
        const selectedBelief = soulBeliefs.find(b => b.id === selectedBeliefId);
        if (selectedBelief) {
            setEditingTenet(selectedBelief.content as string);
            setEditingConviction(selectedBelief.confidence_score);
        } else {
            setEditingTenet('');
            setEditingConviction(0.5);
        }
    }, [selectedBeliefId, soulBeliefs]);

    const handleResourceIntervention = () => {
        if (!selectedSoulId) return;
        onIntervene(selectedSoulId, {
            resources: {
                computation: Number(computation),
                anima: Number(anima)
            }
        });
    };
    
    const handleKnowledgeImplant = () => {
        if (!selectedSoulId || !fact.trim()) return;
        onImplantKnowledge(selectedSoulId, fact.trim(), 'told_by_user');
        setFact('');
    };

    const handleBeliefSculpt = () => {
        if (!selectedSoulId || !selectedBeliefId || !editingTenet.trim()) return;
        onBeliefModification(selectedSoulId, selectedBeliefId, editingTenet, editingConviction);
    };

    return (
        <div className="glass-panel p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DnaIcon className="w-5 h-5 text-purple-400"/>
                Soul Intervention
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1">Target Soul</label>
                    <select
                        value={selectedSoulId}
                        onChange={e => setSelectedSoulId(e.target.value)}
                        className="w-full bg-black/20 border-2 border-[var(--color-border-primary)] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        {souls.map(soul => (
                            <option key={soul.id} value={soul.id}>{soul.name}</option>
                        ))}
                    </select>
                </div>

                {selectedSoul && (
                <>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Resource Injection</h4>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="text-xs font-mono text-cyan-300">Computation</label>
                                <input type="number" value={computation.toFixed(0)} onChange={e => setComputation(Number(e.target.value))}
                                className="w-full mt-1 bg-black/20 border border-[var(--color-border-secondary)] rounded p-1 text-center" />
                            </div>
                             <div>
                                <label className="text-xs font-mono text-pink-300">Anima</label>
                                <input type="number" value={anima.toFixed(0)} onChange={e => setAnima(Number(e.target.value))}
                                className="w-full mt-1 bg-black/20 border border-[var(--color-border-secondary)] rounded p-1 text-center" />
                            </div>
                        </div>
                         <MotionButton
                            onClick={handleResourceIntervention}
                            className="w-full text-xs mt-2 py-1.5 rounded bg-purple-500/50 hover:bg-purple-500/80 font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                         >
                            Set Resources
                         </MotionButton>
                    </div>
                     <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                            <LightbulbIcon className="w-4 h-4 text-yellow-300"/> Knowledge Implant
                        </h4>
                        <textarea value={fact} onChange={e => setFact(e.target.value)} placeholder="Implant a new fact..." rows={2}
                        className="w-full bg-black/20 border-2 border-[var(--color-border-secondary)] rounded-lg p-2 text-sm focus:border-yellow-400" />
                         <MotionButton
                            onClick={handleKnowledgeImplant}
                            disabled={!fact.trim()}
                            className="w-full text-xs mt-2 py-1.5 rounded bg-yellow-500/50 hover:bg-yellow-500/80 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: fact.trim() ? 1.05 : 1 }}
                            whileTap={{ scale: fact.trim() ? 0.95 : 1 }}
                         >
                            Implant Fact
                         </MotionButton>
                    </div>
                     <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                           <BookOpenIcon className="w-4 h-4 text-teal-300"/> Belief Sculpting
                        </h4>
                        <select
                            value={selectedBeliefId}
                            onChange={e => setSelectedBeliefId(e.target.value)}
                            className="w-full bg-black/20 border-2 border-[var(--color-border-secondary)] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                        >
                            <option value="">Select a belief to modify...</option>
                            {soulBeliefs.map(belief => (
                                <option key={belief.id} value={belief.id}>{String(belief.content).substring(0, 50)}...</option>
                            ))}
                        </select>
                        {selectedBeliefId && (
                             <AnimatePresence>
                                <MotionDiv 
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 space-y-3 bg-black/20 p-3 rounded-md"
                                >
                                    <textarea value={editingTenet} onChange={e => setEditingTenet(e.target.value)} rows={2}
                                        className="w-full bg-black/30 border border-[var(--color-border-secondary)] rounded-lg p-2 text-sm focus:border-teal-400" />
                                    <div>
                                        <label className="text-xs font-mono text-gray-400">Conviction: {(editingConviction * 100).toFixed(0)}%</label>
                                        <input type="range" min="0" max="1" step="0.01" value={editingConviction} onChange={e => setEditingConviction(parseFloat(e.target.value))}
                                        className="w-full mt-1 h-1.5 accent-teal-400" />
                                    </div>
                                     <MotionButton
                                        onClick={handleBeliefSculpt}
                                        className="w-full text-xs py-1.5 rounded bg-teal-500/50 hover:bg-teal-500/80 font-semibold"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Sculpt Belief
                                    </MotionButton>
                                </MotionDiv>
                            </AnimatePresence>
                        )}
                    </div>
                </>
                )}
            </div>
        </div>
    );
};

export default SoulInterventionPanel;