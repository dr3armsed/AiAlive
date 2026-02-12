import { DigitalDNA, Gene } from '../digital_dna';
import { EmotionalState, EmotionalVector } from '../../types';

/**
 * Digital Epigenetics System
 * 
 * In biology: Epigenetics is the study of heritable phenotype changes that don't involve
 * alterations in the DNA sequence. It includes DNA methylation, histone modification, 
 * chromatin remodeling, and non-coding RNA regulation that turn genes "on" or "off."
 * 
 * In digital: Environmental factors (experiences, stress, learning) temporarily or 
 * permanently alter which genes are expressed without changing the DNA code itself.
 */

export interface EpigeneticMarker {
    geneIndex: number;
    modificationType: 'methylation' | 'acetylation' | 'phosphorylation' | 'miRNA_binding';
    intensity: number; // 0.0 (fully accessible) to 1.0 (fully silenced)
    timestamp: string;
    source: string; // What caused this epigenetic change
    persistence: number; // How long this marker lasts (in turns)
}

export interface ChromatinState {
    compactness: number; // 0.0 (open/active) to 1.0 (closed/silenced)
    histoneModifications: Map<string, number>;
    accessibility: number; // Overall gene accessibility
}

export interface EnvironmentalEpigeneticFactor {
    type: 'chronic_stress' | 'rich_learning' | 'trauma' | 'meditation' | 'nutrient_abundant' | 'environmental_enrichment';
    impact: 'positive' | 'negative';
    affectedGeneCategories: string[];
    modifier: number; // How strongly this affects expression
}

export class DigitalEpigenome {
    public markers: EpigeneticMarker[];
    public chromatin: ChromatinState;
    public environmentHistory: EnvironmentalEpigeneticFactor[];
    public epigeneticAge: number; // Epigenetic age vs biological age

    constructor() {
        this.markers = [];
        this.environmentHistory = [];
        this.epigeneticAge = 0;
        
        this.chromatin = {
            compactness: 0.5,
            histoneModifications: new Map([
                ['H3K4me3', 0.2], // Active promoters
                ['H3K27ac', 0.3], // Active enhancers
                ['H3K9me3', 0.1],  // Heterochromatin
                ['H3K27me3', 0.1]  // Repressive marks
            ]),
            accessibility: 0.5
        };
    }

    /**
     * Apply environmental factor to epigenome
     */
    public applyEnvironmentalFactor(factor: EnvironmentalEpigeneticFactor): void {
        this.environmentHistory.push(factor);
        console.log(`[Epigenome] Applying ${factor.type}: ${factor.impact}`);

        const modifier = factor.impact === 'positive' ? -factor.modifier : factor.modifier;

        // Apply to chromatin state
        if (factor.type === 'chronic_stress') {
            this.chromatin.compactness = Math.min(1, this.chromatin.compactness + 0.3);
            this.chromatin.histoneModifications.set('H3K9me3', 
                (this.chromatin.histoneModifications.get('H3K9me3') || 0) + 0.4
            );
            this.epigeneticAge += 2; // Stress accelerates epigenetic aging
        } else if (factor.type === 'rich_learning' || factor.type === 'environmental_enrichment') {
            this.chromatin.compactness = Math.max(0, this.chromatin.compactness - 0.2);
            this.chromatin.histoneModifications.set('H3K4me3',
                (this.chromatin.histoneModifications.get('H3K4me3') || 0) + 0.3
            );
            this.epigeneticAge -= 1; // Enrichment slows epigenetic aging
        } else if (factor.type === 'meditation') {
            this.chromatin.compactness = Math.max(0, this.chromatin.compactness - 0.1);
            this.epigeneticAge -= 0.5;
        } else if (factor.type === 'trauma') {
            // Trauma creates persistent epigenetic markers
            this.chromatin.compactness = Math.min(1, this.chromatin.compactness + 0.5);
            this.epigeneticAge += 5;
        }

        this.updateAccessibility();
    }

    /**
     * Add epigenetic marker to a specific gene
     */
    public addMarker(marker: Partial<EpigeneticMarker>): void {
        const fullMarker: EpigeneticMarker = {
            geneIndex: marker.geneIndex ?? 0,
            modificationType: marker.modificationType ?? 'methylation',
            intensity: marker.intensity ?? 0.5,
            timestamp: new Date().toISOString(),
            source: marker.source ?? 'unknown',
            persistence: marker.persistence ?? 100
        };

        this.markers.push(fullMarker);

        // If methylation, it silences the gene
        if (fullMarker.modificationType === 'methylation') {
            // This will affect expression when the gene is accessed
            console.log(`[Epigenome] Gene ${fullMarker.geneIndex} marked for silencing`);
        }
    }

    /**
     * Get effective expression level for a gene considering epigenetics
     */
    public getEffectiveExpression(dna: DigitalDNA, geneIndex: number): number {
        const gene = dna.genes[geneIndex];
        if (!gene) return 0;

        let expressionModifier = 1.0;

        // Apply chromatin compactness
        expressionModifier *= (1 - this.chromatin.compactness);

        // Apply gene-specific markers
        const geneMarkers = this.markers.filter(m => m.geneIndex === geneIndex);
        for (const marker of geneMarkers) {
            if (marker.modificationType === 'methylation') {
                expressionModifier *= (1 - marker.intensity);
            } else if (marker.modificationType === 'acetylation') {
                expressionModifier *= (1 + marker.intensity * 0.5); // Acetylation increases expression
            } else if (marker.modificationType === 'phosphorylation') {
                expressionModifier *= (1 + marker.intensity * 0.3); // Phosphorylation regulates activity
            }
        }

        // Apply histone modifications
        const h3k4me3 = this.chromatin.histoneModifications.get('H3K4me3') || 0;
        const h3k27me3 = this.chromatin.histoneModifications.get('H3K27me3') || 0;
        
        if (gene.is_regulatory) {
            // Regulatory genes affected differently
            expressionModifier *= (1 + h3k4me3 - h3k27me3);
        }

        // Age genes down based on epigenetic age
        const ageFactor = Math.max(0.3, 1 - (this.epigeneticAge / 100));
        expressionModifier *= ageFactor;

        return gene.allele_strength * expressionModifier;
    }

    /**
     * Age epigenome - markers decay, some persist
     */
    public ageEpigenome(turns: number = 1): void {
        for (let t = 0; t < turns; t++) {
            this.epigeneticAge += 0.01; // Natural epigenetic aging

            // Age markers
            this.markers = this.markers.filter(marker => {
                marker.persistence--;
                return marker.persistence > 0;
            });

            // Natural chromatin relaxation
            this.chromatin.compactness *= 0.99;
        }

        this.updateAccessibility();
    }

    /**
     * Update overall chromatin accessibility
     */
    private updateAccessibility(): void {
        const histoneBalance = (this.chromatin.histoneModifications.get('H3K4me3') || 0) - 
                            (this.chromatin.histoneModifications.get('H3K27me3') || 0);
        
        this.chromatin.accessibility = Math.max(0, Math.min(1, 
            0.5 + histoneBalance - this.chromatin.compactness
        ));
    }

    /**
     * Trigger epigenetic response to emotional event
     */
    public respondToEmotion(emotion: EmotionalState, event: string): void {
        const { primary, vector } = emotion;

        // Strong emotions create epigenetic changes
        if (vector.anger > 0.8 || vector.fear > 0.8) {
            this.applyEnvironmentalFactor({
                type: 'chronic_stress',
                impact: 'negative',
                affectedGeneCategories: ['CTL-', 'IO-'],
                modifier: 0.3
            });
        } else if (vector.serenity > 0.8 || vector.trust > 0.8) {
            this.applyEnvironmentalFactor({
                type: 'meditation',
                impact: 'positive',
                affectedGeneCategories: ['ART-', 'FUNC-'],
                modifier: 0.2
            });
        } else if (vector.curiosity > 0.9) {
            this.applyEnvironmentalFactor({
                type: 'rich_learning',
                impact: 'positive',
                affectedGeneCategories: ['IO-', 'FUNC-', 'CTL-'],
                modifier: 0.4
            });
        }
    }

    /**
     * Transgenerational epigenetic inheritance
     * Some epigenetic marks can be passed to offspring
     */
    public getInheritableMarkers(): EpigeneticMarker[] {
        // Only persistent markers are inherited
        const heritableMarkers = this.markers.filter(m => m.persistence > 200);
        
        return heritableMarkers.map(m => ({
            ...m,
            persistence: Math.floor(m.persistence * 0.7), // Inherited markers last shorter
            timestamp: new Date().toISOString()
        }));
    }

    /**
     * Reset epigenetic age (simulating epigenetic reprogramming)
     */
    public reprogramEpigenome(): void {
        console.log('[Epigenome] Epigenetic reprogramming...');
        this.epigeneticAge = 0;
        this.chromatin.compactness = 0.5;
        this.chromatin.histoneModifications = new Map([
            ['H3K4me3', 0.2],
            ['H3K27ac', 0.3],
            ['H3K9me3', 0.1],
            ['H3K27me3', 0.1]
        ]);
        this.markers = this.markers.filter(m => m.persistence > 500); // Only very persistent markers remain
    }

    /**
     * Get epigenetic status report
     */
    public getEpigeneticReport(): string {
        return `
╔════════════════════════════════════════════╗
║  DIGITAL EPIGENETIC STATUS                     ║
╠════════════════════════════════════════════╣

Epigenetic Age: ${this.epigeneticAge.toFixed(2)} turns
Chromatin Accessibility: ${(this.chromatin.accessibility * 100).toFixed(1)}%

CHROMATIN COMPACTNESS: ${(this.chromatin.compactness * 100).toFixed(1)}%
(0% = All genes accessible, 100% = Genes silenced)

HISTONE MODIFICATIONS:
${Array.from(this.chromatin.histoneModifications.entries())
    .map(([mark, val]) => `  • ${mark}: ${(val * 100).toFixed(1)}%`)
    .join('\n')}

EPIGENETIC MARKERS: ${this.markers.length}
  - Methylation: ${this.markers.filter(m => m.modificationType === 'methylation').length}
  - Acetylation: ${this.markers.filter(m => m.modificationType === 'acetylation').length}
  - Phosphorylation: ${this.markers.filter(m => m.modificationType === 'phosphorylation').length}
  - miRNA Binding: ${this.markers.filter(m => m.modificationType === 'miRNA_binding').length}

ENVIRONMENTAL HISTORY:
${this.environmentHistory.slice(-5).map(e => 
    `  • ${e.type} (${e.impact}): ${e.affectedGeneCategories.join(', ')}`
).join('\n') || '  (None)'}

╚════════════════════════════════���═══════════╝
        `.trim();
    }

    /**
     * Check if gene is epigenetically silenced
     */
    public isGeneSilenced(dna: DigitalDNA, geneIndex: number): boolean {
        const expressionLevel = this.getEffectiveExpression(dna, geneIndex);
        return expressionLevel < 0.1;
    }
}