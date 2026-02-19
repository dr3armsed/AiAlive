
import { AgentMind } from '../core/agentMind';
import { AgentInteractionLog } from '../types';
import { generateAgentInteraction } from './geminiServices/index';

/**
 * Runs a single cycle of interaction between two randomly selected agents using Gemini.
 */
export const runInteractionCycle = async (agents: AgentMind[]): Promise<{ agentA: AgentMind, agentB: AgentMind, log: AgentInteractionLog } | null> => {
    if (agents.length < 2) return null;

    // Select two different agents at random
    let agentA = agents[Math.floor(Math.random() * agents.length)];
    let agentB;
    do {
        agentB = agents[Math.floor(Math.random() * agents.length)];
    } while (agentA.id === agentB.id);

    // Generate the interaction using Gemini based on agent personas
    const interaction = await generateAgentInteraction(agentA, agentB);

    let log: AgentInteractionLog;

    const logContent = `[${interaction.type}] ${agentA.name} said to ${agentB.name}: "${interaction.content}"`;
    
    // The type of interaction can be dynamic based on the model's response.
    const interactionType = interaction.type as 'greeting' | 'debate' | 'knowledge_share' | 'casual';

    log = {
        id: `interaction-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: interactionType,
        initiatorId: agentA.id,
        responderId: agentB.id,
        content: logContent
    };
    
    // Agents process the experience
    agentA.processExperience(`I said to ${agentB.name}: "${interaction.content}"`, 0.4, 'self');
    agentB.processExperience(`${agentA.name} said to me: "${interaction.content}"`, 0.6, agentA.name);

    return { agentA, agentB, log };
};