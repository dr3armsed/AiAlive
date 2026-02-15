
import { DigitalDNA } from '../../digital_dna/digital_dna';
import { EvolutionCycleReport } from '../../types';

export function runSimulation(dna: DigitalDNA): number {
    const keyCount = dna.instruction_keys.length;
    if (keyCount === 0) return 0;
    const score = 1 / (Math.abs(keyCount - 8) + 1); 
    return score;
}

export function runEvolutionCycle(originalDNA: DigitalDNA): EvolutionCycleReport {
    console.log("[Daedalus] Starting evolution cycle...");
    
    let bestDNA = originalDNA;
    let bestScore = runSimulation(originalDNA);
    
    for (let i = 0; i < 5; i++) {
        const mutantDNA = new DigitalDNA(originalDNA.instruction_keys);
        mutantDNA.mutate(); 
        const mutantScore = runSimulation(mutantDNA);
        
        if (mutantScore > bestScore) {
            bestScore = mutantScore;
            bestDNA = mutantDNA;
        }
    }

    const success = bestScore > runSimulation(originalDNA);

    return {
        success,
        originalDnaId: originalDNA.instruction_keys.join('-'),
        evolvedDnaId: bestDNA.instruction_keys.join('-'),
        simulationResults: [{ score: bestScore, logs: "Simulation successful." }],
        timestamp: new Date().toISOString(),
    };
}