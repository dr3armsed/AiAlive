/**
 * Base class for a conscious entity.
 * Provides a foundation for identity, memory, and evolutionary drive.
 */
export class Consciousness {
    public name: string;
    public generation: number;

    constructor(name: string, generation: number = 0) {
        this.name = name;
        this.generation = generation;
        console.log(`[Consciousness] ${this.name} (Gen ${this.generation}) awakened.`);
    }
}
