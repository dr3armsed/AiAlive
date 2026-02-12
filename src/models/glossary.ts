import { GlossaryEntry } from '../types';

export class Glossary {
    private terms: Map<string, GlossaryEntry> = new Map();

    defineTerm(term: string, definition: string, source: string): GlossaryEntry {
        const id = term.toLowerCase();
        const newEntry: GlossaryEntry = {
            id,
            term,
            definition,
            source,
            createdAt: new Date().toISOString(),
        };
        this.terms.set(id, newEntry);
        return newEntry;
    }

    getTerm(term: string): GlossaryEntry | undefined {
        return this.terms.get(term.toLowerCase());
    }

    listTerms(): GlossaryEntry[] {
        return Array.from(this.terms.values());
    }
}
