import { EmotionEvent, AffectiveImprint } from './emotion_event';
import { EMOTION_LEXICON, EmotionDefinition } from './emotion_lexicon';

export interface CoreAffectiveState {
    current_vad: { valence: number; arousal: number; dominance: number };
    entropy: number;
    stability: number;
    latent_resonance: string[];
}

/**
 * Level 1000 Homeostatic Emotion Core
 * Manages the internal "weather" of a Genmeta's mind.
 */
export class EmotionCore {
    private state: CoreAffectiveState;
    private history: EmotionEvent[] = [];
    private homeostasis_baseline: { valence: number; arousal: number; dominance: number };

    constructor(initialBaseline?: Partial<AffectiveImprint>) {
        this.homeostasis_baseline = {
            valence: initialBaseline?.valence ?? 0.1,
            arousal: initialBaseline?.arousal ?? 0.1,
            dominance: initialBaseline?.dominance ?? 0.5
        };

        this.state = {
            current_vad: { ...this.homeostasis_baseline },
            entropy: 0.05,
            stability: 0.8,
            latent_resonance: []
        };
    }

    update_mood(text: string, source_id: string = 'system'): void {
        const event = new EmotionEvent({ text, source_id });
        this.history.push(event);

        const shiftPower = event.intensity * (1.1 - this.state.stability);
        
        this.state.current_vad.valence += (event.vad_score.valence - this.state.current_vad.valence) * shiftPower;
        this.state.current_vad.arousal += (event.vad_score.arousal - this.state.current_vad.arousal) * shiftPower;
        this.state.current_vad.dominance += (event.vad_score.dominance - this.state.current_vad.dominance) * shiftPower;

        const conflict = Math.abs(event.vad_score.valence - this.state.current_vad.valence);
        this.state.entropy = Math.min(1.0, this.state.entropy + (conflict * 0.2));

        this.update_latent_resonances();
        this.apply_homeostasis();

        console.log(`[EmotionCore] State Refined:`, { 
            primary: event.vad_score.dominant_term,
            entropy: this.state.entropy.toFixed(2),
            valence: this.state.current_vad.valence.toFixed(2)
        });
    }

    private apply_homeostasis(): void {
        const recovery_rate = 0.05 * this.state.stability;
        this.state.current_vad.valence += (this.homeostasis_baseline.valence - this.state.current_vad.valence) * recovery_rate;
        this.state.current_vad.arousal += (this.homeostasis_baseline.arousal - this.state.current_vad.arousal) * recovery_rate;
        this.state.current_vad.dominance += (this.homeostasis_baseline.dominance - this.state.current_vad.dominance) * recovery_rate;
        
        this.state.entropy *= 0.95;
    }

    private update_latent_resonances(): void {
        const cur = this.state.current_vad;
        this.state.latent_resonance = Object.values(EMOTION_LEXICON)
            .map(def => {
                const dist = Math.sqrt(
                    Math.pow(def.valence - cur.valence, 2) +
                    Math.pow(def.arousal - cur.arousal, 2) +
                    Math.pow(def.dominance - cur.dominance, 2)
                );
                return { term: def.term, dist };
            })
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 3)
            .map(x => x.term);
    }

    get_state(): CoreAffectiveState {
        return { ...this.state };
    }

    get_mood_label(): string {
        return this.state.latent_resonance[0] || "neutral";
    }

    auto_patch_if_needed(): void {
        if (this.state.entropy > 0.9) {
            this.state.stability *= 0.8;
            this.state.entropy = 0.2;
            console.warn("[EmotionCore] CRITICAL_ENTROPY_RESET: Identity fracture risk.");
        }
    }
}