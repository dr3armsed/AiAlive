import { BeliefRecord, RetractionInfo } from '../types';

export class BeliefSystem {
    private beliefs: Map<string, BeliefRecord> = new Map();

    addBelief(id: string, statement: string, conviction: number, source: string): void {
        if (this.beliefs.has(id)) {
            this.updateBelief(id, { conviction: conviction + 0.1 }); // Reinforce
        } else {
            this.beliefs.set(id, {
                id,
                statement,
                conviction,
                source,
                timestamp: new Date().toISOString(),
                evidence: [source],
            });
        }
    }

    getBelief(id: string): BeliefRecord | undefined {
        return this.beliefs.get(id);
    }

    getAllBeliefs(): BeliefRecord[] {
        return Array.from(this.beliefs.values());
    }

    updateBelief(id: string, updates: Partial<BeliefRecord>): BeliefRecord | undefined {
        const belief = this.beliefs.get(id);
        if (belief) {
            const updatedBelief = { ...belief, ...updates, timestamp: new Date().toISOString() };
            this.beliefs.set(id, updatedBelief);
            return updatedBelief;
        }
        return undefined;
    }

    retractBelief(id: string, reason: string): RetractionInfo | null {
        if (this.beliefs.has(id)) {
            const belief = this.beliefs.get(id)!;
            this.beliefs.delete(id);
            return {
                retractedBeliefId: id,
                reason,
                timestamp: new Date().toISOString(),
                originalConviction: belief.conviction,
            };
        }
        return null;
    }
}
