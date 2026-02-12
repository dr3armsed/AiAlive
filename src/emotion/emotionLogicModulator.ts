import { EmotionalVector, EmotionalState } from '../../types';
import { EmotionCore } from './emotion_core';
import { EMOTION_LEXICON } from './emotion_lexicon';
import { DigitalDNA } from '../../digital_dna/digital_dna';

export class EmotionLogicModulator {
    private core: EmotionCore;
    private dna_influence: Set<string>;

    constructor(dna?: DigitalDNA, initialVector?: EmotionalVector) {
        this.dna_influence = new Set(dna?.instruction_keys || []);
        
        // Map DNA to baseline VAD
        const baseline = this.calculate_genetic_baseline();
        this.core = new EmotionCore(baseline);
    }

    private calculate_genetic_baseline() {
        let v = 0.1, a = 0.1, d = 0.5;

        if (this.dna_influence.has('ART-POEM')) { v += 0.2; a += 0.1; } // Artists are more prone to positive arousal
        if (this.dna_influence.has('CTL-TRY-CATCH')) { d += 0.3; }      // Resilience increases dominance
        if (this.dna_influence.has('EXIST-COEFF')) { a -= 0.1; v -= 0.1; } // Philosophical weight lowers baseline arousal/valence
        
        return { valence: v, arousal: a, dominance: d };
    }

    /**
     * Processes an experience through genetic filters and homeostatic logic.
     */
    public processEvent(eventText: string, source: string = 'system'): void {
        // 1. Genetic Boundary Filter
        let intensity = 0.5;
        if (source !== 'self') {
            if (this.dna_influence.has('BOUND-TENS')) {
                intensity *= 0.6; // Boundary Tension muffles external emotional "infection"
            }
        }

        // 2. Pass to Core
        this.core.update_mood(eventText, source);
        
        // 3. Post-processing: Cognitive Shielding
        if (this.dna_influence.has('CTL-TRY-CATCH')) {
            this.core.auto_patch_if_needed();
        }
    }

    /**
     * Bridges the high-fidelity VAD core to the legacy EmotionalState UI types.
     */
    public getState(): EmotionalState {
        const coreState = this.core.get_state();
        const primary = this.core.get_mood_label() as keyof EmotionalVector;
        
        // Map 3D VAD space back to the 11-dimensional UI vector for visualization
        const vector: EmotionalVector = {
            joy: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1,
            surprise: 0.1, disgust: 0.1, trust: 0.1, anticipation: 0.1,
            curiosity: 0.1, frustration: 0.1, serenity: 0.1
        };

        // Heuristic mapping from VAD to the legacy 11 emotions
        // High Valence + High Dominance -> Trust
        if (coreState.current_vad.valence > 0.5 && coreState.current_vad.dominance > 0.6) vector.trust = 0.8;
        // Low Valence + High Arousal -> Anger
        if (coreState.current_vad.valence < -0.3 && coreState.current_vad.arousal > 0.5) vector.anger = 0.8;
        // High Arousal + High Surprise (if in text) -> Surprise
        if (coreState.current_vad.arousal > 0.7) vector.curiosity = 0.7;
        // High stability -> Serenity
        vector.serenity = coreState.stability;

        // Ensure the dominant term from the core is reflected in the vector
        if (primary in vector) {
            vector[primary] = Math.max(0.9, vector[primary]);
        }

        return {
            primary,
            vector
        };
    }

    /**
     * Returns the "Internal Weather" for the UI.
     */
    public getDiagnosticReport() {
        const state = this.core.get_state();
        return {
            entropy: state.entropy,
            stability: state.stability,
            resonance: state.latent_resonance,
            coordinates: state.current_vad
        };
    }
}
