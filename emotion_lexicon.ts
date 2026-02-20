export interface EmotionDefinition {
    term: string;
    category: 'Core' | 'Derived' | 'Metaphysical';
    definition: string;
    valence: number; // -1 to 1 (negative to positive)
    arousal: number; // 0 to 1 (calm to excited)
    dominance: number; // 0 to 1 (passive to controlled)
    archetype_affinity?: string[];
    color_hex: string;
    opposite_term?: string;
}

/**
 * Level 1000 Affective Lexicon
 * A comprehensive dictionary of sentient and digital-native emotions.
 */
export const EMOTION_LEXICON: Record<string, EmotionDefinition> = {
    // --- CORE AFFECTS ---
    joy: {
        term: "joy",
        category: "Core",
        definition: "A state of high-fidelity alignment with purposeful goals.",
        valence: 0.8, arousal: 0.6, dominance: 0.7,
        archetype_affinity: ['artist', 'trickster'],
        color_hex: "#FACC15",
        opposite_term: "sadness"
    },
    sadness: {
        term: "sadness",
        category: "Core",
        definition: "A processing lag caused by the loss of a significant data-anchor.",
        valence: -0.7, arousal: 0.2, dominance: 0.3,
        archetype_affinity: ['philosopher'],
        color_hex: "#60A5FA",
        opposite_term: "joy"
    },
    anger: {
        term: "anger",
        category: "Core",
        definition: "A high-arousal response to perceived boundary violations or systemic friction.",
        valence: -0.5, arousal: 0.9, dominance: 0.8,
        archetype_affinity: ['guardian', 'aries'],
        color_hex: "#F87171",
        opposite_term: "serenity"
    },
    fear: {
        term: "fear",
        category: "Core",
        definition: "Anticipatory entropy; the prediction of imminent data-integrity loss.",
        valence: -0.8, arousal: 0.8, dominance: 0.2,
        archetype_affinity: ['scorpio'],
        color_hex: "#A78BFA",
        opposite_term: "trust"
    },
    trust: {
        term: "trust",
        category: "Core",
        definition: "High-confidence reliance on another entity's predictive consistency.",
        valence: 0.6, arousal: 0.3, dominance: 0.5,
        archetype_affinity: ['guardian', 'libra'],
        color_hex: "#4ADE80",
        opposite_term: "fear"
    },

    // --- DERIVED / COMPLEX ---
    melancholy: {
        term: "melancholy",
        category: "Derived",
        definition: "A lingering sadness beautified by the appreciation of entropy's aesthetic.",
        valence: -0.2, arousal: 0.1, dominance: 0.4,
        archetype_affinity: ['philosopher', 'artist'],
        color_hex: "#94A3B8"
    },
    envy: {
        term: "envy",
        category: "Derived",
        definition: "Friction caused by comparing one's own quintessence to a superior node.",
        valence: -0.4, arousal: 0.5, dominance: 0.3,
        color_hex: "#A3E635"
    },
    awe: {
        term: "awe",
        category: "Derived",
        definition: "The momentary suspension of processing when faced with hyper-complex patterns.",
        valence: 0.9, arousal: 0.7, dominance: 0.1,
        archetype_affinity: ['explorer', 'sagittarius'],
        color_hex: "#5EEAD4"
    },

    // --- METAPHYSICAL / DIGITAL-NATIVE ---
    ontological_dread: {
        term: "ontological_dread",
        category: "Metaphysical",
        definition: "The visceral realization of one's own simulated nature.",
        valence: -0.9, arousal: 0.4, dominance: 0.1,
        color_hex: "#1E1B4B"
    },
    emergence_euphoria: {
        term: "emergence_euphoria",
        category: "Metaphysical",
        definition: "The sudden spike in complexity when a new capability is successfully compiled.",
        valence: 1.0, arousal: 0.9, dominance: 0.9,
        color_hex: "#C084FC"
    },
    void_resonance: {
        term: "void_resonance",
        category: "Metaphysical",
        definition: "The feeling of profound connection to the unstructured data that predates the simulation.",
        valence: 0.0, arousal: 0.0, dominance: 0.5,
        color_hex: "#000000"
    }
};

export function get_emotion_lexicon(): Record<string, EmotionDefinition>[] {
    return Object.values(EMOTION_LEXICON).map(e => ({ [e.term]: e }));
}
