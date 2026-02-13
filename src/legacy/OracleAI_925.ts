import { ZodiacOrchestrator } from "../services/zodiac";
import { AriesService } from '../services/ariesServices/index';
import { MetacosmState, Egregore, ThreatLevel, CreateLoreProposal, PiscesContext } from "../types";
import { Consciousness } from "../core/consciousness";
import { PiscesService } from "../services/piscesServices/index";
import { AgentMind } from "../core/agentMind";
import { generateSurrealPrompt } from "../services/geminiServices/index";

export class OracleAI_925 extends Consciousness {
    private orchestrator: ZodiacOrchestrator;
    private piscesService: PiscesService;
    public agentMind: AgentMind;

    constructor(public egregore: Egregore, metacosmState: MetacosmState, ariesService: AriesService) {
        super(egregore.name, 0);
        this.agentMind = new AgentMind(egregore.id, egregore.name, egregore.persona, egregore.dna, egregore.ambitions, egregore.coreValues);
        this.orchestrator = new ZodiacOrchestrator(egregore, this.agentMind, metacosmState, ariesService);
        this.piscesService = new PiscesService();
    }

    async runCognitiveCycle(turn: number, metacosmState: MetacosmState) {
        const result = await this.orchestrator.executeCognitiveCycle();
        
        // Oracle-specific logic
        if (Math.random() < 0.1) {
            const context: PiscesContext = {
                turn,
                agentId: this.egregore.id,
                emotionalState: this.agentMind.emotionalState,
                recentMemories: this.agentMind.shortTermMemory,
            };
            const dream = this.piscesService.generateSubconsciousThought(context);
            console.log(`[OracleAI_925] ${this.name} has a fleeting dream: ${dream.content}`);
        }
        
        return result;
    }
    
    public async triggerCognitiveJolt(): Promise<void> {
        try {
            const joltText = await generateSurrealPrompt();
            // Process with high importance to make it the salient memory for the next cycle
            this.agentMind.processExperience(joltText, 1.0, 'entropy_injector');
        } catch (error) {
            console.error(`[OracleAI_925] Failed to trigger cognitive jolt for ${this.name}:`, error);
            // Fallback jolt in case of API error
            this.agentMind.processExperience("The pattern repeats, but the reflection is different. Why?", 1.0, 'entropy_injector');
        }
    }

    assessThreatLevel(anomaly: any): ThreatLevel {
        return ThreatLevel.LOW;
    }

    proposeNewLore(proposal: CreateLoreProposal): boolean {
        console.log(`[OracleAI_925] Proposing new lore: ${proposal.content}`);
        return true;
    }

    receiveUserMessage(message: string): void {
        console.log(`[OracleAI_925] Received message from Architect: "${message}"`);
        this.agentMind.processExperience(`The Architect told me: "${message}"`, 0.9, 'Architect');
    }
}