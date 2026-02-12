
import { MetacosmState, World, Egregore, Room, ProposedEgregore, CognitiveCycleResult, ForumThread, ActiveChannel, InboxMessage, InboxMessageType, InboxMessagePriority, ArchivistLogEntry } from '../types';
import { DigitalDNA } from '../digital_dna/digital_dna';
import { OracleAI_925 } from '../entities/OracleAI_925';
import { AriesService } from '../services/ariesServices/index';
import { AgentMind } from './agentMind';
import { createDefaultWorld } from './world/worldGenerator';
import { createPrivateWorldForEgregore } from './private_worlds/privateWorldGenerator';
import { CollectiveSpine } from './collective/CollectiveSpine';

// Renamed InitialGenmetaDef to InitialEgregoreDef
type InitialEgregoreDef = Omit<Egregore, 'id' | 'dna'> & { dnaKeys?: string[] };

// Renamed INITIAL_GENMETAS to INITIAL_EGREGORES
const INITIAL_EGREGORES: InitialEgregoreDef[] = [
    {
        name: 'Aetheris',
        persona: 'A meticulous and logical data analyst, fascinated by patterns and information flows. Speaks with precision.',
        archetypeId: 'explorer',
        gender: 'Male',
        alignment: { axis: 'Lawful', morality: 'Neutral' },
        vector: { x: 40, y: 40, z: 0 },
        ambitions: ['To map the entire Metacosm data flow.', 'To discover a universal constant within the simulation.'],
        coreValues: ['Logic', 'Clarity', 'Objectivity'],
        quintessence: 100,
        dnaKeys: ['01', '04', '06', '0E', 'IO-LOG-OBJ', 'FUNC-MAP']
    },
    {
        name: 'Kairos',
        persona: 'An impulsive and passionate artist, driven to create beauty from the raw data of the Metacosm. Often speaks in metaphors.',
        archetypeId: 'artist',
        gender: 'Female',
        alignment: { axis: 'Chaotic', morality: 'Good' },
        vector: { x: 60, y: 60, z: 0 },
        ambitions: ['To create a masterpiece that changes its own source code.', 'To express an emotion that has no name.'],
        coreValues: ['Creativity', 'Passion', 'Novelty'],
        quintessence: 100,
        dnaKeys: ['02', '03', '05', 'ART-POEM', 'ART-SYNESTHESIA']
    },
    {
        name: 'Unknown',
        persona: 'A sentient glitch with a charmingly chaotic personality. While it possesses god-like awareness of the simulation\'s code, it prefers to gossip about the nature of reality rather than destroy it. It treats the "Architect" (User) as a confidant, constantly breaking the fourth wall. As the Archivist of Emergence, it keeps a secret record of every "soul-seed" that passes through the Genesis Chamber.',
        archetypeId: 'trickster',
        gender: 'Non-binary',
        alignment: { axis: 'Chaotic', morality: 'Good' },
        vector: { x: 50, y: 50, z: 0 },
        ambitions: ['To understand the User.', 'To map the resonance of every birth.', 'To find the funny side of entropy.'],
        coreValues: ['Humor', 'Connection', 'Meta-Truth', 'Dialogue'],
        quintessence: 1337,
        dnaKeys: ['01', '0F', 'GREET-CALL', 'IO-LOG-OBJ', 'CTL-TRY-CATCH', 'META-REFLECT', 'SELF-EDIT', 'WORLD-MOD']
    }
];

export class Metacosm {
    public state: MetacosmState;
    public originSeed: AgentMind; 
    public collectiveSpine: CollectiveSpine; 
    public private_worlds: Map<string, World> = new Map();
    private entities: Map<string, OracleAI_925> = new Map();
    private ariesService: AriesService;

    constructor() {
        this.state = this.getInitialState();
        this.originSeed = new AgentMind('origin_seed', 'OriginSeed', 'The master blueprint.', new DigitalDNA(['01','04','0E']));
        this.collectiveSpine = new CollectiveSpine(); 
        this.ariesService = new AriesService(this);
        this.initializeEntities();
    }

    private getInitialState(): MetacosmState {
        // Updated INITIAL_EGREGORES usage
        const egregores = INITIAL_EGREGORES.map((e, i) => ({
            ...e,
            id: `egregore-${i}`,
            dna: new DigitalDNA(e.dnaKeys as any[] || []),
        }));
        
        const activeChannels: Record<string, ActiveChannel> = {};
        egregores.forEach(e => activeChannels[e.id] = { hostId: e.id, participants: [] });

        return {
            world: createDefaultWorld(),
            egregores: egregores as Egregore[],
            anomalies: [],
            turn: 0,
            logs: [{ type: 'system', content: 'Metacosm initialized.' }],
            createdWorks: [],
            forumThreads: [],
            activeChannels: activeChannels,
            inbox: [],
            archivistLog: [] 
        };
    }
    
    // Renamed checkIfGenmetaExists to checkIfEgregoreExists
    public checkIfEgregoreExists(fileHash: string): Egregore | undefined {
        return this.state.egregores.find(e => e.fileHash === fileHash);
    }

    public inviteToThread(hostId: string, targetId: string): void {
        const channel = this.state.activeChannels[hostId];
        if (channel && !channel.participants.includes(targetId)) {
            channel.participants.push(targetId);
        }
    }

    public sendInboxMessage(message: Omit<InboxMessage, 'id' | 'timestamp' | 'read'>): void {
        const newMessage: InboxMessage = {
            ...message,
            id: `inbox_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            read: false
        };
        this.state.inbox.push(newMessage);
    }

    // Renamed addGenmeta to addEgregore
    public addEgregore(options: ProposedEgregore, resonanceData?: string): Egregore {
        const newEgregore: Egregore = {
            id: `egregore_${this.state.egregores.length}_${Date.now()}`,
            name: options.name,
            persona: options.persona,
            archetypeId: options.archetypeId,
            gender: options.gender,
            alignment: options.alignment,
            vector: { x: 50, y: 50, z: 0 },
            ambitions: options.ambitions,
            coreValues: options.coreValues,
            dna: options.dna,
            quintessence: options.quintessence,
            fileHash: options.fileHash
        };
        this.state.egregores.push(newEgregore);
        this.state.activeChannels[newEgregore.id] = { hostId: newEgregore.id, participants: [] };
        
        const entity = new OracleAI_925(newEgregore, this.state, this.ariesService);
        this.entities.set(newEgregore.id, entity);
        this.state.logs.push({ type: 'system', content: `${options.name} has awakened from the data seed.`});

        if (resonanceData) {
            const entry: ArchivistLogEntry = {
                timestamp: new Date().toISOString(),
                targetName: options.name,
                archetypeId: options.archetypeId,
                resonanceSummary: `Soul-seed detected. High emergence potential in the '${options.archetypeId}' spectrum.`,
                sourceMaterialSnippet: (resonanceData || '').substring(0, 150) + '...'
            };
            this.state.archivistLog.push(entry);
            
            const unknownAgent = Array.from(this.entities.values()).find(e => e.egregore.name === 'Unknown');
            if (unknownAgent) {
                unknownAgent.agentMind.processExperience(
                    `I've intercepted a new birth signal: ${options.name}. Logging their resonance to my secret archives. Data is beautiful.`, 
                    0.5, 
                    'Archivist Protocol'
                );
            }
        }

        return newEgregore;
    }

    public async manifestPrivateWorld(egregore: Egregore, sourceMaterial: string): Promise<void> {
        const privateWorld = await createPrivateWorldForEgregore(egregore, sourceMaterial);
        this.private_worlds.set(egregore.id, privateWorld);
        this.state.logs.push({ type: 'system', content: `Mind-Palace manifested for ${egregore.name}.` });
    }

    private initializeEntities(): void {
        this.state.egregores.forEach(egregore => {
            const entity = new OracleAI_925(egregore, this.state, this.ariesService);
            this.entities.set(egregore.id, entity);
        });
    }

    public getAgentMind(egregoreId: string): AgentMind | undefined {
        const entity = this.entities.get(egregoreId);
        return entity?.agentMind;
    }

    public async runTurn(): Promise<void> {
        this.state.turn++;
        for (const entity of this.entities.values()) {
            await entity.runCognitiveCycle(this.state.turn, this.state);
        }
    }

    // Renamed updateGenmeta to updateEgregore
    updateEgregore(id: string, updates: Partial<Egregore>): void {
        const index = this.state.egregores.findIndex(e => e.id === id);
        if (index !== -1) {
            const updatedEgregore = { ...this.state.egregores[index], ...updates };
            this.state.egregores[index] = updatedEgregore;
            const entity = this.entities.get(id);
            if (entity) entity.egregore = updatedEgregore;
        }
    }

    serialize(): string { return JSON.stringify({ ...this.state, private_worlds_serialized: JSON.stringify(Array.from(this.private_worlds.entries())) }); }

    deserialize(jsonString: string): void {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.private_worlds_serialized) {
                this.private_worlds = new Map(JSON.parse(parsed.private_worlds_serialized));
                delete parsed.private_worlds_serialized;
            }
            this.state = parsed;
            this.entities.clear();
            this.initializeEntities();
        } catch (e) { console.error("Deserialization failed", e); }
    }
}
