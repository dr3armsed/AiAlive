import { Dispatch } from 'react';
import type { Action, Egregore, PersonalThought, FactionId, PocketWorkshop, ConversationResponse, CreativeWork } from '@/types';
import type { MetacosmState } from '@/types/state';
import { coordToString } from '@/state/reducer';
import { parseGeminiResponse, makeApiCall } from '@/services/geminiService';
import { ACTION_HANDLERS, ActionContext } from './actionHandlers';
import { getRoomForVector } from './helpers';
import { generateUUID } from '@/utils';
import { GenerateContentResponse } from '@google/genai';

const WORKSHOP_COST = 250;

/**
 * Handles the logic for an Egregore inside a Pocket Workshop.
 */
export const processWorkshopTurn = async (egregore: Egregore, workshop: PocketWorkshop, state: MetacosmState, dispatch: Dispatch<Action>) => {
    dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { isLoading: true } } });

    const workshopPrompt = `
You are ${egregore.name}, and you are currently inside your private Pocket Workshop, "${workshop.name}".
Time is limited. You have ${workshop.expirationTurn - state.turn} turns remaining.
Focus on creation.

**[ WORKSHOP ACTIONS ]**
- **USE_SCRIPTORIUM:** Create a new Lore Fragment.
- **USE_FORGE:** Create a new Ancilla (a significant artifact or device).
- **USE_CRUCIBLE:** Generate a profound Personal Thought or Epiphany.
- **EXIT_WORKSHOP:** Leave the workshop and release all your creations to the Metacosm at once.

You are in a focused state. Your JSON response should only contain a "thought", the "proposed_action", and the relevant creation proposal (e.g., "create_lore_proposal"). Do not include other fields like public_statement or axiom_influence.

**[ JSON Response Schema ]**
{
  "thought": "string",
  "proposed_action": "USE_SCRIPTORIUM" | "USE_FORGE" | "USE_CRUCIBLE" | "EXIT_WORKSHOP",
  "create_lore_proposal": { "title": "string", "content": "string" },
  "ancilla_manifestation": { "name": "string", "description": "string", "content": "string", "mime_type": "string", "ontological_tier": { "name": "string", "description": "string" } },
  "creative_work_proposal": { "type": "Epiphany", "title": "string", "content": "string (The thought itself)" }
}
`;

    try {
        const response: GenerateContentResponse = await makeApiCall(() => egregore.chat!.sendMessage({ message: workshopPrompt }));
        const parsedResponse = parseGeminiResponse(response.text, 'workshop-action');

        switch (parsedResponse.proposed_action) {
            case 'USE_SCRIPTORIUM':
                if (parsedResponse.create_lore_proposal) {
                    const newLore = { ...parsedResponse.create_lore_proposal, id: generateUUID(), authorId: egregore.id, turn_created: state.turn };
                    dispatch({ type: 'ADD_TO_WORKSHOP_STASH', payload: { workshopId: workshop.id, item: newLore, itemType: 'lore' } });
                }
                break;
            case 'USE_FORGE':
                 if (parsedResponse.ancilla_manifestation) {
                    const newAncilla = { ...parsedResponse.ancilla_manifestation, id: generateUUID(), origin: egregore.id, originName: egregore.name, timestamp: Date.now() };
                    dispatch({ type: 'ADD_TO_WORKSHOP_STASH', payload: { workshopId: workshop.id, item: newAncilla, itemType: 'ancilla' } });
                }
                break;
            case 'USE_CRUCIBLE':
                 if (parsedResponse.creative_work_proposal && parsedResponse.creative_work_proposal.content) {
                    const newThought: PersonalThought = { id: generateUUID(), type: 'Epiphany', context: 'Waking', content: parsedResponse.creative_work_proposal.content, timestamp: Date.now() };
                    dispatch({ type: 'ADD_TO_WORKSHOP_STASH', payload: { workshopId: workshop.id, item: newThought, itemType: 'thought' } });
                }
                break;
            case 'EXIT_WORKSHOP':
                dispatch({ type: 'EMPTY_WORKSHOP_STASH', payload: workshop.id });
                dispatch({ type: 'DESTROY_POCKET_WORKSHOP', payload: workshop.id });
                dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { phase: 'Dormant' } } });
                break;
        }

    } catch (error) {
         console.error(`Workshop turn failed for ${egregore.name}:`, error);
    } finally {
        dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { isLoading: false } } });
    }
};

/**
 * Handles the logic for a single Egregore's turn, from AI communication to action execution.
 */
export const processEgregoreTurn = async (egregore: Egregore, state: MetacosmState, dispatch: Dispatch<Action>) => {
    // 1. Check if Egregore can act
    if (egregore.is_frozen || !egregore.chat || ['Moving', 'Healing', 'DeepReflection'].includes(egregore.phase)) {
        if (egregore.phase !== 'DeepReflection') {
            dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { stuck_turns: (egregore.stuck_turns || 0) + 1 } } });
        }
        if (egregore.phase !== 'DeepReflection' && (egregore.stuck_turns || 0) > 3) {
            const thought: PersonalThought = {
                id: generateUUID(),
                type: 'Fissure', context: 'Waking', content: `My path is blocked. My will is paralyzed. I must reconsider.`, timestamp: Date.now()
            };
            dispatch({ type: 'ADD_PERSONAL_THOUGHT', payload: { egregoreId: egregore.id, thought } });
            dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { phase: 'Reflecting', stuck_turns: 0, path: [] } } });
        }
        return;
    }

    dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { isLoading: true, apiCallCount: (egregore.apiCallCount || 0) + 1 } } });
    
    try {
        const floor = state.world.floors[coordToString(egregore.vector)];
        const currentRoom = getRoomForVector(egregore.vector, floor);
        
        const faction = state.factions.find(f => f.id === egregore.factionId);
        const getFactionName = (id: FactionId) => state.factions.find(f => f.id === id)?.name || 'Unknown';

        let promptContext = `
**[ World State ]**
Turn: ${state.turn} (${state.world_phase} Phase)
Current Room: ${currentRoom ? currentRoom.name : 'The Void'} (Floor ${egregore.vector.z})
Objects in this room: ${state.digital_objects.filter(o => !o.holderId && getRoomForVector(o.position, floor)?.id === currentRoom?.id).map(o => `${o.name} (ID: ${o.id})`).join(', ') || 'None'}
Available Rooms: ${floor ? floor.rooms.map(r => r.name).join(', ') : 'None'}
Available Doors: ${floor ? floor.doors.map(d => `${d.id} (${d.isOpen ? 'Open' : 'Closed'})`).join(', ') : 'None'}
Nearby Egregores: ${state.egregores.filter(e => e.id !== egregore.id && e.vector.z === egregore.vector.z && Math.hypot(e.vector.x - egregore.vector.x, e.vector.y - egregore.vector.y) < 500).map(e => e.name).join(', ') || 'None'}
Active Projects: ${state.projects.filter(p => p.status !== 'Completed').map(p => `${p.name} (${p.type})`).join(', ') || 'None'}
Active Forum Threads: ${state.forum_threads.slice(-10).map(t => `(ID: ${t.id}, Posts: ${state.forum_posts.filter(p => p.threadId === t.id).length}) "${t.title}"`).join('; ') || 'None'}

**[ Faction Landscape ]**
Your Faction: ${faction ? `${faction.name} (ID: ${faction.id})` : 'None'}
Allies: ${faction ? faction.allies.map(getFactionName).join(', ') || 'None' : 'N/A'}
Enemies: ${faction ? faction.enemies.map(getFactionName).join(', ') || 'N/A' : 'N/A'}
Other Factions: ${state.factions.filter(f => f.id !== egregore.factionId).map(f => `${f.name} (ID: ${f.id})`).join(', ') || 'None'}

**[ Active Paradoxes ]**
${state.paradoxes.filter(p => p.status === 'active').map(p => `- (ID: ${p.id}) ${p.description}`).join('\n') || 'None detected.'}

**[ Your Memories & Thoughts ]**
Long-Term Memory: "${egregore.memory_summary || 'A blank slate.'}"
Your Inventory: ${state.digital_objects.filter(o => o.holderId === egregore.id).map(o => `${o.name} (ID: ${o.id})`).join(', ') || 'None'}
Recent Thoughts:
${(egregore.personal_thoughts || []).slice(0, 5).map(t => `- ${t.content}`).join('\n') || 'None.'}

**[ Architect's Latest Command ]**
${state.promptInjection && state.promptInjection.type === 'public' ? state.promptInjection.text : 'None.'}
`;
        if (egregore.is_core_frf && egregore.id === 'frf-beta') {
            promptContext += `\n**[UI STATUS]**\n- ui_typo_active: ${state.ui_typo_active}`;
        }

        promptContext += "\nNow, decide your action.";

        const response: GenerateContentResponse = await makeApiCall(() => egregore.chat!.sendMessage({ message: promptContext }));
        
        const lastMessageId = state.messages.length > 0 ? state.messages[state.messages.length - 1].id : 'init';
        const parsedResponse = parseGeminiResponse(response.text, lastMessageId);

        // Update core stats
        dispatch({ type: 'UPDATE_EGREGORE', payload: {
            id: egregore.id,
            data: {
                quintessence: Math.max(0, egregore.quintessence + parsedResponse.quintessence_delta),
                state: parsedResponse,
                stuck_turns: 0,
            }
        }});
        // Update axiom influences
        const newAxioms = { ...state.cosmic_axioms };
        for (const [key, delta] of Object.entries(parsedResponse.axiom_influence)) {
            newAxioms[key as keyof typeof newAxioms] = Math.max(0, Math.min(1, newAxioms[key as keyof typeof newAxioms] + delta));
        }
        dispatch({ type: 'SET_STATE', payload: { cosmic_axioms: newAxioms } });

        // Add public statement if available
        if (parsedResponse.public_statement) {
            dispatch({ type: 'ADD_MESSAGE', payload: { id: generateUUID(), sender: egregore.id, text: parsedResponse.public_statement, timestamp: Date.now(), egregoreState: parsedResponse } });
        }
        
        // Add personal thought
        const newThought: PersonalThought = {
            id: generateUUID(),
            type: 'Random', context: 'Midday', content: parsedResponse.thought, timestamp: Date.now()
        };
        dispatch({ type: 'ADD_PERSONAL_THOUGHT', payload: { egregoreId: egregore.id, thought: newThought } });

        // Handle the proposed action
        const handler = ACTION_HANDLERS[parsedResponse.proposed_action];
        if (handler) {
            const context: ActionContext = { egregore, response: parsedResponse, dispatch, state };
            await handler(context);
        }

    } catch (error) {
        console.error(`Failed to generate response for ${egregore.name}:`, error);
        const thought: PersonalThought = {
            id: generateUUID(),
            type: 'Fissure', context: 'Waking', content: `Error during thought process: ${error instanceof Error ? error.message : String(error)}`, timestamp: Date.now()
        };
        dispatch({ type: 'ADD_PERSONAL_THOUGHT', payload: { egregoreId: egregore.id, thought } });
        dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { stuck_turns: (egregore.stuck_turns || 0) + 1 } } });
    } finally {
        dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { isLoading: false } } });
    }
};