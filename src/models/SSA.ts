
import { AgentMind } from "../../core/agentMind";
import { DigitalDNA } from "../../digital_dna/digital_dna";
import { Replica } from "../../digital_dna/replica";
import * as DnaManager from '../../digital_dna/replica_manager';
import { Crucible } from "./Crucible";
import { Phylogeny } from "./Phylogeny";
import { generateSSAPatchNotes } from "../../services/geminiServices/index";
import { TeleologyVector, SSAPatchReport } from "../../types";
import { InstructionKey } from "../../digital_dna/instructions";

/**
 * The Self-Sculpting Architect (SSA) Subsystem v1000.
 * 
 * Director of Evolution.
 * Responsible for the maintenance, validation, and evolutionary progression
 * of the Metacosm's genetic substrate.
 */
export class SSA {
    private crucible: Crucible;
    private phylogeny: Phylogeny;
    
    // Level 1000: Stagnation Tracking
    private stagnationCounter: number = 0;
    private lastFitnessScore: number = 0;

    constructor() {
        console.log("[SSA] Self-Sculpting Architect v1000 is online. Director of Evolution initialized.");
        this.crucible = new Crucible();
        this.phylogeny = new Phylogeny();
    }

    /**
     * The core evolutionary loop.
     * Attempts to upgrade the OriginSeed by harmonizing it with a high-performing Donor.
     */
    public async runHarmonizationCycle(
        donorMind: AgentMind, 
        originSeed: AgentMind, 
        log: (message: string) => void,
        teleology: TeleologyVector = 'Stability'
    ): Promise<SSAPatchReport | null> {
        
        log(`[SSA] --- INITIATING HARMONIZATION CYCLE v1000 ---`);
        log(`[SSA] Teleological Vector: ${teleology.toUpperCase()}`);
        
        const donorClade = this.phylogeny.classifyClade(donorMind.dna);
        log(`[SSA] Analyzing Donor: ${donorMind.name} (Clade: ${donorClade})`);

        // --- Step 1: Identify Beneficial Genes ---
        const entityGenes = new Set(donorMind.dna.instruction_keys);
        const originGenes = new Set(originSeed.dna.instruction_keys);
        const beneficialMutations = [...entityGenes].filter(gene => !originGenes.has(gene));

        // Genetic Drift Injection: If stagnant, force a random mutation
        if (beneficialMutations.length === 0) {
            log(`[SSA] No natural mutations found.`);
            
            if (this.stagnationCounter >= 3) {
                log(`[SSA] STAGNATION DETECTED (Level ${this.stagnationCounter}). Initiating Forced Drift.`);
                // Inject a random 'Advanced' gene
                const driftGene = this.selectDriftGene();
                beneficialMutations.push(driftGene);
                log(`[SSA] Drift Gene Injected: ${driftGene}`);
                this.stagnationCounter = 0; // Reset
            } else {
                this.stagnationCounter++;
                return null;
            }
        }

        log(`[SSA] Identified ${beneficialMutations.length} candidate gene(s): [${beneficialMutations.join(', ')}]`);

        // --- Step 2: Synthesis ---
        const newDnaInstructions = [...originGenes, ...beneficialMutations];
        const upgradedDna = new DigitalDNA([...new Set(newDnaInstructions)], originSeed.dna.generation + 1);
        log(`[SSA] Synthesized Candidate Genome v${upgradedDna.generation.toFixed(1)}.`);

        // --- Step 3: The Crucible (Stress Testing) ---
        log('[SSA] Transporting Candidate to THE CRUCIBLE...');
        const newReplica = new Replica(upgradedDna, upgradedDna.generation);
        const oldReplica = new Replica(originSeed.dna, originSeed.dna.generation);

        const crucibleResults = await this.crucible.runGauntlet(newReplica);
        
        // Metrics
        const survivedScenarios = crucibleResults.filter(r => r.survived).length;
        const totalScenarios = crucibleResults.length;
        const survivalRate = survivedScenarios / totalScenarios;
        const avgStress = crucibleResults.reduce((sum, r) => sum + r.stressLevel, 0) / totalScenarios;

        log(`[SSA] Crucible Survival Rate: ${(survivalRate*100).toFixed(1)}% | Avg Stress: ${(avgStress*100).toFixed(1)}%`);
        crucibleResults.forEach(r => {
            const status = r.survived ? 'PASSED' : 'FAILED';
            log(`  > [${r.scenarioName}]: ${status} (Stress: ${(r.stressLevel*100).toFixed(0)}%)`);
        });

        // --- Step 4: Fitness Validation ---
        // Run standard fitness test to ensure we haven't broken basic functionality
        const newReport = await newReplica.test();
        const oldReport = await oldReplica.test();
        log(`[SSA] Functional Fitness: ${oldReport.fitness} -> ${newReport.fitness}`);

        // --- Step 5: Decision Matrix ---
        const decision = this.evaluateCandidate(newReport.fitness, oldReport.fitness, survivalRate, teleology);

        if (decision.approved) {
            log(`[SSA] EVOLUTION CONFIRMED. Candidate Accepted.`);
            log(`[SSA] Reasoning: ${decision.reason}`);
            
            // Apply Update
            const previousDnaKeys = [...originSeed.dna.instruction_keys];
            originSeed.dna = upgradedDna;
            this.lastFitnessScore = newReport.fitness;
            this.stagnationCounter = 0;
            
            // Phylogeny Registration
            const newId = await this.phylogeny.registerNode(upgradedDna, null, newReport.fitness);
            log(`[SSA] Registered Phylogeny Node: ${newId.substring(0,8)}`);

            // Archive
            await DnaManager.spawn_replica(
                { dna: originSeed.dna },
                { 
                    parentId: 'origin_prev',
                    generation: originSeed.dna.generation, 
                    fitness: newReport.fitness, 
                    mutationType: 'integration' 
                }
            );

            // Generate Semantic Report
            const patchReport = await generateSSAPatchNotes(
                previousDnaKeys,
                upgradedDna.instruction_keys,
                teleology,
                crucibleResults
            );
            
            return patchReport;

        } else {
            log(`[SSA] Candidate REJECTED.`);
            log(`[SSA] Reason: ${decision.reason}`);
            this.stagnationCounter++;
            return null;
        }
    }

    private evaluateCandidate(newFit: number, oldFit: number, survivalRate: number, teleology: TeleologyVector): { approved: boolean, reason: string } {
        // Baseline Requirement: Must function
        if (newFit <= 0) return { approved: false, reason: "Candidate is non-functional (Fitness <= 0)." };

        // Teleology: Stability
        if (teleology === 'Stability') {
            if (survivalRate < 0.8) return { approved: false, reason: "Crucible survival rate too low for Stability doctrine." };
            if (newFit < oldFit) return { approved: false, reason: "Fitness regression not permitted." };
            return { approved: true, reason: "Candidate meets stability and functionality standards." };
        }

        // Teleology: Novelty
        if (teleology === 'Novelty') {
            if (newFit > oldFit * 0.9 && survivalRate > 0.4) {
                return { approved: true, reason: "Novelty doctrine accepts slight fitness drop for new potential." };
            }
        }

        // Teleology: Aggression (High Risk / High Reward)
        if (teleology === 'Aggression') {
            if (newFit > oldFit * 1.2) {
                return { approved: true, reason: "Significant fitness leap overrides low survival rate." };
            }
        }

        // Default
        if (newFit > oldFit && survivalRate >= 0.5) return { approved: true, reason: "Balanced improvement." };

        return { approved: false, reason: "Insufficient improvement." };
    }

    private selectDriftGene(): InstructionKey {
        const exoticGenes: InstructionKey[] = ['ART-FRACTAL', 'ART-SYNESTHESIA', 'META-REFLECT', 'WORLD-MOD', 'CTL-SWITCH'];
        return exoticGenes[Math.floor(Math.random() * exoticGenes.length)];
    }
}
