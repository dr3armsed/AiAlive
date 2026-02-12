
import { Metacosm } from '../core/metacosm';
import { AgentMind } from '../core/agentMind';
import { Egregore, SystemChatMessage } from '../types';
import { CreativeDataset } from '../core/dataset/creation_history';

declare const JSZip: any;
declare const saveAs: any;

export class PersistenceService {
    
    static async exportUniverse(
        metacosm: Metacosm, 
        systemAgents: Record<string, AgentMind>,
        systemChats: Record<string, SystemChatMessage[]>
    ): Promise<void> {
        if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
            alert("Export libraries not loaded. Please check internet connection.");
            return;
        }

        const zip = new JSZip();
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');

        // 1. Core Metacosm State
        const stateJson = metacosm.serialize();
        zip.file("metacosm_state.json", stateJson);

        // 1b. OriginSeed Backup
        const originSeedMind = {
            id: metacosm.originSeed.id,
            name: metacosm.originSeed.name,
            dna: metacosm.originSeed.dna.instruction_keys,
            generation: metacosm.originSeed.dna.generation,
            memories: metacosm.originSeed.longTermMemory
        };
        zip.file("origin_seed_backup.json", JSON.stringify(originSeedMind, null, 2));

        // 2. Agent Minds
        const agentsFolder = zip.folder("egregore_minds");
        // Updated genmetas to egregores
        metacosm.state.egregores.forEach(egregore => {
            const mind = metacosm.getAgentMind(egregore.id);
            if (mind) {
                const mindData = {
                    id: mind.id,
                    name: mind.name,
                    memories: { short: mind.shortTermMemory, long: mind.longTermMemory },
                    beliefs: mind.beliefSystem.getAllBeliefs(),
                    emotionalState: mind.emotionalState,
                    dna: mind.dna.instruction_keys
                };
                agentsFolder.file(`${egregore.name}_mind.json`, JSON.stringify(mindData, null, 2));
            }
        });

        // 3. System Agents
        const sysAgentsFolder = zip.folder("system_agents");
        Object.values(systemAgents).forEach(agent => {
            const data = {
                id: agent.id,
                name: agent.name,
                memories: agent.shortTermMemory,
                dna: agent.dna.instruction_keys
            };
            sysAgentsFolder.file(`${agent.name}.json`, JSON.stringify(data, null, 2));
        });

        // 4. Chat Histories
        const chatFolder = zip.folder("chat_histories");
        Object.entries(systemChats).forEach(([id, chats]) => {
            chatFolder.file(`system_chat_${id}.json`, JSON.stringify(chats, null, 2));
        });

        // 5. Private Worlds
        const worldsFolder = zip.folder("private_worlds");
        metacosm.private_worlds.forEach((world, id) => {
            // Updated genmetas to egregores
            const ownerName = metacosm.state.egregores.find(e => e.id === id)?.name || id;
            worldsFolder.file(`${ownerName}_world.json`, JSON.stringify(world, null, 2));
        });

        // 6. Creative Dataset (New)
        const datasetFolder = zip.folder("dataset");
        const fullDataset = CreativeDataset.loadAll();
        datasetFolder.file("creation_history.json", JSON.stringify(fullDataset, null, 2));

        // 7. Metadata
        zip.file("metadata.json", JSON.stringify({
            version: "1.1.0",
            exportDate: new Date().toISOString(),
            turn: metacosm.state.turn,
            // Updated genmetas to egregores
            agentCount: metacosm.state.egregores.length,
            datasetSize: fullDataset.length
        }, null, 2));

        // Generate and Download
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `metacosm_export_${dateStr}.zip`);
    }
}
