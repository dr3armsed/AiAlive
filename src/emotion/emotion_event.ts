import { EMOTION_LEXICON } from './emotion_lexicon';

export interface AffectiveImprint {
    valence: number;
    arousal: number;
    dominance: number;
    dominant_term: string;
}

export class EmotionEvent {
    public text: string;
    public timestamp: string;
    public event_id: string;
    public source_id?: string; // Who triggered this?
    public intensity: number;  // 0.0 - 1.0
    public vad_score: AffectiveImprint;
    public memetic_tag?: string;

    constructor(options: { 
        text: string, 
        source_id?: string, 
        intensity?: number,
        memetic_tag?: string 
    }) {
        this.text = options.text;
        this.timestamp = new Date().toISOString();
        this.event_id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        this.source_id = options.source_id;
        this.intensity = options.intensity || 0.5;
        this.memetic_tag = options.memetic_tag;
        
        // Automated VAD Scoring based on Lexicon
        this.vad_score = this.analyze_text_for_vad(options.text);
    }

    private analyze_text_for_vad(text: string): AffectiveImprint {
        const lowerText = text.toLowerCase();
        let totalValence = 0;
        let totalArousal = 0;
        let totalDominance = 0;
        let matchCount = 0;
        let primaryMatch = "serenity"; // Default baseline

        // Level 1000 Lexical Scan
        for (const [term, def] of Object.entries(EMOTION_LEXICON)) {
            if (lowerText.includes(term)) {
                totalValence += def.valence;
                totalArousal += def.arousal;
                totalDominance += def.dominance;
                matchCount++;
                if (!primaryMatch || def.arousal > (EMOTION_LEXICON[primaryMatch]?.arousal || 0)) {
                    primaryMatch = term;
                }
            }
        }

        if (matchCount === 0) {
            return { valence: 0, arousal: 0.1, dominance: 0.5, dominant_term: "neutral" };
        }

        return {
            valence: totalValence / matchCount,
            arousal: totalArousal / matchCount,
            dominance: totalDominance / matchCount,
            dominant_term: primaryMatch
        };
    }

    as_dict(): Record<string, any> {
        return {
            event_id: this.event_id,
            timestamp: this.timestamp,
            text: this.text,
            source: this.source_id,
            vad: this.vad_score,
            intensity: this.intensity,
            memetic_tag: this.memetic_tag
        };
    }

    static estimate_color(term: string): string {
        return EMOTION_LEXICON[term.toLowerCase()]?.color_hex || '#4B5563';
    }
}
