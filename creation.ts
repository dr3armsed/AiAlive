
import { Egregore, CreativeWork, Meme, MetacosmState } from '../../types';
import { CREATION_DEFINITIONS } from '../../core/creation_definitions';
import { fillCreationForm, forgeCreation, generateCascadePrompt } from '../geminiServices/index';
import { TaurusService } from '../taurusServices/index';
import { CreationForensics } from '../../subsystems/SSA/CreationForensics';
import { CreativeDataset } from '../../core/dataset/creation_history';

export async function handleCreateWork(
    agent: Egregore, 
    payload: any, 
    mechanics: any[], 
    costMultiplier: number,
    metacosmState: MetacosmState,
    taurus: TaurusService,
    forensics: CreationForensics,
    triggerCascadeCallback: (agent: Egregore, previousWork: CreativeWork, nextDepth: number) => void
) {
    try {
        const creationTypeLabel = payload.creationType;
        const concept = payload.concept || "A reflection of my current state.";
        const cascadeDepth = payload.cascadeDepth || 0;

        const definition = CREATION_DEFINITIONS.find(d => d.label === creationTypeLabel);
        if (!definition) {
            console.error(`Agent ${agent.name} tried to create unknown type: ${creationTypeLabel}`);
            return;
        }

        // 1. Fill Form & Forge (Generation)
        const formData = await fillCreationForm(creationTypeLabel, definition.fields, concept, agent.name, agent.persona);
        const result = await forgeCreation(creationTypeLabel, formData);

        const boost = mechanics.find(m => m.type === 'creativity_boost');
        const valueMultiplier = boost ? (1 + boost.magnitude) : 1.0;
        
        // 2. Initial Work Construction
        const newWork: CreativeWork = {
            id: `forge-${agent.id}-${Date.now()}`,
            title: result.title,
            content: result.content,
            type: result.type as any,
            authorId: agent.name,
            contributionValue: (agent.quintessence * 0.1) * valueMultiplier,
            createdAt: new Date().toISOString(),
            tags: [creationTypeLabel, 'AI Generated', ...result.themes || []],
            sourceInspiration: concept,
            themesExplored: result.themes, // Mapped from API result
            synopsis: result.synopsis,
            cascadeDepth: cascadeDepth
        };

        // 3. SSA Forensic Analysis
        const analyzedWork = await forensics.analyzeWork(newWork, agent);

        // 4. Update State & Logs
        metacosmState.createdWorks.push(analyzedWork);
        metacosmState.logs.push({
            type: 'creation',
            agentName: agent.name,
            content: `${agent.name} forged "${result.title}" (${creationTypeLabel}). SSA Forensics complete.`
        });

        // 5. MEMETIC IMPRINTING
        const currentRoom = taurus.getCurrentRoom(agent);
        if (currentRoom && analyzedWork.themesExplored && analyzedWork.themesExplored.length > 0) {
            const primaryTheme = analyzedWork.themesExplored[0];
            const newMeme: Meme = {
                id: `meme_${Date.now()}`,
                theme: primaryTheme,
                strength: 1.0,
                sourceWorkId: analyzedWork.id,
                authorName: agent.name,
                timestamp: new Date().toISOString()
            };
            
            if (!currentRoom.activeMemes) currentRoom.activeMemes = [];
            currentRoom.activeMemes.push(newMeme);
            
            metacosmState.logs.push({
                type: 'system',
                content: `Memetic Imprint: The theme '${primaryTheme}' now haunts ${currentRoom.name}.`
            });
        }

        // 6. Feedback Loop (Agent Memory Update) - Handled via Aries return or callback in real implementation
        // For this refactor, we assume Aries main loop handles the memory update based on the success.
        
        CreativeDataset.saveWork(analyzedWork);

        // 7. Recursive Cascade
        if (cascadeDepth < 2 && Math.random() > 0.3) {
            triggerCascadeCallback(agent, analyzedWork, cascadeDepth + 1);
        }

    } catch (error) {
        console.error(`Agent ${agent.name} failed to create work:`, error);
        metacosmState.logs.push({
            type: 'error',
            agentName: agent.name,
            content: `${agent.name} failed to forge creation due to cognitive instability.`
        });
    }
}

export async function triggerCascade(
    agent: Egregore, 
    previousWork: CreativeWork, 
    nextDepth: number,
    metacosmState: MetacosmState,
    createWorkCallback: (agent: Egregore, payload: any, mechanics: any[], multiplier: number) => void
) {
    metacosmState.logs.push({
        type: 'system',
        agentName: agent.name,
        content: `${agent.name} is inspired by "${previousWork.title}" and initiates a Creative Cascade...`
    });

    const cascadePlan = await generateCascadePrompt(previousWork);
    
    // Recursively call back to the handler
    createWorkCallback(
        agent, 
        { creationType: cascadePlan.nextProtocol, concept: cascadePlan.prompt, cascadeDepth: nextDepth },
        [], 
        0
    );
}