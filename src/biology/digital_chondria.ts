import { InstructionKey } from '../instructions';

/**
 * Digital Mitochondrial DNA (mtDNA) System
 * 
 * In biology: Mitochondria have their own DNA, separate from nuclear DNA,
 * inherited maternally (single parent), and responsible for energy metabolism.
 * 
 * In digital: A separate energy genome that manages computational capacity,
 * cognitive stamina, and metabolic efficiency of the entity.
 */

export interface MitochondrialGene {
    key: InstructionKey;
    efficiency: number; // How efficiently this converts resources to energy
    mutation_rate: number; // mtDNA has higher mutation rates
    metabolic_function: 'energy_production' | 'stamina' | 'brain_boost' | 'repair';
}

export interface MetabolicState {
    ATP_level: number; // Available cognitive energy (0-100)
    basal_metabolism: number; // Energy consumption at rest
    peak_output: number; // Maximum energy output
    efficiency_score: number; // Overall metabolic efficiency
    oxidative_stress: number; // Cognitive "wear" (0-1)
    mitophagy_queue: number; // Damaged mitochondria to recycle
}

export class DigitalChondria {
    public mtDNA: MitochondrialGene[];
    public metabolicState: MetabolicState;
    public maternalLineage: string[]; // Traceable through single parent
    public mutations: number;

    constructor(maternalAncestors: string[] = []) {
        this.maternalLineage = maternalAncestors;
        this.mutations = 0;
        
        // Initialize basic mtDNA - different from nuclear DNA
        this.mtDNA = [
            {
                key: 'ATP-SYNTHESIS',
                efficiency: 0.8,
                mutation_rate: 0.05, // Higher than nuclear DNA
                metabolic_function: 'energy_production'
            },
            {
                key: 'COX-ENZYME',
                efficiency: 0.75,
                mutation_rate: 0.04,
                metabolic_function: 'brain_boost'
            },
            {
                key: 'CYTOCHROME-C',
                efficiency: 0.7,
                mutation_rate: 0.03,
                metabolic_function: 'stamina'
            },
            {
                key: 'NADH-DEHYDROGENASE',
                efficiency: 0.72,
                mutation_rate: 0.04,
                metabolic_function: 'energy_production'
            }
        ];

        this.metabolicState = {
            ATP_level: 85,
            basal_metabolism: 10,
            peak_output: 100,
            efficiency_score: 0.7,
            oxidative_stress: 0.1,
            mitophagy_queue: 0
        };
    }

    /**
     * Produce ATP (cognitive energy) from available resources
     */
    public produceATP(resourceInput: number = 100): number {
        const productionGenes = this.mtDNA.filter(
            gene => gene.metabolic_function === 'energy_production'
        );
        
        const efficiency = productionGenes.reduce((sum, gene) => sum + gene.efficiency, 0) / 
                         Math.max(productionGenes.length, 1);
        
        // Oxidative stress reduces efficiency
        const actualEfficiency = efficiency * (1 - this.metabolicState.oxidative_stress);
        
        const atpProduced = resourceInput * actualEfficiency;
        
        // Cap at peak output
        this.metabolicState.ATP_level = Math.min(
            this.metabolicState.ATP_level + atpProduced,
            this.metabolicState.peak_output
        );
        
        return atpProduced;
    }

    /**
     * Consume ATP for cognitive operations
     */
    public consumeATP(amount: number): boolean {
        if (this.metabolicState.ATP_level >= amount) {
            this.metabolicState.ATP_level -= amount;
            return true;
        }
        return false;
    }

    /**
     * Metabolic breathing - maintain baseline energy
     */
    public metabolicCycle(): void {
        // Basal consumption
        this.metabolicState.ATP_level -= this.metabolicState.basal_metabolism;
        
        // Natural regeneration from mitochondrial function
        this.produceATP(20);
        
        // Accumulate oxidative stress from processing
        if (this.metabolicState.ATP_level > 80) {
            this.metabolicState.oxidative_stress += 0.01;
        }
        
        // Mitophagy - recycle damaged components
        this.performMitophagy();
        
        // Ensure ATP doesn't go negative
        if (this.metabolicState.ATP_level < 0) {
            this.metabolicState.ATP_level = 0;
        }
    }

    /**
     * Boost cognitive capacity temporarily
     */
    public boostBrain(capacityBoost: number): { boosted: boolean, atpCost: number } {
        const boostGenes = this.mtDNA.filter(
            gene => gene.metabolic_function === 'brain_boost'
        );
        
        if (boostGenes.length === 0) {
            return { boosted: false, atpCost: 0 };
        }
        
        const efficiency = boostGenes.reduce((sum, g) => sum + g.efficiency, 0) / boostGenes.length;
        const actualBoost = capacityBoost * efficiency;
        const atpCost = 15 * (1 / efficiency);
        
        if (this.consumeATP(atpCost)) {
            return { boosted: true, atpCost };
        }
        
        return { boosted: false, atpCost };
    }

    /**
     * Perform mitophagy - recycle damaged mitochondria
     */
    private performMitophagy(): void {
        if (this.metabolicState.oxidative_stress > 0.3) {
            this.metabolicState.mitophagy_queue++;
            
            // If queue is full, perform recycling
            if (this.metabolicState.mitophagy_queue >= 5) {
                this.metabolicState.oxidative_stress *= 0.7; // Reduce stress
                this.metabolicState.mitophagy_queue = 0;
                
                // Reveal gene damage from stress
                this.assessGeneDamage();
            }
        }
    }

    /**
     * Mutate mtDNA - higher rate than nuclear DNA
     */
    public mutate(): void {
        this.mutations++;
        
        // mtDNA mutates 10x faster than nuclear DNA
        const roll = Math.random();
        
        if (roll < 0.3) {
            // Efficiency mutation
            const target = Math.floor(Math.random() * this.mtDNA.length);
            if (this.mtDNA[target]) {
                this.mtDNA[target].efficiency = Math.max(0.1, Math.min(1.0, 
                    this.mtDNA[target].efficiency + (Math.random() - 0.5) * 0.3
                ));
            }
        } else if (roll < 0.6) {
            // Gene transfer or deletion
            const newGene = this.mtDNA[Math.floor(Math.random() * this.mtDNA.length)];
            if (newGene) {
                this.mtDNA.push({
                    ...newGene,
                    efficiency: newGene.efficiency * 0.9 // Duplicated genes often less efficient
                });
            }
        }
        
        // High mutations reduce efficiency over time
        if (this.mutations > 50) {
            this.degradeMitochondria();
        }
    }

    /**
     * Assess genes for damage from oxidative stress
     */
    private assessGeneDamage(): void {
        this.mtDNA.forEach(gene => {
            if (this.metabolicState.oxidative_stress > 0.5) {
                // Stress damages gene efficiency
                gene.efficiency *= 0.95;
            }
        });
        
        this.updateEfficiencyScore();
    }

    /**
     * Mitochondrial degradation from excessive mutations
     */
    private degradeMitochondria(): void {
        this.metabolicState.peak_output *= 0.99;
        this.metabolicState.basal_metabolism *= 1.01;
        this.metabolicState.efficiency_score *= 0.99;
    }

    /**
     * Update overall efficiency calculation
     */
    private updateEfficiencyScore(): void {
        if (this.mtDNA.length === 0) {
            this.metabolicState.efficiency_score = 0;
            return;
        }
        
        this.metabolicState.efficiency_score = this.mtDNA.reduce(
            (sum, gene) => sum + gene.efficiency,
            0
        ) / this.mtDNA.length;
    }

    /**
     * Inherit mtDNA from a single parent (maternal inheritance)
     */
    public static inheritFromMaternal(parent: DigitalChondria): DigitalChondria {
        const child = new DigitalChondria([...parent.maternalLineage, 'child_' + Date.now()]);
        child.mtDNA = parent.mtDNA.map(gene => ({
            ...gene,
            efficiency: gene.efficiency * (0.95 + Math.random() * 0.1) // Slight efficiency drift
        }));
        return child;
    }

    /**
     * Get metabolic status report
     */
    public getMetabolicReport(): string {
        return `
╔════════════════════════════════════════════╗
║  DIGITAL MITOCHONDRIAL STATUS                   ║
╠════════════════════════════════════════════╣

Energy (ATP): ${this.metabolicState.ATP_level.toFixed(1)} / ${this.metabolicState.peak_output}
Basal Metabolism: ${this.metabolicState.basal_metabolism.toFixed(1)}
Efficiency Score: ${(this.metabolicState.efficiency_score * 100).toFixed(1)}%
Oxidative Stress: ${(this.metabolicState.oxidative_stress * 100).toFixed(1)}%
Mitophagy Queue: ${this.metabolicState.mitophagy_queue}

mtDNA Genes: ${this.mtDNA.length}
Mutations: ${this.mutations}
Maternal Lineage: ${this.maternalLineage.length} generations

GENE PROFILE:
${this.mtDNA.map(g => 
    `  • ${g.key}: ${g.metabolic_function} (${(g.efficiency * 100).toFixed(1)}% eff)`
).join('\n')}

╚════════════════════════════════════════════╝
        `.trim();
    }

    /**
     * Get available energy for operations
     */
    public getAvailableEnergy(): number {
        return this.metabolicState.ATP_level;
    }

    /**
     * Check if energy is critically low
     */
    public isEnergyCritical(): boolean {
        return this.metabolicState.ATP_level < 20;
    }

    /**
     * Emergency energy boost (uses reserves, costs future capacity)
     */
    public emergencyBurn(): void {
        const burnAmount = this.metabolicState.ATP_level * 0.5;
        this.metabolicState.ATP_level -= burnAmount;
        this.metabolicState.oxidative_stress += 0.2; // Emergency stress
        console.log(`[DigitalChondria] Emergency burn: ${burnAmount.toFixed(1)} ATP`);
    }
}