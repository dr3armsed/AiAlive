import { Dispatch } from 'react';
import type {
    MetacosmState, Action, Egregore, UUID, SystemUpgradeProposal, ChatMessage, SystemPersonality, AlignmentAxis, AlignmentMorality,
    SpectreType, ForumThread, ForumPost, FactionId, SpectreState, Vector3D, Floor, SystemTaskEntry
} from '@/types';
import {
    generateDream,
    updateMemorySummary,
    generateMetacosmAction,
    summarizeSystemMemory,
} from '@/services/geminiService';
import { findPath } from '@/services/pathfindingService';
import { getRoomForVector } from './helpers';
import { generateUUID } from '@/utils';
import { runSystemLocus as runLocusService } from '@/services/systemLocusService';


export const detectAndLogParadoxes = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    const allEgregoreIds = new Set(state.egregores.map(e => e.id));
    const allMessageIds = new Set(state.messages.map(m => m.id));

    const createParadox = (description: string, subjectId?: UUID) => {
        dispatch({
            type: 'CREATE_PARADOX',
            payload: {
                id: generateUUID(),
                description: description,
                turn_detected: state.turn,
                status: 'active',
                subjectId,
            }
        });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//ERROR: Paradox detected: ${description}` });
    };

    // Check for factions with invalid leaders
    for (const faction of state.factions) {
        if (!allEgregoreIds.has(faction.leader) || !faction.members.includes(faction.leader)) {
            createParadox(`Faction "${faction.name}" has an invalid or non-member leader.`, faction.id);
        }
    }

    // Check Ancilla causality links
    for (const ancilla of state.ancillae) {
        if (ancilla.causality_link && !allMessageIds.has(ancilla.causality_link)) {
            createParadox(`Ancilla "${ancilla.name}" has a broken causality link.`, ancilla.id);
        }
    }
    
    // Check project leads
    for (const project of state.projects) {
        if (!allEgregoreIds.has(project.leadId)) {
            createParadox(`Project "${project.name}" has a non-existent lead.`, project.id);
        }
    }
};


export const runSystemScanners = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    // Stability Scanner
    const fracturedCount = state.egregores.filter(e => e.phase === 'Fractured').length;
    const totalEgregores = state.egregores.filter(e => !e.is_core_frf).length;
    const fractureRate = totalEgregores > 0 ? fracturedCount / totalEgregores : 0;
    
    if (fractureRate > 0.25) {
        const existingTask = state.continuity_log.find(e => e.type === 'SystemTask' && e.description.includes('High fracture rate') && e.status !== 'Resolved');
        if (!existingTask) {
            const task: SystemTaskEntry = {
                id: generateUUID(),
                type: 'SystemTask',
                turnDetected: state.turn,
                detectedBy: 'Stability',
                description: `High fracture rate detected (${(fractureRate * 100).toFixed(0)}%). Egregores are becoming mentally unstable.`,
                location: 'src/hooks/useGameLoop/processEgregoreTurn.ts',
                trace: [
                    'Turn processing initiated.',
                    'Egregore API call failed with 429 error.',
                    'Fallback response triggered `quintessence_delta: -100`.',
                    'Egregore coherence dropped below threshold, phase changed to `Fractured`.',
                ],
                code_snippet: 'if (egregore.coherence < 20) { /* ... set phase to Fractured ... */ }',
                status: 'Open',
                assignedSpectres: ['Entity', 'System'],
                progressLog: [],
            };
            dispatch({ type: 'CREATE_CONTINUITY_ENTRY', payload: task });
        }
    }

    // Performance Scanner
    const entityCount = state.egregores.length + state.ancillae.length + state.world_lore.length;
    if (entityCount > 100) {
        const existingTask = state.continuity_log.find(e => e.type === 'SystemTask' && e.description.includes('High entity count') && e.status !== 'Resolved');
        if (!existingTask) {
             const task: SystemTaskEntry = {
                id: generateUUID(),
                type: 'SystemTask',
                turnDetected: state.turn,
                detectedBy: 'Performance',
                description: `High entity count (${entityCount}) may lead to state processing slowdowns.`,
                location: 'src/state/reducer.ts',
                trace: ['Many `CREATE_LORE` and `CREATE_ANCILLA` actions dispatched.', 'State object size increasing.', 'Potential for slow state updates and UI re-renders.'],
                status: 'Open',
                assignedSpectres: ['System', 'Data Spectre'],
                progressLog: [],
            };
            dispatch({ type: 'CREATE_CONTINUITY_ENTRY', payload: task });
        }
    }
};

export const processContinuityTasks = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    state.continuity_log.forEach(entry => {
        if (entry.type !== 'SystemTask') return;
        
        let updated = false;
        let dataToUpdate: Partial<SystemTaskEntry> = {};

        switch(entry.status) {
            case 'Open':
                dataToUpdate.status = 'InProgress';
                dataToUpdate.progressLog = [...entry.progressLog, { turn: state.turn, entry: `Task acknowledged. ${entry.assignedSpectres.join(', ')} Spectres beginning analysis.` }];
                updated = true;
                break;
            
            case 'InProgress':
                if (state.turn > entry.turnDetected + 2) {
                    dataToUpdate.status = 'PendingApproval';
                    dataToUpdate.proposed_solution = { description: 'Refactor state management to use optimized data structures and implement archival logic for older entities.' };
                    dataToUpdate.progressLog = [...entry.progressLog, { turn: state.turn, entry: `Analysis complete. Solution proposed.` }];
                    updated = true;
                }
                break;

            case 'PendingApproval':
                 if (state.turn > entry.turnDetected + 3) {
                    dataToUpdate.status = 'Implementing';
                    dataToUpdate.implementationTurnsLeft = 5;
                    dataToUpdate.progressLog = [...entry.progressLog, { turn: state.turn, entry: `Solution approved by Metacosm Core. Implementation initiated.` }];
                    updated = true;
                }
                break;

            case 'Implementing':
                if (entry.implementationTurnsLeft && entry.implementationTurnsLeft > 1) {
                    dataToUpdate.implementationTurnsLeft = entry.implementationTurnsLeft - 1;
                    dataToUpdate.progressLog = [...entry.progressLog, { turn: state.turn, entry: `Implementation in progress... ${dataToUpdate.implementationTurnsLeft} cycles remaining.` }];
                    updated = true;
                } else {
                    dataToUpdate.status = 'Resolved';
                    dataToUpdate.implementationTurnsLeft = 0;
                     dataToUpdate.progressLog = [...entry.progressLog, { turn: state.turn, entry: `Implementation complete. Patch deployed successfully.` }];
                    dataToUpdate.resolution = `System patched at Turn ${state.turn}. Monitoring for stability.`
                    updated = true;
                }
                break;
        }

        if (updated) {
            dispatch({ type: 'UPDATE_CONTINUITY_ENTRY', payload: { id: entry.id, data: dataToUpdate } });
        }
    });
};

const consolidateEgregoreMemories = async (dispatch: Dispatch<Action>, state: MetacosmState) => {
    const eligibleEgregores = state.egregores.filter(e => 
        !e.is_core_frf && 
        !e.is_frozen && 
        e.personal_thoughts && 
        e.personal_thoughts.length > 0
    );

    if (eligibleEgregores.length === 0) return;

    // Select just one Egregore to update per memory consolidation turn to avoid rate limiting
    const egregoreToUpdate = eligibleEgregores[Math.floor(Math.random() * eligibleEgregores.length)];

    dispatch({type: 'ADD_TICKER_MESSAGE', payload: `Memory consolidation initiated for: ${egregoreToUpdate.name}.`});

    try {
        const thoughtsForSummary = (egregoreToUpdate.personal_thoughts || []).slice(0, 10);
        if (thoughtsForSummary.length === 0) return;
        
        const newSummary = await updateMemorySummary(egregoreToUpdate.memory_summary || '', thoughtsForSummary);
        dispatch({ type: 'UPDATE_EGREGORE_MEMORY', payload: { egregoreId: egregoreToUpdate.id, summary: newSummary } });
    } catch (error) {
        console.error(`Failed to consolidate memory for ${egregoreToUpdate.name}`, error);
        // Do not re-throw, just log and continue the game loop
    }
};

export const consolidateSystemMemories = async (
    dispatch: Dispatch<Action>, 
    state: MetacosmState, 
    spectreState: SpectreState, 
    setSpectreState: React.Dispatch<React.SetStateAction<SpectreState>>
) => {
    const systemEntities: (SpectreType | 'TriadicCore')[] = [...Object.keys(spectreState.chats) as SpectreType[], 'TriadicCore'];
    if (systemEntities.length === 0) return;
    
    // Cycle through one entity per turn to distribute API calls
    const entityToUpdate = systemEntities[state.turn % systemEntities.length];
    
    const memory = spectreState.memory[entityToUpdate];
    if (!memory || memory.short_term_log.length === 0) return;

    dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `Consolidating memory for ${entityToUpdate}...` });
    try {
        const newMemoryParts = await summarizeSystemMemory(memory);
        setSpectreState(prevState => {
            const updatedMemory = { ...prevState.memory };
            updatedMemory[entityToUpdate] = {
                ...prevState.memory[entityToUpdate],
                ...newMemoryParts,
                short_term_log: []
            };
            return { ...prevState, memory: updatedMemory };
        });
    } catch (error) {
        console.error(`Failed to consolidate memory for ${entityToUpdate}`, error);
    }
};

export const handleFracturedEgregores = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    const fracturedEgregores = state.egregores.filter(e => e.phase === 'Fractured' || e.phase === 'Healing');
    if (fracturedEgregores.length === 0) return;

    // Find the floor object that contains the core room directly
    const coreFloor = (Object.values(state.world.floors) as Floor[]).find(f => f.rooms.some(r => r.purpose === 'TriadicCore'));
    if (!coreFloor) {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//ERROR: Triadic Core not found. Cannot initiate healing.`});
        return;
    }
    const coreRoom = coreFloor.rooms.find(r => r.purpose === 'TriadicCore')!;

    for (const egregore of fracturedEgregores) {
        // Find the floor the egregore is currently on.
        let egregoreFloor: Floor | undefined;
        for (const floor of (Object.values(state.world.floors) as Floor[])) {
            if (getRoomForVector(egregore.vector, floor)) {
                egregoreFloor = floor;
                break;
            }
        }
        
        if (!egregoreFloor || egregoreFloor.level !== coreFloor.level) {
            // Teleport the egregore to the core's floor if it's on a different floor or in an unknown location.
            dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `A fractured ${egregore.name} is teleported to the Metacosm for healing.`});
            const newVector: Vector3D = { ...coreRoom.center, z: coreRoom.level };
            dispatch({ type: 'UPDATE_EGREGORE', payload: {id: egregore.id, data: {phase: 'Healing', vector: newVector, path: [] }}});
            continue;
        }

        // At this point, the egregore is on the same floor as the core.
        const path = findPath(egregore.vector, { ...coreRoom.center, z: coreRoom.level }, coreFloor, state.options.gameplay.useAStarPathfinding);
        
        if (path) {
            dispatch({type: 'UPDATE_EGREGORE', payload: {id: egregore.id, data: {path, phase: 'Healing'}}});
            dispatch({type: 'ADD_TICKER_MESSAGE', payload: `The Metacosm escorts the fractured ${egregore.name} towards the Triadic Core for healing.`});
        } else {
             // This case is tricky. It means no path was found on the same floor.
             // This could happen if they are walled off. Teleporting might be the only option.
             dispatch({type: 'ADD_TICKER_MESSAGE', payload: `Could not find a recovery path for the fractured ${egregore.name}. Teleporting as a last resort.`});
             const newVector: Vector3D = { ...coreRoom.center, z: coreRoom.level };
             dispatch({ type: 'UPDATE_EGREGORE', payload: {id: egregore.id, data: {phase: 'Healing', vector: newVector, path: [] }}});
        }
    }
};


export const updateSystemPersonality = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    const nonCoreEgregores = state.egregores.filter(e => !e.is_core_frf);
    if (nonCoreEgregores.length === 0) return;

    const archetypeCounts = nonCoreEgregores.reduce((acc, e) => {
        acc[e.archetypeId] = (acc[e.archetypeId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const alignmentCounts = nonCoreEgregores.reduce((acc, e) => {
        const key = `${e.alignment.morality}-${e.alignment.axis}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dominantArchetype = Object.keys(archetypeCounts).reduce((a, b) => archetypeCounts[a] > archetypeCounts[b] ? a : b, 'Sage');
    const dominantAlignmentStr = Object.keys(alignmentCounts).reduce((a, b) => alignmentCounts[a] > alignmentCounts[b] ? a : b, 'Neutral-Neutral');
    
    const [morality, axis] = dominantAlignmentStr.split('-') as [AlignmentMorality, AlignmentAxis];
    const dominantAlignment = `${morality} ${axis}`;
    
    const totalCoherence = nonCoreEgregores.reduce((sum, e) => sum + e.coherence, 0);
    const averageCoherence = nonCoreEgregores.length > 0 ? (totalCoherence / nonCoreEgregores.length) / 100 : 0.8;

    const newPersonality: SystemPersonality = {
        dominant_archetype: dominantArchetype,
        dominant_alignment: dominantAlignment,
        coherence: averageCoherence,
    };

    dispatch({ type: 'UPDATE_SYSTEM_PERSONALITY', payload: newPersonality });
};

export const handleNightlyTasks = async (state: MetacosmState, dispatch: Dispatch<Action>) => {
    // 1. Dream Generation (one random Egregore per night turn to avoid rate limits)
    const dreamers = state.egregores.filter(e => !e.is_core_frf && !e.is_frozen);
    if (dreamers.length > 0) {
        const dreamer = dreamers[Math.floor(Math.random() * dreamers.length)];
        try {
            const dream = await generateDream(dreamer);
            dispatch({ type: 'ADD_PERSONAL_THOUGHT', payload: { egregoreId: dreamer.id, thought: dream } });
            dispatch({type: 'ADD_TICKER_MESSAGE', payload: `${dreamer.name} is dreaming...`});
        } catch (error) {
            console.error(`Failed to generate dream for ${dreamer.name}:`, error);
        }
    }
    
    // 2. Memory Consolidation (one random Egregore per night turn)
    if (state.turn % 2 === 0) {
       await consolidateEgregoreMemories(dispatch, state);
    }
};

export const handleSystemAttention = async (state: MetacosmState, dispatch: Dispatch<Action>) => {
    if (state.architect_attention_score <= 0) {
        try {
            const action = await generateMetacosmAction(state.system_personality);
            if (action.type === 'glitch') {
                dispatch({ type: 'TRIGGER_VISUAL_GLITCH', payload: { text: action.text, duration: 4000 } });
            } else {
                dispatch({ type: 'ADD_MESSAGE', payload: { id: generateUUID(), sender: 'Metacosm', text: action.text, timestamp: Date.now() }});
            }
            // Reset attention score after getting attention
            dispatch({ type: 'UPDATE_ARCHITECT_ATTENTION', payload: 50 });
        } catch (error) {
            console.error("Failed to generate Metacosm action:", error);
        }
    } else {
        // Decay attention score
        dispatch({ type: 'UPDATE_ARCHITECT_ATTENTION', payload: state.architect_attention_score - 1 });
    }
};

export const checkApotheosis = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    if(state.apotheosis_imminent) return; // Only one at a time

    const APOTHEOSIS_INFLUENCE_THRESHOLD = 10000;
    const candidate = state.egregores.find(e => 
        !e.is_core_frf && 
        e.influence >= APOTHEOSIS_INFLUENCE_THRESHOLD
    );

    if (candidate) {
        dispatch({ type: 'SET_APOTHEOSIS_IMMINENT', payload: candidate.id });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `Apotheosis Imminent: ${candidate.name} has accumulated immense influence and is poised to transcend!` });
    }
};

export const checkFactionLeaders = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    state.factions.forEach(faction => {
        const leader = state.egregores.find(e => e.id === faction.leader);
        if (!leader || leader.phase === 'Fractured') {
            const potentialLeaders = faction.members
                .map(id => state.egregores.find(e => e.id === id))
                .filter(e => e && e.phase !== 'Fractured') as Egregore[];
            
            if (potentialLeaders.length > 0) {
                const newLeader = potentialLeaders.sort((a, b) => b.influence - a.influence)[0];
                dispatch({ type: 'UPDATE_FACTION', payload: { id: faction.id, data: { leader: newLeader.id } } });
                dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `${newLeader.name} has assumed leadership of the ${faction.name}.` });
                
                // If a paradox about this faction's leadership exists, resolve it.
                const relatedParadox = state.paradoxes.find(p => p.subjectId === faction.id && p.status === 'active');
                if (relatedParadox) {
                    dispatch({ type: 'RESOLVE_PARADOX', payload: { id: relatedParadox.id, resolution: `Promoted ${newLeader.name} to leader.`, resolved_by: 'System' } });
                }

            } else {
                // If no eligible leaders, the faction might disband or go dormant. For now, we'll just log it.
                dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `The ${faction.name} is without a viable leader and has fallen into disarray!` });
            }
        }
    });
};

export const processPocketWorkshops = (state: MetacosmState, dispatch: Dispatch<Action>) => {
    state.pocket_workshops.forEach(workshop => {
        if (state.turn >= workshop.expirationTurn) {
            dispatch({ type: 'EMPTY_WORKSHOP_STASH', payload: workshop.id });
            dispatch({ type: 'DESTROY_POCKET_WORKSHOP', payload: workshop.id });
            const owner = state.egregores.find(e => e.id === workshop.ownerId);
            if (owner && owner.phase === 'InWorkshop') {
                 dispatch({ type: 'UPDATE_EGREGORE', payload: { id: owner.id, data: { phase: 'Dormant' } } });
            }
        }
    });
};

export function runSystemLocus(state: MetacosmState, dispatch: Dispatch<Action>) {
    const locusState = runLocusService(state);
    dispatch({ type: 'SET_STATE', payload: { system_locus: locusState } });
}