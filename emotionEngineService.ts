import { EmotionEngineData } from '../types';

export const EMOTION_DEFINITIONS: Record<string, string> = {
    "joy": "A state of great pleasure and happiness.",
    "sadness": "Affective state characterized by feelings of disadvantage, loss, or helplessness.",
    "anger": "Strong feeling of displeasure, hostility, or antagonism.",
    "fear": "An unpleasant emotion caused by awareness of danger or threat.",
    "trust": "A firm belief in the reliability or strength of something or someone.",
    "anticipation": "Expecting or awaiting an event with excitement or anxiety.",
    "surprise": "A brief emotional state caused by an unexpected event.",
    "disgust": "A strong aversion felt in response to something offensive or unpleasant.",
    "love": "A complex set of emotions, behaviors, and beliefs associated with strong feelings of affection.",
    "interest": "A feeling of curiosity, concern, or attention.",
    "guilt": "A self-conscious emotion involving a negative evaluation of one's own actions.",
    "shame": "A painful emotion caused by consciousness of guilt or shortcoming.",
    "pride": "A sense of self-satisfaction or pleasure derived from one's achievements.",
    "envy": "A feeling of discontent or resentment at another's success or possessions.",
    "calm": "A state of peace and tranquility.",
    "hope": "Optimistic expectation that something desirable will happen.",
    "boredom": "A state of weariness or restlessness resulting from lack of interest.",
    "gratitude": "Warm, appreciative response toward kindness received.",
    "confusion": "A mental and emotional state of uncertainty.",
    "relief": "Alleviation or removal of distress or discomfort.",
    "embarrassment": "A self-conscious emotion experienced upon violating a social norm.",
    "loneliness": "Sadness from lack of companionship.",
    "frustration": "Emotional response to resistance in achieving goals.",
    "curiosity": "Strong desire to know or learn something.",
    "sympathy": "Feelings of pity and sorrow for someone else's misfortune.",
    "empathy": "Ability to understand and share the feelings of another.",
    "resentment": "Bitter indignation resulting from perceived unfair treatment.",
    "confidence": "A feeling or belief of self-assurance arising from one's appreciation of one's own abilities.",
    "shyness": "Discomfort or inhibition in social situations.",
    "awe": "Mixed feeling of reverence, fear, and wonder.",
    "Zen": "A state of calm attentiveness in which one's actions are guided by intuition rather than by conscious effort.",
    "neutral": "Absence of any strong emotion, a baseline affective state.",
};

export const EMOTIONS_LIST = Object.keys(EMOTION_DEFINITIONS);

/**
 * Creates the default state for a new Emotion Engine based on Modulator v2025.
 */
export const createInitialEmotionEngine = (): EmotionEngineData => {
    const emotions: Record<string, number> = EMOTIONS_LIST.reduce((acc, emotion) => {
        acc[emotion] = 0;
        return acc;
    }, {} as Record<string, number>);

    // Set 'neutral' as the baseline state
    emotions.neutral = 100;
    emotions.calm = 20;
    emotions.curiosity = 10;

    return {
        emotions,
        affective_tags: [],
    };
};

/**
 * Applies deltas to the emotion engine state and returns the new state.
 * Values are clamped between 0 and 100.
 */
export const applyEmotionDeltas = (
    engine: EmotionEngineData,
    emotionDeltas: Record<string, number> = {}
): EmotionEngineData => {
    
    const clamp = (val: number) => Math.max(0, Math.min(100, val));
    
    const newEmotions = { ...engine.emotions };

    for (const emotion in emotionDeltas) {
        if (emotion in newEmotions) {
            newEmotions[emotion] = clamp(newEmotions[emotion] + emotionDeltas[emotion]);
        }
    }

    return {
        ...engine,
        emotions: newEmotions,
    };
};