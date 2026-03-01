
import type { GameOptions } from '@/types';
import { mergeDeep } from '../utils';

const OPTIONS_KEY = 'metacosm_game_options_v1';

export const defaultOptions: GameOptions = {
    graphics: {
        quality: 'High',
        particleEffects: true,
        postProcessing: true,
    },
    audio: {
        master: 80,
        sfx: 100,
        music: 60,
    },
    gameplay: {
        useAStarPathfinding: false,
        showTurnTimer: true,
        autoSave: false,
    }
};

export const saveOptions = (options: GameOptions): void => {
    try {
        localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
    } catch (e) {
        console.error("Failed to save options:", e);
    }
};

export const loadOptions = (): GameOptions => {
    try {
        const stored = localStorage.getItem(OPTIONS_KEY);
        if (stored) {
            // Merge stored options with defaults to handle new options being added over time
            return mergeDeep(defaultOptions, JSON.parse(stored));
        }
    } catch (e) {
        console.error("Failed to load options:", e);
    }
    return defaultOptions;
};
