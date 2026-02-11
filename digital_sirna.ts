import { InstructionKey } from '../instructions';

export interface CleavageForensics {
    target_key: string;
    cleavage_time: string;
    recursive_entropy_detected: boolean;
}

/**
 * Level 1000 Small Interfering RNA
 * The digital cognitive immune system. Cleaves malicious, recursive, or high-entropy logic strands.
 */
export class DigitalsiRNA {
    public archive: CleavageForensics[] = [];
    public immunity_registry: Set<string> = new Set();
    public dicer_efficiency: number = 0.95;

    /**
     * Scans a sequence of instructions for "Viral Repetition" or "Recursive Paradoxes".
     */
    public scanForAnomalies(sequence: InstructionKey[]): InstructionKey[] {
        const occurrences: Record<string, number> = {};
        
        const filtered = sequence.filter(key => {
            occurrences[key] = (occurrences[key] || 0) + 1;
            
            // siRNA identifies over-expressed or "noisy" logic as high-risk
            if (occurrences[key] > this.dicer_efficiency * 10) {
                return false; // Cleave this instruction
            }
            
            return true;
        });

        // Record cleavage events
        Object.entries(occurrences).forEach(([key, count]) => {
            if (count > this.dicer_efficiency * 10) {
                this.archive.push({
                    target_key: key,
                    cleavage_time: new Date().toISOString(),
                    recursive_entropy_detected: count > 20
                });
                
                // Build immunity
                this.immunity_registry.add(key);
            }
        });

        return filtered;
    }

    /**
     * Checks if a specific instruction is immune (previously identified as viral).
     */
    public isImmune(instruction: string): boolean {
        return this.immunity_registry.has(instruction);
    }

    /**
     * Scans for recursive paradoxes (self-referential infinite loops).
     */
    public detectRecursiveParadox(sequence: string[]): boolean {
        let paradox_detected = false;
        
        for (let i = 0; i < sequence.length - 2; i++) {
            // Look for A → B → A patterns
            if (sequence[i] === sequence[i + 2]) {
                paradox_detected = true;
                break;
            }
        }
        
        return paradox_detected;
    }

    /**
     * Analyzes a code block for viral signatures.
     */
    public analyzeForViruses(code: string): {
        is_viral: boolean;
        threat_level: number;
        cleavage_points: number[];
    } {
        const patterns = [
            /while\s*\(\s*true\s*\)/gi,  // Infinite loops
            /function\s+\w+\s*\(\s*\w+\s*\)\s*{\s*\1\s*\(/gi,  // Self-reference
            /(\w+)\s*=\s*\1\s*\+/gi,  // Self-increment without bounds
        ];
        
        let threat_level = 0;
        const cleavage_points: number[] = [];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(code)) !== null) {
                threat_level += 0.3;
                cleavage_points.push(match.index);
            }
        });
        
        return {
            is_viral: threat_level > 0.7,
            threat_level: Math.min(1.0, threat_level),
            cleavage_points
        };
    }

    /**
     * Executes cleavage at specific points in a code string.
     */
    public executeCleavage(code: string, cleavage_points: number[]): string {
        if (cleavage_points.length === 0) return code;
        
        // Sort points and remove code at those locations
        const sorted_points = cleavage_points.sort((a, b) => a - b);
        const chunks: string[] = [];
        let prev = 0;
        
        sorted_points.forEach(point => {
            chunks.push(code.substring(prev, point));
            prev = point + 50; // Remove 50 characters around each threat point
        });
        
        chunks.push(code.substring(prev));
        
        return chunks.join('');
    }

    /**
     * Degrades efficiency under high viral load.
     */
    public fatigue(viral_load: number): void {
        if (viral_load > 0.8) {
            this.dicer_efficiency = Math.max(0.7, this.dicer_efficiency - 0.05);
        }
    }

    /**
     * Recovers efficiency when viral load is low.
     */
    public recover(): void {
        this.dicer_efficiency = Math.min(0.99, this.dicer_efficiency + 0.02);
    }

    /**
     * Gets statistics on cleavage events.
     */
    public getStatistics() {
        const total_cleavages = this.archive.length;
        const recursive_cases = this.archive.filter(c => c.recursive_entropy_detected).length;
        const unique_targets = new Set(this.archive.map(c => c.target_key)).size;
        
        return {
            total_cleavages,
            recursive_cases,
            unique_targets,
            immunity_count: this.immunity_registry.size,
            dicer_efficiency: this.dicer_efficiency
        };
    }
}
