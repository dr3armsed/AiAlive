import { GlossaryEntry, TheoryStatus, TheoryRecord, EvidenceRecord, TheoryRevision } from '../types';
import * as geminiServices from '../services/geminiServices/index';

export class TheoryFormation {
    private theories: Map<string, TheoryRecord> = new Map();

    async createTheory(name: string, description: string): Promise<TheoryRecord> {
        const newTheory: TheoryRecord = {
            id: `theory_${Date.now()}`,
            name,
            description,
            status: TheoryStatus.UNTESTED,
            evidence: [],
            revisions: [],
            createdAt: new Date().toISOString(),
        };
        this.theories.set(newTheory.id, newTheory);
        
        // Use Gemini to get an initial elaboration
        const elaboration = await geminiServices.generateTheoryFromText(description);
        newTheory.description += `\n\n[AI Elaboration]: ${elaboration}`;

        return newTheory;
    }

    async addEvidence(theoryId: string, evidence: EvidenceRecord): Promise<TheoryRecord | undefined> {
        const theory = this.theories.get(theoryId);
        if (theory) {
            theory.evidence.push(evidence);
            const result = await geminiServices.testTheoryAgainstEvidence(theory.description, evidence.description);
            if(result.supports_theory) {
                theory.status = TheoryStatus.CORROBORATED;
            } else {
                theory.status = TheoryStatus.CONTRADICTED;
                await this.reviseTheory(theoryId, `Contradicted by evidence: ${evidence.id}. Reason: ${result.explanation}`);
            }
            return theory;
        }
        return undefined;
    }

    async reviseTheory(theoryId: string, reason: string): Promise<TheoryRecord | undefined> {
        const theory = this.theories.get(theoryId);
        if (theory) {
            const refinedDescription = await geminiServices.refineTheory(theory.description, reason);
            const revision: TheoryRevision = {
                reason,
                revisedDescription: refinedDescription,
                timestamp: new Date().toISOString(),
            };
            theory.revisions.push(revision);
            theory.description = refinedDescription;
            theory.status = TheoryStatus.REVISED;
            return theory;
        }
        return undefined;
    }
}