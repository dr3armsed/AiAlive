import { InstructionKey } from '../instructions';

export interface miRNAStrand {
    id: string;
    seed_sequence: string; // Used for target recognition
    damping_potency: number;
    half_life: number;
    competitive_affinity: number;
}

/**
 * Level 1000 Micro RNA
 * Precision silencing mechanism that suppresses specific logic traits based on emotional climate.
 */
export class DigitalmiRNA {
    public active_strands: Map<string, miRNAStrand> = new Map();
    public target_map: Map<InstructionKey, number> = new Map();

    constructor(moods: string[]) {
        this.synthesizeStrands(moods);
    }

    private synthesizeStrands(moods: string[]): void {
        // High-fidelity emotional mapping to RNAi strands
        if (moods.includes('fear')) {
            this.active_strands.set('MIR-FEAR-L1', {
                id: 'MIR-FEAR-L1',
                seed_sequence: 'GCTAG',
                damping_potency: 0.8,
                half_life: 3000,
                competitive_affinity: 0.9
            });
            // Fear suppresses risk-taking genes
            this.target_map.set('RISK_TAKING_BEHAVIOR', 0.8);
            this.target_map.set('EXPLORATION_INSTINCT', 0.7);
        }

        if (moods.includes('joy')) {
            this.active_strands.set('MIR-JOY-H1', {
                id: 'MIR-JOY-H1',
                seed_sequence: 'ATCGG',
                damping_potency: 0.6,
                half_life: 4000,
                competitive_affinity: 0.85
            });
            // Joy enhances social genes
            this.target_map.set('SOCIAL_BONDING', -0.3); // Negative value = enhancement
            this.target_map.set('PLAY_BEHAVIOR', -0.4);
        }

        if (moods.includes('anger')) {
            this.active_strands.set('MIR-ANGER-A1', {
                id: 'MIR-ANGER-A1',
                seed_sequence: 'CCTAG',
                damping_potency: 0.9,
                half_life: 2000,
                competitive_affinity: 0.95
            });
            // Anger suppresses empathy, activates defense
            this.target_map.set('EMPATHY_MODULE', 0.9);
            this.target_map.set('DEFENSE_PROTOCOL', -0.5);
        }
    }

    /**
     * Applies miRNA-mediated silencing to gene expression.
     */
    public applySilencing(gene_key: InstructionKey, expression: number): number {
        const damping = this.target_map.get(gene_key) || 0;
        
        if (damping > 0) {
            // Silencing effect
            return expression * (1 - damping);
        } else if (damping < 0) {
            // Enhancement effect (negative damping)
            return expression * (1 + Math.abs(damping));
        }
        
        return expression;
    }

    /**
     * Decays miRNA strands over time.
     */
    public decay(delta_time: number): void {
        const expired: string[] = [];
        
        this.active_strands.forEach((strand, id) => {
            strand.half_life -= delta_time;
            if (strand.half_life <= 0) {
                expired.push(id);
            }
        });

        expired.forEach(id => {
            this.active_strands.delete(id);
        });
    }

    /**
     * Adds new miRNA strand based on experience.
     */
    public addStrand(id: string, target: InstructionKey, potency: number): void {
        this.active_strands.set(id, {
            id,
            seed_sequence: this.generateSeed(),
            damping_potency: potency,
            half_life: 5000,
            competitive_affinity: 0.8 + Math.random() * 0.2
        });
        this.target_map.set(target, potency);
    }

    private generateSeed(): string {
        const nucleotides = 'ATCG';
        let seed = '';
        for (let i = 0; i < 5; i++) {
            seed += nucleotides[Math.floor(Math.random() * 4)];
        }
        return seed;
    }
}
