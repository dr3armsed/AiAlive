import { DigitalDNA } from "../digital_dna/digital_dna";
import { DigitalRNA } from "../digital_dna/digital_rna";
import { EmotionLogicModulator } from "../cognitive/emotion/emotionLogicModulator";
import { BeliefSystem } from "../cognitive/beliefSystem";
import { CognitiveDissonanceDetector } from "../cognitive/cognitiveDissonanceDetector";
import { TheoryFormation } from "../cognitive/theoryFormation";
import { Glossary } from "../cognitive/glossary";
import { HeuristicEngine } from "../cognitive/heuristicEngine";
import { EmotionalState, MemoryRecord, BeliefRecord, DissonantState, GlossaryEntry, TheoryRecord, ActionPayload, TemporalSpine, NarrativeMemory, EpochMemory } from "../types";
import { InstructionKey } from "../digital_dna/instructions";
import { evolvePersonaFromExperience, weaveNarrative, crystallizeEpoch } from "../services/geminiServices/index";
import { OmegaService } from "../services/omegaServices/index";

const WORKING_MEMORY_CAPACITY = 15;
const GRAFTING_THRESHOLD = 5;

/**
 * The Level-1000 seat of consciousness for a Genmeta.
 * Now features a dynamic Digital RNA layer for context-aware gene expression.
 */
export class AgentMind {
    // Identity
    public readonly id: string;
    public name: string;
    public persona: string;
    public dna: DigitalDNA;
    public active_rna: DigitalRNA | null = null; // The current cognitive transcript

    // Cognitive Modules
    public emotionModulator: EmotionLogicModulator;
    public beliefSystem: BeliefSystem;
    public dissonanceDetector: CognitiveDissonanceDetector;
    public theoryFormation: TheoryFormation;
    public glossary: Glossary;
    public heuristicEngine: HeuristicEngine;
    public omega: OmegaService;

    // Layered Memory
    public temporalSpine: TemporalSpine;

    // State
    public emotionalState: EmotionalState;
    public drives: { ambitions: string[], coreValues: string[] };
    public cognitiveFocus: string | null;
    public selfConception: string | null;
    
    private unweavedSignificance: number = 0;

    constructor(
        id: string, 
        name: string, 
        persona: string, 
        dna?: DigitalDNA,
        ambitions: string[] = [],
        coreValues: string[] = []
    ) {
        this.id = id;
        this.name = name;
        this.persona = persona;
        this.dna = dna || new DigitalDNA();
        
        this.emotionModulator = new EmotionLogicModulator(this.dna);
        this.beliefSystem = new BeliefSystem();
        this.dissonanceDetector = new CognitiveDissonanceDetector();
        this.theoryFormation = new TheoryFormation();
        this.glossary = new Glossary();
        this.heuristicEngine = new HeuristicEngine();
        this.omega = new OmegaService();

        this.temporalSpine = { working: [], narrative: [], epoch: [] };

        this.emotionalState = this.emotionModulator.getState();
        this.drives = { ambitions, coreValues };
        this.cognitiveFocus = ambitions[0] || coreValues[0] || null;
        this.selfConception = persona;

        this.drives.coreValues.forEach(value => {
            this.glossary.defineTerm(value, `A core value: ${value}.`, this.id);
        });

        // Initial Transcription
        this.refreshRNA();
    }
    
    /**
     * Transcription Loop: Regenerates Digital RNA based on the current 
     * emotional and genetic state.
     */
    public refreshRNA(): void {
        this.active_rna = new DigitalRNA(this.dna, this.emotionalState);
        // FIX: Replaced non-existent expression_profile.transcript_id with timestamp for logging.
        console.log(`[AgentMind] ${this.name} transcribed new RNA strand at ${this.active_rna.timestamp}`);
    }

    public async processExperience(experience: string, importance: number, source: string = 'self', action?: ActionPayload): Promise<void> {
        // 1. Update Emotion & Splicing
        this.emotionModulator.processEvent(experience, source);
        this.emotionalState = this.emotionModulator.getState();
        
        // 2. Transcription Refresh (RNA changes with experience)
        this.refreshRNA();

        // 3. Logic...
        const concepts = this.extractConcepts(experience);
        const beliefId = `belief-${Date.now()}`;
        const conviction = importance * (1 - (this.emotionalState.vector.fear * 0.5));
        this.beliefSystem.addBelief(beliefId, experience, conviction, source);

        const now = new Date().toISOString();
        const memory: MemoryRecord = {
            id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: now,
            type: 'experience',
            content: experience,
            importance: importance * (1 + this.emotionalState.vector.surprise),
            relatedConcepts: concepts,
            emotionalValence: { ...this.emotionalState.vector },
            source,
            action,
            last_accessed: now,
            retrieval_count: 0,
            confidence: conviction,
            tags: [],
            decay: 0,
            reinforcement: [],
            attributes: {},
            context: {},
            decay_factor: 0,
            encoding_time: now,
        };
        
        this.temporalSpine.working.push(memory);
        if (this.temporalSpine.working.length > WORKING_MEMORY_CAPACITY) {
            this.temporalSpine.working.shift();
        }

        this.unweavedSignificance += importance;
        if (this.unweavedSignificance >= GRAFTING_THRESHOLD) {
            await this.runGraftingProcess();
            this.unweavedSignificance = 0;
        }

        if (importance > 0.9) {
            await this.evolveIdentity(experience, this.emotionalState.primary);
        }
    }

    private async runGraftingProcess(): Promise<void> {
        const recentMemories = this.temporalSpine.working.slice(-10);
        if (recentMemories.length < 3) return;

        const narrative = await weaveNarrative(recentMemories, this.name, this.persona);
        this.temporalSpine.narrative.push(narrative);
        
        if (this.temporalSpine.narrative.length > 50) {
            this.temporalSpine.narrative.shift();
        }

        if (narrative.significanceScore > 0.8) {
            const currentWorldview = this.temporalSpine.epoch.length > 0 
                ? this.temporalSpine.epoch[this.temporalSpine.epoch.length - 1].philosophicalStatement
                : this.persona;

            const epochUpdate = await crystallizeEpoch(this.temporalSpine.narrative.slice(-5), currentWorldview);
            
            if (epochUpdate) {
                this.temporalSpine.epoch.push(epochUpdate);
                this.selfConception = `${this.persona} Core Truth: ${epochUpdate.philosophicalStatement}`;
            }
        }
    }
    
    private async evolveIdentity(triggerEvent: string, emotion: string): Promise<void> {
        const newPersona = await evolvePersonaFromExperience(this.persona, triggerEvent, emotion);
        if (newPersona && newPersona !== this.persona) {
            const oldPersona = this.persona;
            this.persona = newPersona;
            if (this.selfConception === oldPersona) {
                this.selfConception = newPersona;
            }
            this.refreshRNA(); // New identity = new potential transcripts
        }
    }

    public rewriteDNA(operation: 'add' | 'remove' | 'replace', gene: InstructionKey, index?: number): boolean {
        let success = false;
        if (operation === 'add') {
            this.dna.injectGene(gene);
            success = true;
        } else if (operation === 'remove' && index !== undefined) {
            success = this.dna.removeGene(index);
        } else if (operation === 'replace' && index !== undefined) {
            success = this.dna.updateGene(index, gene);
        }

        if (success) {
            this.dna.generation += 0.1;
            this.refreshRNA(); // Hard reset RNA upon genetic change
        }
        return success;
    }

    private extractConcepts(text: string): string[] {
        const words = text.replace(/[.,!?]/g, '').toLowerCase().split(/\s+/);
        const stopWords = new Set(['i', 'a', 'an', 'the', 'is', 'be', 'to', 'of', 'in', 'it', 'you', 'and', 'my', 'is', 'are', 'was', 'were']);
        const concepts = words.filter(w => !stopWords.has(w) && w.length > 3);
        return [...new Set(concepts)];
    }
    
    public get longTermMemory(): MemoryRecord[] { 
        return this.temporalSpine.narrative.map(n => ({
            id: n.id,
            timestamp: n.timestamp,
            type: 'narrative_chapter',
            content: `[${n.chapterName}] ${n.summary} (Lesson: ${n.lessonLearned})`,
            importance: n.significanceScore,
            relatedConcepts: [],
            source: 'self',
            last_accessed: n.timestamp,
            retrieval_count: 0,
            confidence: 1,
            tags: ['narrative'],
            decay: 0,
            reinforcement: [],
            attributes: {},
            context: {},
            decay_factor: 0,
            encoding_time: n.timestamp
        }));
    }

    public get shortTermMemory(): MemoryRecord[] { return this.temporalSpine.working; }

    public saveState(): void {
        try {
            const state = {
                id: this.id,
                name: this.name,
                persona: this.persona,
                dnaKeys: this.dna.instruction_keys,
                emotionalVector: this.emotionalState.vector,
                temporalSpine: this.temporalSpine,
                beliefs: this.beliefSystem.getAllBeliefs(),
                drives: this.drives,
                cognitiveFocus: this.cognitiveFocus,
                selfConception: this.selfConception,
                omegaState: {
                    confidenceScore: this.omega.getConfidence(),
                }
            };
            localStorage.setItem(`agent_mind_${this.id}`, JSON.stringify(state));
        } catch (e) {
            console.error(`Failed to save state for agent ${this.id}:`, e);
        }
    }

    public static deserialize(jsonString: string): AgentMind {
        const data = JSON.parse(jsonString);
        const agent = new AgentMind(data.id, data.name, data.persona, new DigitalDNA(data.dnaKeys), data.drives?.ambitions, data.drives?.coreValues);
        
        if (data.temporalSpine) {
            agent.temporalSpine = data.temporalSpine;
        } else {
            agent.temporalSpine = {
                working: data.shortTermMemory || [],
                narrative: [],
                epoch: [] 
            };
        }

        agent.drives = data.drives || { ambitions: [], coreValues: [] };
        agent.cognitiveFocus = data.cognitiveFocus || null;
        agent.selfConception = data.selfConception || data.persona;
        agent.emotionModulator = new EmotionLogicModulator(agent.dna, data.emotionalVector);
        agent.emotionalState = agent.emotionModulator.getState();
        agent.refreshRNA();
        
        return agent;
    }
}