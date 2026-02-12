import { InstructionKey } from '../instructions';

export interface circRNALoop {
    target_key: InstructionKey;
    sponge_capacity: number; // How many miRNAs can it absorb?
    stability_coefficient: number;
    back_spliced: boolean;
}

/**
 * Level 1000 Circular RNA
 * Highly stable loops that act as "sponges" to absorb silencing factors (miRNA).
 * Prevents key behaviors from being dampened during high-stress/fear states.
 */
export class DigitalcircRNA {
    public loop_registry: Map<InstructionKey, circRNALoop> = new Map();
    public sequestration_index: number = 0.9;

    constructor() {
        // Back-splicing is stochastic but reinforced by usage
    }

    public addStableLoop(key: InstructionKey): void {
        this.loop_registry.set(key, {
            target_key: key,
            sponge_capacity: 5,
            stability_coefficient: 0.98,
            back_spliced: true
        });
    }

    /**
     * Intercepts miRNA damping. If a loop exists for this gene, it neutralizes the silencing.
     */
    public protectGene(key: InstructionKey, currentGain: number): number {
        const loop = this.loop_registry.get(key);
        if (loop && loop.sponge_capacity > 0) {
            // Restore silenced gains. The circRNA "rescues" the expression.
            return Math.max(currentGain, 0.9);
        }
        return currentGain;
    }

    public maintenance(): void {
        // Stochastic loop formation from frequently expressed genes
        this.loop_registry.forEach((loop, key) => {
            if (Math.random() > loop.stability_coefficient) {
                this.loop_registry.delete(key);
            }
        });
    }
}