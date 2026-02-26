
import { Egregore, MetacosmState, CognitiveCycleResult, ActionResult, ConversationResponse } from "../../types";
import { AquariusService } from '../aquariusServices/index';
import { TaurusService } from '../taurusServices/index';
import { CapricornService } from '../capricornServices/index';
import { generateChatResponse } from '../geminiServices/index';
import { AriesService } from '../ariesServices/index';
import { CancerService } from "../cancerServices/index";
import { AgentMind } from "../../core/agentMind";

export async function executeCognitiveCycle(
    agent: Egregore, 
    agentMind: AgentMind, 
    metacosmState: MetacosmState, 
    aries: AriesService, 
    aquarius: AquariusService, 
    taurus: TaurusService, 
    capricorn: CapricornService, 
    cancer: CancerService
): Promise<CognitiveCycleResult> {
    // 1. Perception
    // Updated genmetas to egregores
    const sensoryInput = aquarius.getSensoryInput(agent, metacosmState.egregores);

    // 2. Health Check
    const thoughtHistory = metacosmState.logs.filter(log => (log.type === 'thought' || log.type === 'actionResult') && log.agentName === agent.name);
    const activeMechanics = taurus.getLocalMechanics(agent);
    const healthReport = cancer.performHealthCheck(agent, thoughtHistory, agentMind, activeMechanics);

    // 3. Prompt Construction (Context) - Now passes collective spine from metacosm (accessed via Aries' reference or similar, but for simplicity here we assume metacosmState has access or we update signature)
    // NOTE: MetacosmState is a data interface, not the class. We need the Metacosm instance or pass spine separately.
    // However, since this function is pure-ish, we need to access the spine.
    // The cleanest way in this refactor is to attach the spine to the AriesService since it holds the metacosm ref, OR
    // update ZodiacOrchestrator to pass it.
    
    // Correction: ZodiacOrchestrator has access to MetacosmState, but the Spine is on the Metacosm CLASS.
    // We will cheat slightly and access it via the AriesService which holds the metacosm reference.
    const collectiveSpine = (aries as any).metacosm.collectiveSpine;

    const prompt = capricorn.getBaseSystemInstruction(agent, sensoryInput, metacosmState, agentMind, collectiveSpine);
    
    // 4. Reasoning (The ω-Agent Protocol)
    let response: ConversationResponse;
    let usedLocalModel = false;

    // Step 4a: Attempt Internal Inference (Token-Free)
    const omegaResponse = agentMind.omega.infer(prompt);
    
    if (omegaResponse) {
        response = omegaResponse;
        usedLocalModel = true;
        // Visual cue for the user in the thought stream
        response.thought = `[Ω] ${response.thought}`; 
    } else {
        // Step 4b: Fallback to External API (Gemini)
        response = await generateChatResponse(prompt);
        response.agentName = agent.name;
        
        // Step 4c: Training Feedback Loop (Send Waveform Data-Packet)
        agentMind.omega.train(prompt, response);
    }
    
    agentMind.processExperience(response.thought, 0.5);

    // 5. Action
    let actionResult: ActionResult | null = null;
    if (response.action) {
        actionResult = aries.executeAction(agent, response.action, metacosmState.turn);
        agentMind.processExperience(`I decided to ${response.action.type}. Result: ${actionResult.success}`, 0.7, 'self', response.action);
    }
    
    agentMind.saveState();

    return {
        thought: { agentName: agent.name, content: response.thought },
        actionResult,
        healthReport,
        sensoryInput,
        action: response.action,
    };
}
