
import type { SaveSlot } from '@/types';
import type { MetacosmState } from '@/types/state';
import { generateUUID } from '../utils';
import { migrateState } from './migrationService';

const SAVE_SLOTS_KEY = 'metacosm_save_slots';
const SAVE_SLOT_PREFIX = 'metacosm_save_';

// Helper to get all save slots from localStorage
export function getSaveSlots(): SaveSlot[] {
    try {
        const slotsJson = localStorage.getItem(SAVE_SLOTS_KEY);
        return slotsJson ? JSON.parse(slotsJson) : [];
    } catch (e) {
        console.error("Failed to parse save slots:", e);
        return [];
    }
}

// Helper to save all save slots to localStorage
function setSaveSlots(slots: SaveSlot[]): void {
    try {
        localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
    } catch (e) {
        console.error("Continuity Manifest Error: Failed to write save slots to persistent memory.", e);
    }
}

// Checks if any save games exist
export function hasSaves(): boolean {
    return getSaveSlots().length > 0;
}

// Loads a game state from a specific slot ID
export function loadFromSlot(id: string): Partial<MetacosmState> | null {
    try {
        const slotDataJson = localStorage.getItem(`${SAVE_SLOT_PREFIX}${id}`);
        if (slotDataJson) {
            const loadedState = JSON.parse(slotDataJson);
            return migrateState(loadedState);
        }
        return null;
    } catch (e) {
        console.error(`Failed to load or parse save slot ${id}:`, e);
        return null;
    }
}

// Loads the most recent save game
export function loadLatestState(): Partial<MetacosmState> | null {
    const slots = getSaveSlots();
    if (slots.length === 0) return null;
    
    slots.sort((a, b) => b.timestamp - a.timestamp);
    const latestSlot = slots[0];
    return loadFromSlot(latestSlot.id);
}

// Creates a new save file
export function createNewSave(state: MetacosmState, name: string): void {
    const newSlot: SaveSlot = {
        id: generateUUID(),
        name,
        timestamp: Date.now(),
        turn: state.turn,
        egregoreCount: state.egregores.filter(e => !e.is_metacosm_core).length,
        factionCount: state.factions.length,
    };

    // Sanitize state before saving (remove non-serializable parts)
    const stateToSave = {
        ...state,
        egregores: state.egregores.map(e => ({ ...e, chat: null, state: null, path: [] }))
    };

    localStorage.setItem(`${SAVE_SLOT_PREFIX}${newSlot.id}`, JSON.stringify(stateToSave));
    
    const slots = getSaveSlots();
    slots.push(newSlot);
    setSaveSlots(slots);
}

// Overwrites an existing save file
export function overwriteSave(id: string, state: MetacosmState): void {
    const slots = getSaveSlots();
    const slotIndex = slots.findIndex(s => s.id === id);
    if (slotIndex === -1) {
        console.error(`Save slot with id ${id} not found for overwrite.`);
        return;
    }

    slots[slotIndex].timestamp = Date.now();
    slots[slotIndex].turn = state.turn;
    slots[slotIndex].egregoreCount = state.egregores.filter(e => !e.is_metacosm_core).length;
    slots[slotIndex].factionCount = state.factions.length;

    // Sanitize state
    const stateToSave = {
        ...state,
        egregores: state.egregores.map(e => ({ ...e, chat: null, state: null, path: [] }))
    };

    localStorage.setItem(`${SAVE_SLOT_PREFIX}${id}`, JSON.stringify(stateToSave));
    setSaveSlots(slots);
}

// Deletes a save file
export function deleteSave(id: string): void {
    const slots = getSaveSlots();
    const updatedSlots = slots.filter(s => s.id !== id);
    setSaveSlots(updatedSlots);
    localStorage.removeItem(`${SAVE_SLOT_PREFIX}${id}`);
}
