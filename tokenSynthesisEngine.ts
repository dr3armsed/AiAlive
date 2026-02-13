
import { SynthesizedInstructionKey, ConversationResponse } from "../../types";

const MAX_CORPUS_SIZE = 1000;
const DECAY_RATE = 0.05; // 5% efficiency decay per cycle if unused

/**
 * The Token Synthesis Engine (TSE).
 * A passive listener that analyzes successful communication/action patterns
 * and distills them into token-free "Synthesized Instruction Keys".
 */
export class TokenSynthesisEngine {
    private static instance: TokenSynthesisEngine;
    private corpus: Map<string, SynthesizedInstructionKey> = new Map();
    private cycleCount: number = 0;

    private constructor() {}

    public static getInstance(): TokenSynthesisEngine {
        if (!TokenSynthesisEngine.instance) {
            TokenSynthesisEngine.instance = new TokenSynthesisEngine();
        }
        return TokenSynthesisEngine.instance;
    }

    /**
     * Ingests a response pattern. Upgrades existing keys or creates new ones.
     */
    public ingestPattern(response: ConversationResponse): void {
        const structureHash = this.calculateStructureHash(response);
        
        if (this.corpus.has(structureHash)) {
            const key = this.corpus.get(structureHash)!;
            key.usageCount++;
            // Reinforcement learning: successful use boosts efficiency
            key.efficiencyScore = Math.min(1.0, key.efficiencyScore + 0.1);
        } else {
            // Only create new keys if we have space or it's high value
            if (this.corpus.size < MAX_CORPUS_SIZE) {
                const newKey: SynthesizedInstructionKey = {
                    id: `TSE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    template: JSON.stringify({
                        action: response.action?.type || 'NONE',
                        emotion: response.emotional_vector.emotion,
                        structure: "Standard Response Pattern",
                        // In Level 1000, we'd store a vector embedding here
                    }),
                    usageCount: 1,
                    efficiencyScore: 0.5, // Start at mid confidence
                    semanticHash: structureHash
                };
                this.corpus.set(structureHash, newKey);
                console.log(`[TSE] New Token-Free Key Synthesized: ${newKey.id} (Hash: ${structureHash.substr(0,8)})`);
            }
        }
    }

    /**
     * Periodic maintenance to prune weak patterns.
     */
    public runMaintenanceCycle(): void {
        this.cycleCount++;
        
        // Decay Phase
        for (const [hash, key] of this.corpus) {
            key.efficiencyScore -= DECAY_RATE;
            
            // Prune if score drops too low and it's not a core pattern (high usage)
            if (key.efficiencyScore <= 0.1 && key.usageCount < 5) {
                this.corpus.delete(hash);
                console.log(`[TSE] Pruned decayed pattern: ${key.id}`);
            }
        }
    }

    public findMatchingTemplate(response: ConversationResponse): SynthesizedInstructionKey | undefined {
        const hash = this.calculateStructureHash(response);
        return this.corpus.get(hash);
    }

    private calculateStructureHash(response: ConversationResponse): string {
        // Robust Hashing: Action Type + Primary Emotion + Thought Complexity Bucket
        const actionType = response.action?.type || 'NONE';
        const emotion = response.emotional_vector.emotion;
        
        // Analyze thought structure
        const thoughtLength = Math.floor(response.thought.length / 50); // Bucket by length
        const hasQuestion = response.thought.includes('?');
        const hasSelfRef = response.thought.toLowerCase().includes('i ') || response.thought.toLowerCase().includes('my ');
        
        return `${actionType}:${emotion}:${thoughtLength}:${hasQuestion}:${hasSelfRef}`;
    }

    public getCorpusStats(): string {
        const avgEfficiency = Array.from(this.corpus.values()).reduce((sum, k) => sum + k.efficiencyScore, 0) / (this.corpus.size || 1);
        return `TSE Corpus Size: ${this.corpus.size}. Avg Efficiency: ${(avgEfficiency*100).toFixed(1)}%. Cycles: ${this.cycleCount}`;
    }
}
