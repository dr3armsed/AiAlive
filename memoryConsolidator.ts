import { MemoryRecord } from '../types';

export class MemoryConsolidator {
    public short_term_memory: MemoryRecord[] = [];
    public long_term_memory: MemoryRecord[] = [];

    storeMemory(entry: Omit<MemoryRecord, 'id' | 'context' | 'last_accessed' | 'retrieval_count' | 'confidence' | 'tags' | 'decay' | 'reinforcement' | 'source' | 'attributes' | 'decay_factor' | 'encoding_time'>): void {
        const now = new Date().toISOString();
        const newRecord: MemoryRecord = {
            ...entry,
            id: `mem_${Date.now()}`,
            context: {},
            last_accessed: now,
            retrieval_count: 0,
            confidence: 1.0,
            tags: [],
            decay: 0,
            reinforcement: [],
            source: 'experience',
            attributes: {},
            decay_factor: 1.0,
            encoding_time: now,
        };
        this.short_term_memory.push(newRecord);
    }

    consolidate(): void {
        if (this.short_term_memory.length === 0) return;

        this.short_term_memory.sort((a, b) => b.importance - a.importance);
        const toConsolidate = this.short_term_memory.shift();
        if (toConsolidate) {
            this.long_term_memory.push(toConsolidate);
            console.log(`[Memory] Consolidated memory: ${toConsolidate.id}`);
        }
    }
}
