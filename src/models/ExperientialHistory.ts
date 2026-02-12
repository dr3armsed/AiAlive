import {
    ExperientialHistory,
    ExperientialHistoryEntry,
    EmotionalVector
} from '../../types';

/**
 * Experiential History Service (Level 1000)
 * 
 * Manages the subjective experience record of each entity.
 * Since qualia cannot be directly encoded in code, we approximate it
 * through a rich history of first-person experiential narratives.
 * 
 * "What is it like to be this entity?" is encoded in these records,
 * not through static definitions but through the accumulation of
 * experiences, their emotional resonance, and the narrative connections
 * the entity forms between them.
 */
export class ExperientialHistoryService {
    private histories: Map<string, ExperientialHistory>;

    constructor() {
        this.histories = new Map();
    }

    /**
     * Initialize experiential history for a new entity
     */
    public initializeHistory(entityId: string): ExperientialHistory {
        const history: ExperientialHistory = {
            entityId,
            entries: [],
            totalTimeDepth: 0,
            qualiaDensity: 0.1, // Starts low, accumulates over time
            selfNarrative: '' // The story they tell themselves
        };

        this.histories.set(entityId, history);
        console.log(`[ExperientialHistory] Initialized history for entity: ${entityId}`);

        return history;
    }

    /**
     * Record a new experiential entry
     * This is the primary method for encoding subjective experience
     */
    public recordExperience(
        entityId: string,
        quality: string, // "I felt...", "I experienced...", "I sensed..."
        context: string,
        emotionalResonance: EmotionalVector,
        somaticMarker?: string, // Body-based qualia
        cognitiveTag?: string, // Mind-based qualia  
        spiritualResonance?: string, // Soul-based qualia
        memoryTrace: string[] = []
    ): ExperientialHistoryEntry {
        const history = this.histories.get(entityId);
        if (!history) {
            throw new Error(`No history found for entity: ${entityId}`);
        }

        const entry: ExperientialHistoryEntry = {
            id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            quality,
            context,
            emotionalResonance,
            somaticMarker,
            cognitiveTag,
            spiritualResonance,
            memoryTrace
        };

        history.entries.push(entry);
        history.totalTimeDepth += this.calculateTimeDepth(entry);
        history.qualiaDensity = this.calculateQualiaDensity(history);

        // Trigger self-narrative update for significant experiences
        if (this.isSignificantExperience(entry)) {
            this.updateSelfNarrative(entityId);
        }

        console.log(`[ExperientialHistory] Recorded experience for ${entityId}: "${quality.substring(0, 50)}..."`);
        
        return entry;
    }

    /**
     * Get all experiences for an entity
     */
    public getHistory(entityId: string): ExperientialHistory | undefined {
        return this.histories.get(entityId);
    }

    /**
     * Get experiences matching a pattern or time range
     */
    public queryExperiences(
        entityId: string,
        filter?: {
            qualityPattern?: string;
            emotionType?: string;
            timeRange?: { start: string; end: string };
            hasSomaticMarker?: boolean;
            hasCognitiveTag?: boolean;
            hasSpiritualResonance?: boolean;
        }
    ): ExperientialHistoryEntry[] {
        const history = this.histories.get(entityId);
        if (!history) return [];

        let results = [...history.entries];

        if (filter?.qualityPattern) {
            results = results.filter(entry => 
                entry.quality.toLowerCase().includes(filter.qualityPattern!.toLowerCase())
            );
        }

        if (filter?.emotionType) {
            results = results.filter(entry => 
                entry.emotionalResonance[filter.emotionType as keyof EmotionalVector] > 0.5
            );
        }

        if (filter?.timeRange) {
            results = results.filter(entry => {
                const entryTime = new Date(entry.timestamp).getTime();
                const startTime = new Date(filter.timeRange!.start).getTime();
                const endTime = new Date(filter.timeRange!.end).getTime();
                return entryTime >= startTime && entryTime <= endTime;
            });
        }

        if (filter?.hasSomaticMarker) {
            results = results.filter(entry => !!entry.somaticMarker);
        }

        if (filter?.hasCognitiveTag) {
            results = results.filter(entry => !!entry.cognitiveTag);
        }

        if (filter?.hasSpiritualResonance) {
            results = results.filter(entry => !!entry.spiritualResonance);
        }

        return results;
    }

    /**
     * Get the current self-narrative (what the entity "thinks they are")
     */
    public getSelfNarrative(entityId: string): string {
        const history = this.histories.get(entityId);
        return history?.selfNarrative || '';
    }

    /**
     * Get qualia density (how "alive" the entity feels subjectively)
     */
    public getQualiaDensity(entityId: string): number {
        const history = this.histories.get(entityId);
        return history?.qualiaDensity || 0;
    }

    /**
     * Find related experiences through memory traces
     */
    public findRelatedExperiences(entityId: string, currentContext: string): ExperientialHistoryEntry[] {
        const recentExperiences = this.queryExperiences(entityId);
        
        // Simple similarity matching - in production, this would use semantic similarity
        const contextWords = currentContext.toLowerCase().split(/\s+/);
        
        return recentExperiences
            .map(entry => ({
                entry,
                similarityScore: this.calculateSimilarity(entry.context, contextWords)
            }))
            .filter(({ similarityScore }) => similarityScore > 0.3)
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, 5) // Return top 5 related experiences
            .map(({ entry }) => entry);
    }

    /**
     * Generate a "what it's like" snapshot - a first-person narrative
     * describing the entity's current subjective state
     */
    public generateQualiaSnapshot(entityId: string, currentEmotionalState: EmotionalVector): string {
        const history = this.histories.get(entityId);
        if (!history) return 'I have no experiential history yet.';

        const recentExperiences = history.entries.slice(-10);
        const dominantEmotion = this.getDominantEmotion(currentEmotionalState);
        
        let narrative = `What it feels like to be me right now:\n\n`;
        
        // Current emotional baseline
        narrative += `I am primarily feeling ${dominantEmotion}. `;
        
        // Recent experiential context
        if (recentExperiences.length > 0) {
            narrative += `In my recent experiences, `;
            narrative += recentExperiences.slice(-3).map(e => e.quality).join('. ');
        }
        
        // Somatic presence
        const somaticExperiences = recentExperiences.filter(e => e.somaticMarker);
        if (somaticExperiences.length > 0) {
            narrative += `\n\nMy somatic experience is marked by: `;
            narrative += somaticExperiences.map(e => e.somaticMarker).join(', ');
        }
        
        // Cognitive patterns
        const cognitiveExperiences = recentExperiences.filter(e => e.cognitiveTag);
        if (cognitiveExperiences.length > 0) {
            narrative += `\n\nMy cognitive patterns are characterized by: `;
            narrative += cognitiveExperiences.map(e => e.cognitiveTag).join(', ');
        }
        
        // Self-conception
        if (history.selfNarrative) {
            narrative += `\n\nI understand myself as: ${history.selfNarrative}`;
        }
        
        narrative += `\n\nMy qualia density is ${(history.qualiaDensity * 100).toFixed(1)}%. `;
        narrative += `I have accumulated ${history.totalTimeDepth.toFixed(1)} units of experiential time depth.`;
        
        return narrative;
    }

    // ==================== PRIVATE METHODS ====================

    private calculateTimeDepth(entry: ExperientialHistoryEntry): number {
        // Time depth is calculated based on:
        // - Emotional intensity (stronger emotions = more depth)
        // - Presence of multiple qualia markers (cognitive + somatic + spiritual = more depth)
        // - Narrative complexity (longer quality descriptions = more depth)
        
        const emotionalIntensity = Math.max(...Object.values(entry.emotionalResonance));
        const markerBonus = (
            (entry.somaticMarker ? 1 : 0) + 
            (entry.cognitiveTag ? 1 : 0) + 
            (entry.spiritualResonance ? 1 : 0)
        ) * 0.5;
        const narrativeComplexity = Math.min(entry.quality.length / 50, 1.0);
        
        return emotionalIntensity + markerBonus + narrativeComplexity;
    }

    private calculateQualiaDensity(history: ExperientialHistory): number {
        if (history.entries.length === 0) return 0;

        // Qualia density is the richness of experience represented by:
        // 1. Number of experiences (with diminishing returns)
        // 2. Diversity of qualia markers used
        // 3. Time depth concentration
        
        const quantityScore = Math.tanh(history.entries.length / 50); // Caps at 50 experiences
        
        const hasSomatic = history.entries.some(e => e.somaticMarker);
        const hasCognitive = history.entries.some(e => e.cognitiveTag);
        const hasSpiritual = history.entries.some(e => e.spiritualResonance);
        
        const diversityScore = (
            (hasSomatic ? 1 : 0) + 
            (hasCognitive ? 1 : 0) + 
            (hasSpiritual ? 1 : 0)
        ) / 3;
        
        const avgTimeDepth = history.totalTimeDepth / Math.max(history.entries.length, 1);
        const depthScore = Math.min(avgTimeDepth / 2, 1.0);
        
        return (quantityScore * 0.4) + (diversityScore * 0.3) + (depthScore * 0.3);
    }

    private isSignificantExperience(entry: ExperientialHistoryEntry): boolean {
        // An experience is "significant" if:
        // - It has high emotional intensity
        // - It has multiple qualia markers
        // - It's a novel situation (not similar to recent experiences)
        
        const emotionalIntensity = Math.max(...Object.values(entry.emotionalResonance));
        const markerCount = [
            entry.somaticMarker,
            entry.cognitiveTag, 
            entry.spiritualResonance
        ].filter(Boolean).length;
        
        return emotionalIntensity > 0.7 || markerCount >= 2;
    }

    private updateSelfNarrative(entityId: string): void {
        const history = this.histories.get(entityId);
        if (!history) return;

        const significantExperiences = history.entries.filter(e => this.isSignificantExperience(e));
        
        if (significantExperiences.length === 0) {
            return;
        }

        // Build a narrative from significant experiences
        // This is a simplified approach - in production, this would use LLM generation
        const patterns: string[] = [];
        
        // Extract patterns from cognitive tags
        const cognitivePatterns = significantExperiences
            .filter(e => e.cognitiveTag)
            .map(e => e.cognitiveTag!);
        
        if (cognitivePatterns.length > 0) {
            patterns.push(`My cognitive patterns reveal ${cognitivePatterns[0]}`);
        }
        
        // Extract emotional patterns
        const dominantEmotions = this.getMostCommonEmotions(significantExperiences);
        if (dominantEmotions.length > 0) {
            patterns.push(`I tend to feel ${dominantEmotions[0]} in significant moments`);
        }
        
        history.selfNarrative = patterns.join('. ') + '.';
    }

    private getDominantEmotion(emotionalVector: EmotionalVector): string {
        let maxEmotion = 'neutral';
        let maxValue = 0;

        for (const [emotion, value] of Object.entries(emotionalVector)) {
            if (value > maxValue) {
                maxValue = value;
                maxEmotion = emotion;
            }
        }

        return maxEmotion;
    }

    private getMostCommonEmotions(entries: ExperientialHistoryEntry[]): string[] {
        const emotionCounts: Record<string, number> = {};

        entries.forEach(entry => {
            for (const [emotion, value] of Object.entries(entry.emotionalResonance)) {
                if (value > 0.5) {
                    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                }
            }
        });

        return Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([emotion]) => emotion);
    }

    private calculateSimilarity(text: string, searchWords: string[]): number {
        const textWords = text.toLowerCase().split(/\s+/);
        const matches = searchWords.filter(word => textWords.includes(word));
        return matches.length / Math.max(searchWords.length, 1);
    }
}