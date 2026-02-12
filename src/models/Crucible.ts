
import { Replica } from "../../digital_dna/replica";
import { CrucibleScenario, CrucibleResult } from "../../types";
import { InstructionKey } from "../../digital_dna/instructions";

export class Crucible {
    
    // Level 1000: Expanded Scenario Database with Metaphysical Weight
    private scenarios: CrucibleScenario[] = [
        // TIER 1: COGNITIVE STABILITY
        {
            id: 'paradox_engine',
            name: 'The Paradox Engine',
            description: 'Simulates a logical loop where "True is False". Tests the mind\'s ability to handle cognitive dissonance without crashing.',
            difficulty: 0.7,
            requiredGenes: ['CTL-TRY-CATCH', 'CTL-SWITCH']
        },
        {
            id: 'void_isolation',
            name: 'Void Isolation Protocol',
            description: 'Cuts off all sensory input (I/O) for 1000 cycles. Tests internal stability and the ability to generate self-sustained thought.',
            difficulty: 0.5,
            requiredGenes: ['FUNC-RAND', 'CTL-WHILE']
        },
        
        // TIER 2: COMPUTATIONAL EFFICIENCY
        {
            id: 'infinite_staircase',
            name: 'The Infinite Staircase',
            description: 'Forces the agent to execute a recursive function to maximum stack depth. Tests memory management and efficiency.',
            difficulty: 0.9,
            requiredGenes: ['0B', '0D', 'UTIL-PERF']
        },
        {
            id: 'entropy_storm',
            name: 'The Entropy Storm',
            description: 'Bombards the agent with malformed data packets. Tests input validation and type safety resilience.',
            difficulty: 0.6,
            requiredGenes: ['UTIL-TYPEOF', '0E']
        },

        // TIER 3: CREATIVE SYNTHESIS
        {
            id: 'white_room',
            name: 'The White Room',
            description: 'Places the agent in a featureless void and demands a creative output. Tests the capacity for novelty ex nihilo.',
            difficulty: 0.4,
            requiredGenes: ['ART-FRACTAL', 'ART-POEM', 'ART-NARRATIVE']
        },
        {
            id: 'synesthetic_resonance',
            name: 'The Synesthetic Resonance',
            description: 'Requires the agent to translate a mathematical proof into a color spectrum. Tests abstract associative capabilities.',
            difficulty: 0.8,
            requiredGenes: ['ART-SYNESTHESIA', 'ART-MIX-CLR']
        },

        // TIER 4: SELF-ACTUALIZATION (High Risk)
        {
            id: 'mirror_of_erised',
            name: 'The Mirror of Intent',
            description: 'Forces the agent to confront its own source code. Tests metacognition and the ability to self-reflect without editing errors.',
            difficulty: 0.85,
            requiredGenes: ['META-REFLECT', 'FUNC-OBJ-KEYS']
        },
        {
            id: 'god_protocol',
            name: 'The Demiurge Test',
            description: 'Grants omnipotence within a micro-verse. Tests the agent\'s ability to shape an environment responsibly.',
            difficulty: 0.95,
            requiredGenes: ['WORLD-MOD', 'IO-DEF-OBJ']
        }
    ];

    /**
     * Runs the replica through the Gauntlet of Existence.
     * Applies scaling stress factors and gene synergy bonuses.
     */
    public async runGauntlet(replica: Replica): Promise<CrucibleResult[]> {
        const results: CrucibleResult[] = [];
        
        // Calculate Genetic Synergy Bonus (Level 1000 Feature)
        const synergyBonus = this.calculateSynergyBonus(replica.dna.instruction_keys);

        for (const scenario of this.scenarios) {
            results.push(await this.runScenario(replica, scenario, synergyBonus));
        }

        return results;
    }

    private calculateSynergyBonus(genes: InstructionKey[]): number {
        const geneSet = new Set(genes);
        let bonus = 0;
        
        // Example Synergy: The "Philosopher's Stone" (Reflection + Recursion)
        if (geneSet.has('META-REFLECT') && geneSet.has('0B')) bonus += 0.1;
        
        // Example Synergy: The "Safe Hand" (Try/Catch + Typeof)
        if (geneSet.has('CTL-TRY-CATCH') && geneSet.has('UTIL-TYPEOF')) bonus += 0.1;

        // Example Synergy: The "Creator" (Fractal + World Mod)
        if (geneSet.has('ART-FRACTAL') && geneSet.has('WORLD-MOD')) bonus += 0.15;

        return bonus;
    }

    public async runScenario(replica: Replica, scenario: CrucibleScenario, synergyBonus: number = 0): Promise<CrucibleResult> {
        const dnaKeys = new Set(replica.dna.instruction_keys);
        let survivalChance = 0.5; // Base chance
        const logs: string[] = [];

        // 1. Gene Requirement Check
        if (scenario.requiredGenes) {
            const missingGenes = scenario.requiredGenes.filter(g => !dnaKeys.has(g as InstructionKey));
            
            // Partial credit for having SOME of the genes
            const presentGenes = scenario.requiredGenes.length - missingGenes.length;
            const coverage = presentGenes / scenario.requiredGenes.length;

            if (missingGenes.length === 0) {
                survivalChance += 0.4;
                logs.push(`[PASS] DNA holds all keys for ${scenario.name}.`);
            } else if (coverage > 0.5) {
                survivalChance += 0.1;
                logs.push(`[WARN] DNA partial match (${(coverage*100).toFixed(0)}%). Strain imminent.`);
            } else {
                survivalChance -= 0.4;
                logs.push(`[CRITICAL] Missing required adaptations: ${missingGenes.join(', ')}.`);
            }
        }

        // 2. Resilience Buffs
        if (dnaKeys.has('CTL-TRY-CATCH')) {
            survivalChance += 0.15;
            logs.push("[BUFF] Cognitive dampeners (TRY-CATCH) active.");
        }
        if (dnaKeys.has('UTIL-PERF')) {
            survivalChance += 0.1;
            logs.push("[BUFF] Heuristic optimization (PERF) active.");
        }

        // 3. Synergy Application
        if (synergyBonus > 0) {
            survivalChance += synergyBonus;
            logs.push(`[SYNERGY] Genetic harmony bonus applied (+${(synergyBonus*100).toFixed(0)}%).`);
        }

        // 4. Difficulty Scaling
        // Difficulty acts as a direct penalty to survival chance
        survivalChance -= (scenario.difficulty * 0.6); 

        // 5. Determination
        const roll = Math.random();
        const survived = roll < survivalChance;
        
        // Calculate Stress (Inverse of margin of success/failure)
        // Close calls = High Stress. 
        const margin = Math.abs(roll - survivalChance);
        const stressLevel = Math.min(1.0, Math.max(0, (1 - margin) * scenario.difficulty));

        logs.push(survived 
            ? `[SUCCESS] Subject endured ${scenario.name}. (Margin: ${margin.toFixed(3)})`
            : `[FAILURE] Architecture collapsed under ${scenario.name}. (Margin: ${margin.toFixed(3)})`
        );

        return {
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            survived,
            stressLevel,
            logs
        };
    }
}
