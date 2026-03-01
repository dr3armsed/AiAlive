import { Dispatch } from 'react';
import type { Action, Egregore, SpectreState, CreativeWork } from '@/types';
import type { MetacosmState } from '@/types/state';
import { processEgregoreTurn, processWorkshopTurn } from './processEgregoreTurn';
import {
    detectAndLogParadoxes,
    runSystemScanners,
    handleFracturedEgregores,
    updateSystemPersonality,
    consolidateSystemMemories,
    checkApotheosis,
    handleSystemAttention,
    handleNightlyTasks,
    checkFactionLeaders,
    processPocketWorkshops,
    processContinuityTasks,
    runSystemLocus
} from './systemTasks';
import { shuffleArray } from './helpers';
import { generateReflectionOutcome } from '@/services/geminiService';
import { generateUUID } from '@/utils';

const EGREGORES_PROCESSED_PER_TURN = 3;

/**
 * The main orchestrator for a single game turn.
 */
export const gameTurn = async (getState: () => MetacosmState, dispatch: Dispatch<Action>, spectreState: SpectreState, setSpectreState: React.Dispatch<React.SetStateAction<SpectreState>>) => {
    // --- Pre-Turn System Checks ---
    detectAndLogParadoxes(getState(), dispatch);
    dispatch({ type: 'ADVANCE_TURN' });

    // Use a locally scoped reference to the latest state after the turn advance action
    const state = getState();

    // Increment age for all egregores
    state.egregores.forEach(egregore => {
        dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { age: (egregore.age || 0) + 1 } } });
    });


    // --- Phase-Dependent Logic ---
    if (state.world_phase === 'Day') {
        // Unfreeze any frozen Egregores
        const frozenEgregore = state.egregores.find(e => e.is_frozen);
        if (frozenEgregore) {
            dispatch({ type: 'UPDATE_EGREGORE', payload: { id: frozenEgregore.id, data: { is_frozen: false } } });
            dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `The stasis field around ${frozenEgregore.name} has dissipated.` });
        }

        // Process a subset of active Egregores
        const activeEgregoreIds = shuffleArray(
            state.egregores
                .filter(e => !e.is_frozen && e.phase !== 'DeepReflection' && e.phase !== 'InWorkshop')
                .map(e => e.id)
        );
        const egregoresToProcessThisTurn = activeEgregoreIds.slice(0, EGREGORES_PROCESSED_PER_TURN);

        for (const id of egregoresToProcessThisTurn) {
            const stateForThisEgregore = getState();
            const egregoreToProcess = stateForThisEgregore.egregores.find(e => e.id === id);
            if (egregoreToProcess) {
                await processEgregoreTurn(egregoreToProcess, stateForThisEgregore, dispatch);
                await new Promise(resolve => setTimeout(resolve, 500)); // Stagger API calls
            }
        }

        // Process Egregores in Workshops
        const workshopEgregores = state.egregores.filter(e => e.phase === 'InWorkshop');
        for (const egregore of workshopEgregores) {
            const workshop = state.pocket_workshops.find(w => w.ownerId === egregore.id);
            if (workshop) {
                 await processWorkshopTurn(egregore, workshop, state, dispatch);
                 await new Promise(resolve => setTimeout(resolve, 500)); // Stagger API calls
            }
        }
        
        // Process Egregores in Deep Reflection
        const reflectingEgregores = state.egregores.filter(e => e.phase === 'DeepReflection');
        for (const egregore of reflectingEgregores) {
            const turnsLeft = (egregore.reflection_turns_left || 1) - 1;
            if (turnsLeft <= 0) {
                const outcome = await generateReflectionOutcome(egregore, egregore.reflection_investment || 0);
                if (outcome.epiphany_text) dispatch({ type: 'ADD_PERSONAL_THOUGHT', payload: { egregoreId: egregore.id, thought: { id: generateUUID(), type: 'Epiphany', context: 'Waking', content: outcome.epiphany_text, timestamp: Date.now() } } });
                if (outcome.quintessence_bonus) dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { quintessence: egregore.quintessence + outcome.quintessence_bonus } } });
                if (outcome.influence_bonus) dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { influence: egregore.influence + outcome.influence_bonus } } });
                if (outcome.work) {
                    const newWork: CreativeWork = {
                        ...outcome.work,
                        id: generateUUID(),
                        timestamp: Date.now(),
                    };
                    dispatch({ type: 'ADD_CREATIVE_WORK', payload: { egregoreId: egregore.id, work: newWork } });
                }
                if (outcome.new_paradigm) dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { paradigms: [...egregore.paradigms, {...outcome.new_paradigm, id: generateUUID()}] } } });
                if (outcome.quintessence_lost) dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { quintessence: Math.max(0, egregore.quintessence - outcome.quintessence_lost) } } });
                if (outcome.fissure_thought) dispatch({ type: 'ADD_PERSONAL_THOUGHT', payload: { egregoreId: egregore.id, thought: { id: generateUUID(), type: 'Fissure', context: 'Waking', content: outcome.fissure_thought, timestamp: Date.now() } } });
                if (outcome.vision) dispatch({ type: 'UPDATE_ROOM', payload: { floorLevel: egregore.vector.z, roomId: outcome.vision.roomId, data: { purpose: outcome.vision.newPurpose } }});

                dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { phase: 'Dormant', reflection_turns_left: 0, reflection_investment: 0 } } });
            } else {
                dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { reflection_turns_left: turnsLeft } } });
            }
        }

    } else { // Night Phase
        await handleNightlyTasks(getState(), dispatch);
    }

    // --- Post-Turn System Checks ---
    const endTurnState = getState();
    runSystemLocus(endTurnState, dispatch);
    if (endTurnState.turn % 5 === 0) runSystemScanners(endTurnState, dispatch);
    if (endTurnState.turn % 2 === 0) {
        handleFracturedEgregores(endTurnState, dispatch);
        processContinuityTasks(endTurnState, dispatch);
        processPocketWorkshops(endTurnState, dispatch);
    }
    if (endTurnState.turn % 3 === 0) {
        updateSystemPersonality(endTurnState, dispatch);
        await consolidateSystemMemories(dispatch, state, spectreState, setSpectreState);
    }
    if (endTurnState.turn % 10 === 0) checkFactionLeaders(endTurnState, dispatch);

    checkApotheosis(endTurnState, dispatch);
    handleSystemAttention(endTurnState, dispatch);
};