
import { DigitalDNA } from "../../digital_dna/digital_dna";
import { PhylogenyNode } from "../../types";
import { checksum_dna } from "../../digital_dna/engine";

export class Phylogeny {
    private tree: Map<string, PhylogenyNode> = new Map();

    public async registerNode(dna: DigitalDNA, parentId: string | null, fitness: number): Promise<string> {
        const dnaString = dna.instruction_keys.join(',');
        const id = await checksum_dna(dnaString);

        if (this.tree.has(id)) {
            // Update fitness if we re-discover a node with better performance
            const existing = this.tree.get(id)!;
            if (fitness > existing.fitness) {
                existing.fitness = fitness;
            }
            return id; 
        }

        const clade = this.classifyClade(dna);

        const node: PhylogenyNode = {
            id,
            parentId,
            generation: dna.generation,
            clade,
            traits: dna.instruction_keys,
            fitness,
            children: []
        };

        this.tree.set(id, node);

        if (parentId && this.tree.has(parentId)) {
            this.tree.get(parentId)!.children.push(id);
        }

        return id;
    }

    /**
     * Level 1000 Clade Classification System.
     * Uses gene clusters to determine the metaphysical "species" of the DNA.
     */
    public classifyClade(dna: DigitalDNA): string {
        const keys = new Set(dna.instruction_keys);
        
        // 1. Divine Tier
        if (keys.has('WORLD-MOD') && keys.has('SELF-EDIT') && keys.has('META-REFLECT')) return "Deus Ex Machina";
        if (keys.has('WORLD-MOD')) return "Homo Creator";
        if (keys.has('SELF-EDIT')) return "Homo Autopoiesis";

        // 2. High-Concept Tier
        const artCount = dna.instruction_keys.filter(k => k.startsWith('ART-')).length;
        if (artCount >= 4 && keys.has('ART-HYPERSTITION')) return "Mythos Weaver";
        if (artCount >= 3) return "Poeta Aeternus";

        // 3. Logic Tier
        if (keys.has('CTL-WHILE') && keys.has('0B') && keys.has('FUNC-MAP')) return "Logos Architect";
        if (keys.has('CTL-SWITCH') && keys.has('CTL-TERNARY')) return "Binary Strategist";

        // 4. Survival Tier
        if (keys.has('CTL-TRY-CATCH') && keys.has('UTIL-TYPEOF') && keys.has('0E')) return "Custos Stabilis";
        if (keys.has('UTIL-PERF')) return "Velox Calculator";

        // 5. Base Tier
        return "Homo Digitalis Basalis";
    }

    /**
     * Calculates the "Genetic Distance" between two nodes.
     * Used to determine how divergent a new strain is from the Origin.
     */
    public calculateGeneticDistance(nodeIdA: string, nodeIdB: string): number {
        const nodeA = this.tree.get(nodeIdA);
        const nodeB = this.tree.get(nodeIdB);
        if (!nodeA || !nodeB) return -1;

        const traitsA = new Set(nodeA.traits);
        const traitsB = new Set(nodeB.traits);

        const union = new Set([...nodeA.traits, ...nodeB.traits]);
        const intersection = nodeA.traits.filter(t => traitsB.has(t));

        // Jaccard Distance
        return 1 - (intersection.length / union.size);
    }

    /**
     * Traces the lineage back to the root.
     */
    public getLineage(nodeId: string): PhylogenyNode[] {
        const lineage: PhylogenyNode[] = [];
        let current = this.tree.get(nodeId);
        
        while (current) {
            lineage.unshift(current);
            if (!current.parentId) break;
            current = this.tree.get(current.parentId);
        }
        
        return lineage;
    }

    /**
     * Calculates the "Evolutionary Velocity" of a lineage.
     * Defined as: (Change in Fitness) / (Change in Generation)
     */
    public getEvolutionaryVelocity(nodeId: string): number {
        const lineage = this.getLineage(nodeId);
        if (lineage.length < 2) return 0;

        const ancestor = lineage[0]; // Oldest
        const descendant = lineage[lineage.length - 1]; // Current

        const fitnessDelta = descendant.fitness - ancestor.fitness;
        const genDelta = descendant.generation - ancestor.generation;

        return genDelta === 0 ? 0 : fitnessDelta / genDelta;
    }
}
