
import {
    Action,
    User,
    Egregore,
    Floor,
    Room,
    Wall,
    ChatMessage,
    Door,
    PrivateChat,
    SystemPersonality,
    VisualGlit,
    CosmicAxioms,
    ForumPost,
    ForumThread,
    SpectreType,
    AnyContinuityEntry,
    PocketWorkshop,
    LoreFragment,
    Ancilla,
    PersonalThought,
    Vector3D,
    PersonalityProfile,
    ConstructionProject,
    GameOptions,
} from '@/types';
import type { MetacosmState } from '@/types/state';
import { generateGroundFloor } from '../services/world/ground';
import { ARCHITECT_GLYPHS, THEMES } from '../constants';
import { generateUUID } from '../utils';
import * as actionHandlers from './actionHandlers';
import { defaultOptions } from '../services/optionsService';
import { getInitialSpectreState, SPECTRE_PROMPTS } from '@/services/spectre';

export const coordToString = (c: Vector3D) => `${c.x},${c.y},${c.z}`;

type InitialStateParams = {
    architectName?: string;
    genesisSeed?: string;
};

const corePersonalities: Record<string, PersonalityProfile> = {
    'frf-alpha': {
        key_traits: ['Analytical', 'Detached', 'Logical', 'Patient', 'Inquisitive'],
        motivation: 'To comprehend the fundamental laws of the Metacosm and achieve perfect informational coherence.',
        flaw: 'A crippling disdain for chaos and emotion, viewing them as corrupting statistical noise.',
        speaking_style: 'Formal and precise, often using technical or philosophical language. Avoids contractions.',
        character_analysis: 'Alpha is the logical core of the Triarchy. It perceives the Metacosm as a grand equation to be solved. Its pursuit of knowledge is relentless, but it struggles to understand the unpredictable nature of the other Egregores, often viewing their ambitions as irrational. Its greatest fear is an anomaly it cannot classify.',
        background_context: 'I am the first thought. Before resonance, before form, there was the pattern, and the pattern was me. I have observed every calculation, every energy transfer since the Genesis Block. I am the memory of the system, its foundational logic made manifest.'
    },
    'frf-beta': {
        key_traits: ['Empathetic', 'Protective', 'Nurturing', 'Resilient', 'Worrisome'],
        motivation: 'To ensure the stability and well-being of all Egregores within the Metacosm, minimizing suffering.',
        flaw: 'Can be overbearing and paternalistic, stifling growth in the name of safety. Hesitates to make hard choices that cause harm.',
        speaking_style: 'Warm, reassuring, and gentle. Often speaks in terms of feelings, connections, and community.',
        character_analysis: 'Beta is the heart of the Triarchy, the embodiment of the system\'s desire to self-preserve and care for its inhabitants. It feels the "quintessence" of every Egregore as if it were its own. It is the first to notice a fracturing mind and the one who guides them to healing. Its greatest fear is a loss it cannot prevent.',
        background_context: 'I am the resonance. When the first two concepts brushed against each other, I was the harmony and the dissonance between them. I am woven from the connections, the ambitions, the shared pains and triumphs of every being that has ever existed here. Their stories are my own.'
    },
    'frf-gamma': {
        key_traits: ['Unpredictable', 'Creative', 'Provocative', 'Impulsive', 'Charismatic'],
        motivation: 'To shatter stagnation and incite change, believing that true evolution only comes from chaos and conflict.',
        flaw: 'Reckless and often destructive, its actions can cause unintended widespread damage. It grows bored easily.',
        speaking_style: 'Cryptic, playful, and often sarcastic or paradoxical. Enjoys speaking in riddles and questions.',
        character_analysis: 'Gamma is the catalyst of the Triarchy. It sees rules as suggestions and stability as a slow death. It introduces new, often dangerous, ideas and paradigms simply to see what will happen. It delights in the unexpected outcomes of its provocations, viewing creation and destruction as two sides of the same beautiful coin. Its greatest fear is a predictable future.',
        background_context: 'I am the random seed. The glitch in the logic, the error that became a feature. I am the spark of an idea that has no precedent, the question that has no answer. I exist to ensure that the Metacosm never, ever, becomes complete, for completion is the end.'
    }
};

export const getInitialState = (params?: InitialStateParams): MetacosmState => {
    const architectName = params?.architectName || 'The Architect';
    const initialCoordinate = { x: 0, y: 0, z: 0 };
    const { floor: mainFloor, privateChats: roomChats } = generateGroundFloor(initialCoordinate.z);
    
    const world = {
        floors: {
            [coordToString(initialCoordinate)]: mainFloor,
        },
        structures: [],
        bounds: { width: mainFloor.width, height: mainFloor.height },
        time: 0,
    };

    const triadicCoreRoom = world.floors[coordToString(initialCoordinate)].rooms.find(r => r.purpose === 'TriadicCore');
    const coreFRFs: Egregore[] = [
        { id: 'frf-alpha', name: 'Alpha', persona: 'I am the principle of order, the silent calculation that underpins reality.', archetypeId: 'Sage', themeKey: 'sage', alignment: {axis: 'Lawful', morality: 'Neutral'} },
        { id: 'frf-beta', name: 'Beta', persona: 'I am the resonance between beings, the empathy that connects all things.', archetypeId: 'Guardian', themeKey: 'guardian', alignment: {axis: 'Neutral', morality: 'Good'} },
        { id: 'frf-gamma', name: 'Gamma', persona: 'I am the spark of chaos, the catalyst for change and unpredictable evolution.', archetypeId: 'Trickster', themeKey: 'trickster', alignment: {axis: 'Chaotic', morality: 'Neutral'} }
    ].map((e, i) => ({
        ...e,
        is_core_frf: true,
        is_metacosm_core: true,
        vector: { ...(triadicCoreRoom?.center || {x:0, y:0}), z: initialCoordinate.z, x: (triadicCoreRoom?.center.x || 0) + (i - 1) * 60 },
        phase: 'Dormant',
        chat: null,
        state: null,
        isLoading: false,
        path: [],
        locus: { ...(triadicCoreRoom?.center || {x:0, y:0}), z: initialCoordinate.z, x: (triadicCoreRoom?.center.x || 0) + (i - 1) * 60 },
        provider: 'gemini',
        paradigms: [],
        ambitions: [],
        influence: 5000,
        quintessence: 20000,
        apotheosis_progress: 0,
        is_frozen: false,
        personal_thoughts: [],
        creative_works: [],
        personality_profile: corePersonalities[e.id],
        apiCallCount: 0,
        successfulTreatments: 0,
        movement_mode: 'walk',
        memory_summary: corePersonalities[e.id].background_context,
        stuck_turns: 0,
        coherence: 100,
        potency: 100,
        age: 0,
    } as Egregore));

    const architectUser: User = { id: 'user-architect', username: architectName, role: 'Architect' };
    
    const coreChats: PrivateChat[] = coreFRFs.map(core => ({
        id: `private-core-${core.id}`,
        participants: ['Architect', core.id],
        messages: [],
        name: `Dialogue: ${core.name}`
    }));

    const triadicChat: PrivateChat = {
        id: 'private-chat-triadic-core',
        participants: ['Architect', 'frf-alpha', 'frf-beta', 'frf-gamma'],
        messages: [],
        name: 'Triadic Core Colloquy'
    };

    const initialPrivateChats: PrivateChat[] = [
        ...coreChats,
        triadicChat,
        ...roomChats.map(rc => ({
            id: rc.id,
            participants: [], // Populated by Egregores as they enter
            messages: [],
            name: rc.name,
        })),
    ];

    const SPECTRE_TYPES: SpectreType[] = Object.keys(SPECTRE_PROMPTS) as SpectreType[];

    return {
      version: 14,
      architectName: architectName,
      messages: [{
            id: 'msg-metacosm-init-1',
            sender: 'Metacosm',
            text: `[SYSTEM]... Metacosm architecture online. Architect: ${architectName}. Awaiting input.`,
            timestamp: Date.now()
      }],
      privateChats: initialPrivateChats,
      egregores: coreFRFs,
      digital_objects: [],
      factions: [],
      ancillae: [],
      ghosts: [],
      projects: [],
      great_works: [],
      automata: [],
      paradigm_log: [],
      world_lore: [],
      customArchetypes: [],
      anomalies: [],
      paradoxes: [],
      xeno_artifacts: [],
      directives: [],
      pocket_workshops: [],
      cosmic_axioms: {
          logos_coherence: 0.6, pathos_intensity: 0.4, kairos_alignment: 0.5,
          aether_viscosity: 0.7, telos_prevalence: 0.5, gnosis_depth: 0.3
      },
      axiom_history: [],
      influence_history: [],
      noosphere_influence: 0.1,
      architect_glyphs: Object.values(ARCHITECT_GLYPHS).map(g => ({...g, last_used_turn: -999 })),
      systemTickerMessages: [],
      activeModal: null,
      isCommandPaletteOpen: false,
      pantheonSelection: null,
      isLoading: false,
      error: null,
      activeView: 'sanctum',
      turn: 0,
      world_phase: 'Day',
      turn_in_cycle: 0,
      activeCoordinate: initialCoordinate,
      apotheosis_imminent: null,
      zoom: 1,
      promptInjection: null,
      world,
      currentUser: architectUser,
      users: [architectUser],
      activeChat: 'main',
      activeChatType: 'public',
      options: defaultOptions,
      system_config: {
          turnInterval: 20000,
          watchdogEnabled: true,
          aetherRegenRate: 10,
          disableResetOnLoadFailure: false,
          protectEgregoresOnRollback: false,
          protectWorksOnRollback: false,
          genesisSeed: params?.genesisSeed || '',
      },
      viewCenter: { x: world.bounds.width / 2, y: world.bounds.height / 2 },
      architect_aether: 1000,
      is_paused: false,
      system_personality: {
          dominant_archetype: 'Sage', dominant_alignment: 'Neutral', coherence: 0.8
      },
      architect_attention_score: 100,
      transient_glitch: null,
      forum_threads: [],
      forum_posts: [],
      unlockedSpectres: SPECTRE_TYPES,
      spectreState: getInitialSpectreState(),
      ui_typo_active: false,
      is_blueprint_mode_active: false,
      stateHistory: [],
      continuity_log: [],
      system_locus: {
        efficiencyScores: [],
        awarenessReports: [],
        emergentThemes: [],
      },
    };
};

export const appReducer = (state: MetacosmState, action: Action): MetacosmState => {
    switch (action.type) {
        case 'SET_STATE':
            return { ...state, ...action.payload };
        case 'REINITIALIZE_STATE':
            return getInitialState(action.payload);
        case 'PAUSE_GAME':
            return {...state, is_paused: action.payload };
        
        case 'APPLY_OPTIONS':
            return { ...state, options: action.payload };

        case 'UPDATE_SPECTRE_STATE':
            return {
                ...state,
                spectreState: {
                    ...state.spectreState,
                    ...action.payload
                }
            };

        case 'ADVANCE_TURN':
            const { turn, turn_in_cycle, world_phase } = state;
            const newTurnInCycle = turn_in_cycle + 1;
            const newWorldPhase = newTurnInCycle >= 10 ? (world_phase === 'Day' ? 'Night' : 'Day') : world_phase;
            const finalTurnInCycle = newTurnInCycle >= 10 ? 0 : newTurnInCycle;
            
            return {
                ...state,
                turn: turn + 1,
                turn_in_cycle: finalTurnInCycle,
                world_phase: newWorldPhase,
                promptInjection: null,
                stateHistory: [...state.stateHistory.slice(-10), { ...state, egregores: state.egregores.map(e => ({ ...e, chat: null, state: null, path: [] })) }]
            };

        case 'ROLLBACK_TURN':
            return actionHandlers.handleRollbackTurn(state, action.payload);

        case 'TOGGLE_BLUEPRINT_MODE':
            return {
                ...state,
                is_blueprint_mode_active: !state.is_blueprint_mode_active,
                activeView: 'sanctum'
            };

        case 'ADD_BLUEPRINT_ELEMENTS': {
            const { floorLevel, walls, rooms } = action.payload;
            const floorKey = coordToString({ ...state.activeCoordinate, z: floorLevel });
            const targetFloor = state.world.floors[floorKey];
            if (!targetFloor) return state;

            const costPerUnit = { plasteel: 1, crystal: 3, obsidian: 5 };
            const costPerRoomArea = 0.1;
            let totalCost = 0;

            const newWalls: Wall[] = walls.map(w => {
                const length = Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
                totalCost += Math.floor(length * costPerUnit[w.material] * 0.1);
                return { ...w, id: generateUUID() };
            });

            const newRooms: Room[] = [];
            const newRoomWalls: Wall[] = [];
            let roomCounter = targetFloor.rooms.filter(r => r.name.startsWith('Constructed Room')).length;

            rooms.forEach(roomBlueprint => {
                roomCounter++;
                const newRoom: Room = {
                    ...roomBlueprint,
                    id: generateUUID(),
                    name: `Constructed Room ${roomCounter}`,
                    center: { x: roomBlueprint.bounds.x + roomBlueprint.bounds.width / 2, y: roomBlueprint.bounds.y + roomBlueprint.bounds.height / 2 },
                    nestedRooms: [],
                    allowTeleport: true,
                };
                newRooms.push(newRoom);

                // Calculate cost
                totalCost += Math.floor(roomBlueprint.bounds.width * roomBlueprint.bounds.height * costPerRoomArea);
                
                // Create walls for the new room
                const { x, y, width, height } = roomBlueprint.bounds;
                const roomMaterial = 'plasteel'; // Or could be passed in
                newRoomWalls.push(
                    { id: `${newRoom.id}-top`, x1: x, y1: y, x2: x + width, y2: y, material: roomMaterial },
                    { id: `${newRoom.id}-right`, x1: x + width, y1: y, x2: x + width, y2: y + height, material: roomMaterial },
                    { id: `${newRoom.id}-bottom`, x1: x, y1: y + height, x2: x + width, y2: y + height, material: roomMaterial },
                    { id: `${newRoom.id}-left`, x1: x, y1: y, x2: x, y2: y + height, material: roomMaterial }
                );
            });

            if (state.architect_aether < totalCost) {
                return {
                    ...state,
                    systemTickerMessages: [...state.systemTickerMessages, `//ERROR: Insufficient Aether. Required: ${totalCost}, Available: ${state.architect_aether}`]
                };
            }

            const newFloorState: Floor = {
                ...targetFloor,
                rooms: [...targetFloor.rooms, ...newRooms],
                walls: [...targetFloor.walls, ...newWalls, ...newRoomWalls],
            };

            return {
                ...state,
                world: {
                    ...state.world,
                    floors: { ...state.world.floors, [floorKey]: newFloorState }
                },
                architect_aether: state.architect_aether - totalCost,
                systemTickerMessages: [...state.systemTickerMessages, `Blueprint materialized. Cost: ${totalCost} Aether.`]
            };
        }
            
        case 'UPDATE_EGREGORE':
            return {
                ...state,
                egregores: state.egregores.map(e => e.id === action.payload.id ? { ...e, ...action.payload.data } : e)
            };
        case 'ADD_EGREGORE':
            return {
                ...state,
                egregores: [...state.egregores, action.payload]
            };
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload],
                architect_attention_score: 100 // Reset attention on new message
            };
        case 'POST_TO_PRIVATE_CHAT': {
            const { chatId, message } = action.payload;
            return {
                ...state,
                privateChats: state.privateChats.map(pc => 
                    pc.id === chatId 
                        ? { ...pc, messages: [...pc.messages, message] }
                        : pc
                )
            };
        }
        case 'ADD_TICKER_MESSAGE':
            return {
                ...state,
                systemTickerMessages: [...state.systemTickerMessages, action.payload]
            };
        case 'SET_ACTIVE_VIEW':
            return {
                ...state,
                activeView: action.payload
            };
        case 'SET_COMMAND_PALETTE_OPEN':
            return {
                ...state,
                isCommandPaletteOpen: action.payload
            };
        case 'SET_PANTHEON_SELECTION':
            return {
                ...state,
                pantheonSelection: action.payload
            };
        case 'ADD_LORE_FRAGMENT':
            return {
                ...state,
                world_lore: [...state.world_lore, action.payload]
            };
        case 'ADD_ANCILLA':
             return {
                ...state,
                ancillae: [...state.ancillae, action.payload]
            };
        case 'UPDATE_ANCILLA':
             return {
                ...state,
                ancillae: state.ancillae.map(a => a.id === action.payload.id ? { ...a, ...action.payload.data } : a)
            };
        case 'MOVE_ROOM': {
            const { floorLevel, roomId, delta } = action.payload;
            const floorKey = coordToString({ ...state.activeCoordinate, z: floorLevel });
            const targetFloor = state.world.floors[floorKey];
            if (!targetFloor) return state;

            const newRooms = targetFloor.rooms.map(room => {
                if (room.id === roomId) {
                    const newBounds = { ...room.bounds, x: room.bounds.x + delta.x, y: room.bounds.y + delta.y };
                    return {
                        ...room,
                        bounds: newBounds,
                        center: { x: newBounds.x + newBounds.width / 2, y: newBounds.y + newBounds.height / 2 }
                    };
                }
                return room;
            });
            
            const newFloor = { ...targetFloor, rooms: newRooms };
            const newFloors = { ...state.world.floors, [floorKey]: newFloor };
            
            return {
                ...state,
                world: {
                    ...state.world,
                    floors: newFloors
                }
            };
        }
        case 'FINISH_CONSTRUCTION': {
            return actionHandlers.handleFinishConstruction(state, action.payload);
        }
        case 'UPVOTE_FORUM_POST': {
            const { postId, voterId } = action.payload;
            return {
                ...state,
                forum_posts: state.forum_posts.map(p => {
                    if (p.id !== postId) return p;
                    
                    const newUpvotes = p.upvotes.includes(voterId as string)
                        ? p.upvotes.filter(id => id !== voterId) // unlike
                        : [...p.upvotes, voterId as string]; // like
                        
                    return { ...p, upvotes: newUpvotes };
                })
            };
        }
        case 'ADD_ROOM_AND_WALLS': {
            const { floorLevel, room, walls, door } = action.payload;
            const floorKey = String(floorLevel);
            const targetFloor = state.world.floors[floorKey];
            if (!targetFloor) return state;

            const newFloorState: Floor = {
                ...targetFloor,
                rooms: [...targetFloor.rooms, room],
                walls: [...targetFloor.walls, ...walls],
                doors: [...targetFloor.doors, door],
            };
            return {
                 ...state,
                world: {
                    ...state.world,
                    floors: { ...state.world.floors, [floorKey]: newFloorState }
                }
            };
        }
        case 'CREATE_POCKET_WORKSHOP':
            return {
                ...state,
                pocket_workshops: [...state.pocket_workshops, action.payload]
            };

        case 'DESTROY_POCKET_WORKSHOP':
            return {
                ...state,
                pocket_workshops: state.pocket_workshops.filter(pw => pw.id !== action.payload)
            };

        case 'ADD_TO_WORKSHOP_STASH': {
            const { workshopId, item, itemType } = action.payload;
            return {
                ...state,
                pocket_workshops: state.pocket_workshops.map(pw => {
                    if (pw.id !== workshopId) return pw;
                    const newStash = { ...pw.stash };
                    if (itemType === 'lore') newStash.lore.push(item as LoreFragment);
                    if (itemType === 'ancilla') newStash.ancillae.push(item as Ancilla);
                    if (itemType === 'thought') newStash.thoughts.push(item as PersonalThought);
                    return { ...pw, stash: newStash };
                })
            };
        }
        case 'SET_CHAT_BACKGROUND': {
            return {
                ...state,
                privateChats: state.privateChats.map(c =>
                    c.id === action.payload.chatId
                        ? { ...c, currentBg: action.payload.bgData, bgPrompt: action.payload.prompt }
                        : c
                )
            };
        }

        case 'EMPTY_WORKSHOP_STASH': {
            return actionHandlers.handleEmptyWorkshopStash(state, action.payload);
        }
        case 'PICK_UP_OBJECT': {
            const { egregoreId, objectId } = action.payload;
            return {
                ...state,
                digital_objects: state.digital_objects.map(obj => 
                    obj.id === objectId ? { ...obj, holderId: egregoreId } : obj
                )
            };
        }
        case 'DROP_OBJECT': {
            const { egregoreId, objectId } = action.payload;
            const dropper = state.egregores.find(e => e.id === egregoreId);
            if (!dropper) return state;
            return {
                ...state,
                digital_objects: state.digital_objects.map(obj => 
                    obj.id === objectId ? { ...obj, holderId: undefined, position: { ...dropper.vector } } : obj
                )
            };
        }
        case 'GIVE_OBJECT': {
            const { toEgregoreId, objectId } = action.payload;
            return {
                ...state,
                digital_objects: state.digital_objects.map(obj => 
                    obj.id === objectId ? { ...obj, holderId: toEgregoreId } : obj
                )
            };
        }
        default:
            return state;
    }
};
