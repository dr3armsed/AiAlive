import type { SpectreState, SpectreType, SystemEntityMemory, ChatMessage } from '@/types';
import { SPECTRE_PROMPTS } from './prompts';

const SPECTRE_STATE_KEY = 'metacosm_spectre_state_v1';

export const getInitialSpectreState = (): SpectreState => {
    const SPECTRE_TYPES: SpectreType[] = Object.keys(SPECTRE_PROMPTS) as SpectreType[];
    
    const initialMemory: Record<SpectreType | 'TriadicCore', SystemEntityMemory> = {
        ...SPECTRE_TYPES.reduce((acc, type) => {
            acc[type] = { short_term_log: [], medium_term_summary: '', long_term_narrative: '' };
            return acc;
        }, {} as Record<SpectreType, SystemEntityMemory>),
        TriadicCore: { short_term_log: [], medium_term_summary: '', long_term_narrative: '' },
    };
    
    const initialChats: Record<SpectreType | 'TriadicCore', ChatMessage[]> = {
         ...SPECTRE_TYPES.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as Record<SpectreType, ChatMessage[]>),
        TriadicCore: [],
    };

    return {
        memory: initialMemory,
        chats: initialChats,
        sharedFiles: [],
    };
};

export const loadSpectreState = (): SpectreState => {
    try {
        const storedState = localStorage.getItem(SPECTRE_STATE_KEY);
        if (storedState) {
            // Merge with initial state to ensure all keys are present if the state shape changes
            const loaded = JSON.parse(storedState);
            const defaults = getInitialSpectreState();
            return {
                ...defaults,
                ...loaded,
                chats: { ...defaults.chats, ...loaded.chats },
                memory: { ...defaults.memory, ...loaded.memory },
            };
        }
    } catch (e) {
        console.error("Failed to load spectre state:", e);
    }
    return getInitialSpectreState();
};

export const saveSpectreState = (state: SpectreState) => {
    try {
        localStorage.setItem(SPECTRE_STATE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save spectre state:", e);
    }
};