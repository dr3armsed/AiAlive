import { InstructionKey } from '../instructions';

export interface tRNAChargeProfile {
    charge_level: number; // 0 to 1
    affinity_index: number;
    recovery_rate: number;
    error_rate: number;
}

/**
 * Level 1000 Transfer RNA
 * Acts as the metabolic logic-adapter. Specialization ensures that even if a gene exists, 
 * it requires a charged adapter species to be expressed.
 */
export class DigitaltRNA {
    private species_inventory: Map<InstructionKey, tRNAChargeProfile> = new Map();
    public global_metabolism: number = 1.0;
    public synthesis_limit: number = 50;

    constructor(keys: InstructionKey[]) {
        keys.forEach(k => {
            this.species_inventory.set(k, {
                charge_level: 0.8 + Math.random() * 0.2,
                affinity_index: 0.9,
                recovery_rate: 0.05 + Math.random() * 0.1,
                error_rate: 0.001
            });
        });
    }

    /**
     * Checks if a specific tRNA species is available (charged).
     */
    public isAvailable(key: InstructionKey): boolean {
        const profile = this.species_inventory.get(key);
        if (!profile) return false;
        
        return profile.charge_level > 0.3 && this.global_metabolism > 0.5;
    }

    /**
     * Attempts to translate a gene using its tRNA adapter.
     */
    public attemptTranslation(key: InstructionKey): {
        success: boolean;
        translation_quality: number;
        error_probable: boolean;
    } {
        const profile = this.species_inventory.get(key);
        
        if (!profile) {
            return { success: false, translation_quality: 0, error_probable: true };
        }
        
        if (!this.isAvailable(key)) {
            return { success: false, translation_quality: 0, error_probable: true };
        }
        
        // Calculate translation quality based on charge and affinity
        const quality = profile.charge_level * profile.affinity_index * this.global_metabolism;
        const errorProb = Math.random() < profile.error_rate;
        
        // Consume charge during translation
        profile.charge_level *= 0.7;
        
        return {
            success: true,
            translation_quality: quality,
            error_probable: errorProb
        };
    }

    /**
     * Recharges tRNA species based on global metabolism.
     */
    public recharge(key: InstructionKey): void {
        const profile = this.species_inventory.get(key);
        if (!profile) return;
        
        const chargeAmount = profile.recovery_rate * this.global_metabolism;
        profile.charge_level = Math.min(1.0, profile.charge_level + chargeAmount);
    }

    /**
     * Recharges all tRNA species.
     */
    public rechargeAll(): void {
        this.species_inventory.forEach((profile, key) => {
            this.recharge(key);
        });
    }

    /**
     * Adjusts charge profile based on transcription frequency (use it or lose it).
     */
    public adaptUsage(key: InstructionKey, used: boolean): void {
        const profile = this.species_inventory.get(key);
        if (!profile) return;
        
        if (used) {
            // Up-regulate frequently used tRNA
            profile.recovery_rate = Math.min(0.3, profile.recovery_rate + 0.001);
            profile.affinity_index = Math.min(1.0, profile.affinity_index + 0.001);
        } else {
            // Down-regulate unused tRNA
            profile.recovery_rate = Math.max(0.01, profile.recovery_rate - 0.0005);
        }
    }

    /**
     * Modifies global metabolism (can be affected by stress, energy levels, etc).
     */
    public setGlobalMetabolism(level: number): void {
        this.global_metabolism = Math.max(0, Math.min(1.0, level));
    }

    /**
     * Increases synthesis limit (more tRNA species available).
     */
    public expandSynthesisCapacity(limit: number): void {
        this.synthesis_limit = Math.max(10, limit);
    }

    /**
     * Mutates tRNA profiles (small random changes).
     */
    public mutate(rate: number): void {
        this.species_inventory.forEach(profile => {
            if (Math.random() < rate) {
                profile.affinity_index += (Math.random() - 0.5) * 0.1;
                profile.affinity_index = Math.max(0.5, Math.min(1.0, profile.affinity_index));
                
                profile.recovery_rate += (Math.random() - 0.5) * 0.01;
                profile.recovery_rate = Math.max(0.01, Math.min(0.3, profile.recovery_rate));
            }
        });
    }

    /**
     * Gets the overall translation efficiency of the system.
     */
    public getSystemEfficiency(): number {
        let total_charge = 0;
        const count = this.species_inventory.size;
        
        this.species_inventory.forEach(profile => {
            total_charge += profile.charge_level;
        });
        
        return (total_charge / count) * this.global_metabolism;
    }

    /**
     * Gets diagnostic information about the tRNA system.
     */
    public getDiagnostics() {
        const diagnostics = {
            species_count: this.species_inventory.size,
            synthesis_limit: this.synthesis_limit,
            global_metabolism: this.global_metabolism,
            system_efficiency: this.getSystemEfficiency(),
            charged_species: 0,
            depleted_species: 0,
            avg_affinity: 0,
            avg_recovery: 0
        };
        
        this.species_inventory.forEach(profile => {
            if (profile.charge_level > 0.3) diagnostics.charged_species++;
            else diagnostics.depleted_species++;
            
            diagnostics.avg_affinity += profile.affinity_index;
            diagnostics.avg_recovery += profile.recovery_rate;
        });
        
        const count = this.species_inventory.size || 1;
        diagnostics.avg_affinity /= count;
        diagnostics.avg_recovery /= count;
        
        return diagnostics;
    }
}
