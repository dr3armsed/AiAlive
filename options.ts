export type GraphicsQuality = 'Low' | 'Medium' | 'High';

export interface GameOptions {
    graphics: {
        quality: GraphicsQuality;
        particleEffects: boolean;
        postProcessing: boolean;
    };
    audio: {
        master: number; // 0-100
        sfx: number;
        music: number;
    };
    gameplay: {
        useAStarPathfinding: boolean;
        showTurnTimer: boolean;
        autoSave: boolean;
    };
}
