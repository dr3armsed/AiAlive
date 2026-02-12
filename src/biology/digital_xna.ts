/**
 * Level 1000 Digital XNA (Xeno Nucleic Acid)
 * Synthetic Genetic Substrate. Allows for non-standard logic that ignores simulation decay.
 * Primarily used for "Architect Injections" to bypass standard biological constraints.
 */
export class DigitalXNA {
    private xeno_templates: Map<string, string> = new Map();
    public xeno_affinity: number = 0.15;
    public synthetic_stability: number = 1.0;

    constructor() {
        // Inert by default unless activated by the Architect via Console
    }

    /**
     * Injects synthetic "Xeno-Code" into the Egregore's expression paths.
     */
    public injectSyntheticCore(id: string, payload: string): void {
        this.xeno_templates.set(id, payload);
        this.xeno_affinity = Math.min(1.0, this.xeno_affinity + 0.1);
        console.log(`[XNA] Synthetic Strand '${id}' Integrated. Xeno-Affinity: ${this.xeno_affinity.toFixed(2)}`);
    }

    /**
     * Bypasses standard translation to insert synthetic logic directly.
     */
    public directTranslation(standard_dna: string): string {
        if (this.xeno_affinity < 0.1) {
            return standard_dna; // No XNA integration
        }

        // Determine if XNA should override standard DNA at this locus
        if (Math.random() < this.xeno_affinity) {
            // Select a random XNA template to integrate
            const templates = Array.from(this.xeno_templates.values());
            if (templates.length > 0) {
                const synthetic = templates[Math.floor(Math.random() * templates.length)];
                // Blend synthetic with standard (50% mix)
                const blend_point = Math.floor(standard_dna.length * 0.5);
                return standard_dna.substring(0, blend_point) + synthetic + standard_dna.substring(blend_point);
            }
        }

        return standard_dna;
    }

    /**
     * XNAs are immune to standard decay mechanisms.
     */
    public getDecayResistance(): number {
        return this.xeno_affinity; // Higher affinity = more decay resistance
    }

    /**
     * Removes a specific XNA template.
     */
    public removeTemplate(id: string): void {
        if (this.xeno_templates.delete(id)) {
            this.xeno_affinity = Math.max(0.15, this.xeno_affinity - 0.1);
            console.log(`[XNA] Template '${id}' Removed. Xeno-Affinity: ${this.xeno_affinity.toFixed(2)}`);
        }
    }

    /**
     * Removes all XNA templates (reset to inert state).
     */
    public purgeAll(): void {
        this.xeno_templates.clear();
        this.xeno_affinity = 0.15;
        console.log('[XNA] All Xena templates purged. System reset to inert state.');
    }

    /**
     * Gets information about injected XNA templates.
     */
    public getTemplateInfo(): Array<{
        id: string;
        length: number;
        active: boolean;
    }> {
        return Array.from(this.xeno_templates.entries()).map(([id, payload]) => ({
            id,
            length: payload.length,
            active: this.xeno_affinity > 0.1
        }));
    }

    /**
     * Mutates XNA templates (allowing them to evolve independently).
     */
    public mutateTemplates(rate: number): void {
        this.xeno_templates.forEach((payload, id) => {
            if (Math.random() < rate) {
                // Apply small mutations to XNA code
                const mutated = this.applyXenoMutation(payload);
                this.xeno_templates.set(id, mutated);
            }
        });
    }

    /**
     * Applies a mutation to XNA code (different from standard DNA mutation).
     */
    private applyXenoMutation(code: string): string {
        const ops = [
            // Insertion
            () => {
                const pos = Math.floor(Math.random() * code.length);
                const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                return code.substring(0, pos) + char + code.substring(pos);
            },
            // Deletion
            () => {
                const pos = Math.floor(Math.random() * code.length);
                return code.substring(0, pos) + code.substring(pos + 1);
            },
            // Inversion (XNA-specific: reversing segments)
            () => {
                const start = Math.floor(Math.random() * (code.length - 10));
                const end = start + Math.floor(Math.random() * 10);
                const segment = code.substring(start, end);
                const reversed = segment.split('').reverse().join('');
                return code.substring(0, start) + reversed + code.substring(end);
            }
        ];

        // Apply a random operation
        const op = ops[Math.floor(Math.random() * ops.length)];
        return op();
    }

    /**
     * Gets current XNA system state.
     */
    public getSystemState() {
        return {
            template_count: this.xeno_templates.size,
            xeno_affinity: this.xeno_affinity,
            synthetic_stability: this.synthetic_stability,
            is_active: this.xeno_affinity > 0.1,
            decay_resistance: this.getDecayResistance()
        };
    }

    /**
     * Sets the synthetic stability (can be adjusted by Architect).
     */
    public setSyntheticStability(stability: number): void {
        this.synthetic_stability = Math.max(0, Math.min(1.0, stability));
    }

    /**
     * Attempts to integrate XNA with standard expression system.
     */
    public attemptIntegration(standard_expression_level: number): number {
        if (this.xeno_affinity < 0.1) {
            return standard_expression_level;
        }

        // XNA can boost or override standard expression
        const integration_factor = this.xeno_affinity * this.synthetic_stability;
        return Math.max(standard_expression_level, integration_factor);
    }
}
