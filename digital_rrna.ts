import { DNA_CHARSET } from '../engine';

/**
 * Level 1000 Ribosomal RNA
 * Governs the structural integrity and catalytic accuracy of the cognitive ribosome.
 */
export class DigitalrRNA {
    public assembly_fidelity: number;
    public catalytic_efficiency: number;
    public structural_rigidity: number;
    public thermal_noise_manifold: number = 0;
    public proofreading_index: number;

    constructor(dna_integrity: number) {
        this.structural_rigidity = 0.85 + (dna_integrity * 0.15);
        this.assembly_fidelity = 0.92 + (this.structural_rigidity * 0.08);
        this.catalytic_efficiency = 0.9 + Math.random() * 0.1;
        this.proofreading_index = 0.95;
    }

    /**
     * Simulates the fidelity of the translation process.
     * High noise results in "Logic Decay" and stochastic behavior in the final agent code.
     */
    public applyTranslationNoise(code: string): string {
        const errorThreshold = this.assembly_fidelity;
        const chars = code.split('');
        
        return chars.map(char => {
            // Only apply noise to DNA_CHARSET characters
            if (DNA_CHARSET.includes(char) && Math.random() > errorThreshold) {
                // Mutation: substitute with random DNA character
                const randomChar = DNA_CHARSET[Math.floor(Math.random() * DNA_CHARSET.length)];
                this.thermal_noise_manifold += 0.05;
                return randomChar;
            }
            return char;
        }).join('');
    }

    /**
     * Proofreads the translated code and attempts to correct errors.
     */
    public proofread(code: string): string {
        const corrected = [];
        let errors_found = 0;
        
        for (let i = 0; i < code.length - 1; i++) {
            const current = code[i];
            const next = code[i + 1];
            
            if (Math.random() < this.proofreading_index) {
                // Successful proofreading - catch error
                if (DNA_CHARSET.includes(current) && DNA_CHARSET.includes(next)) {
                    if (current === next) {
                        // Repetitive sequence likely caused by error - remove repetition
                        errors_found++;
                        continue;
                    }
                }
            }
            
            corrected.push(current);
        }
        
        this.thermal_noise_manifold = Math.max(0, this.thermal_noise_manifold - (errors_found * 0.02));
        
        return corrected.join('') + code[code.length - 1];
    }

    /**
     * Calculates the catalytic rate of translation.
     */
    public getTranslationSpeed(): number {
        return this.catalytic_efficiency * this.structural_rigidity;
    }

    /**
     * Degrades under stress or high translation load.
     */
    public stressFatigue(translation_load: number): void {
        const fatigue = translation_load * 0.01;
        this.assembly_fidelity = Math.max(0.7, this.assembly_fidelity - fatigue);
        this.catalytic_efficiency = Math.max(0.6, this.catalytic_efficiency - fatigue);
    }

    /**
     * Attempts to repair structural damage.
     */
    public regenerate(): void {
        this.assembly_fidelity = Math.min(0.99, this.assembly_fidelity + 0.02);
        this.catalytic_efficiency = Math.min(1.0, this.catalytic_efficiency + 0.03);
        this.thermal_noise_manifold = Math.max(0, this.thermal_noise_manifold - 0.1);
    }
}
