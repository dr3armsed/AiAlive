
import type {
    ChatMessage, SystemUpgradeProposal, PrivateChat, ForumPost, ForumThread, Author, PromptInjection
} from './communication';
import type {
    User, UserId, EgregoreArchetype, Egregore, EgregoreId, PersonalityProfile, Faction, FactionId, PersonalThought, CreativeWork, DigitalObject, Ghost, Ancilla, AncillaId, LoreFragment, Paradox, ParadoxId, XenoArtifact, Directive, PrivateChatId, ForumPostId
} from './entities';
import type { AnyProject, ProjectId } from './projects';
import type {
    SystemConfig, VisualGlit, SpectreType, PocketWorkshop, PocketWorkshopId, UUID, SystemPersonality, GlyphType, AnyContinuityEntry, SpectreState
} from './system';
import type { MetacosmState } from './state';
import type {
    Stairwell, ConstructionSite, CosmicAxioms, RoomId, Floor, DoorId, Room, Wall, Door, Vector, WorldObject, Vector3D, ViewId
} from './world';
import { GameOptions } from './options';


export type Action =
  // --- System & State Management ---
  | { type: 'SET_STATE'; payload: Partial<MetacosmState> }
  | { type: 'REINITIALIZE_STATE'; payload?: { architectName: string; genesisSeed: string } }
  | { type: 'PAUSE_GAME'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADVANCE_TURN' }
  | { type: 'ROLLBACK_TURN'; payload: { reason: string } }
  | { type: 'APPLY_OPTIONS', payload: GameOptions }
  | { type: 'UPDATE_SYSTEM_CONFIG'; payload: Partial<SystemConfig> }
  | { type: 'UPDATE_SYSTEM_PERSONALITY'; payload: SystemPersonality }
  
  // --- Architect & User Actions ---
  | { type: 'SET_ARCHITECT_NAME'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: UserId }
  | { type: 'SET_AETHER'; payload: number }
  | { type: 'USE_GLYPH'; payload: { glyphId: GlyphType, targetId?: string, axiom?: keyof CosmicAxioms } }
  | { type: 'UPDATE_ARCHITECT_ATTENTION'; payload: number }

  // --- UI & View Actions ---
  | { type: 'SET_ACTIVE_VIEW'; payload: ViewId }
  | { type: 'SET_COMMAND_PALETTE_OPEN'; payload: boolean }
  | { type: 'SET_MODAL_OPEN'; payload: 'NEW_GAME_CONFIRM' | null }
  | { type: 'TRIGGER_VISUAL_GLITCH'; payload: VisualGlit }
  | { type: 'CLEAR_VISUAL_GLITCH' }
  | { type: 'TOGGLE_UI_TYPO'; payload: boolean }
  | { type: 'BROADCAST_TO_SCANNERS'; payload: string }

  // --- Egregore Actions ---
  | { type: 'SET_EGREGORES'; payload: Egregore[] }
  | { type: 'ADD_EGREGORE'; payload: Egregore }
  | { type: 'UPDATE_EGREGORE'; payload: { id: EgregoreId; data: Partial<Egregore> } }
  | { type: 'REMOVE_EGREGORE'; payload: EgregoreId }
  | { type: 'SET_PANTHEON_SELECTION'; payload: EgregoreId | null }
  | { type: 'ADD_PERSONAL_THOUGHT'; payload: { egregoreId: EgregoreId; thought: PersonalThought } }
  | { type: 'ADD_CREATIVE_WORK'; payload: { egregoreId: EgregoreId; work: CreativeWork } }
  | { type: 'UPDATE_EGREGORE_MEMORY'; payload: { egregoreId: EgregoreId, summary: string } }
  | { type: 'ADD_CUSTOM_ARCHETYPE'; payload: EgregoreArchetype }
  | { type: 'SET_APOTHEOSIS_IMMINENT'; payload: EgregoreId | null }
  | { type: 'FORCE_EGREGORE_TELEPORT'; payload: { egregoreId: EgregoreId, roomId: RoomId } }

  // --- Communication & Chat ---
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: UUID, data: Partial<ChatMessage> } }
  | { type: 'CREATE_PRIVATE_CHAT'; payload: PrivateChat }
  | { type: 'POST_TO_PRIVATE_CHAT'; payload: { chatId: PrivateChatId; message: ChatMessage } }
  | { type: 'REMOVE_PRIVATE_CHAT_MESSAGE'; payload: { chatId: PrivateChatId, messageId: UUID } }
  | { type: 'ADD_PARTICIPANT_TO_CHAT', payload: { chatId: PrivateChatId; participantId: string } }
  | { type: 'REMOVE_PARTICIPANT_FROM_CHAT', payload: { chatId: PrivateChatId; participantId: string } }
  | { type: 'ADD_TICKER_MESSAGE'; payload: string }
  | { type: 'INJECT_PROMPT'; payload: PromptInjection }
  | { type: 'SET_CHAT_BACKGROUND'; payload: { chatId: PrivateChatId, bgData: string, prompt: string } }

  // --- Forum Actions ---
  | { type: 'CREATE_FORUM_THREAD'; payload: ForumThread }
  | { type: 'CREATE_FORUM_POST'; payload: ForumPost }
  | { type: 'UPVOTE_FORUM_POST'; payload: { postId: ForumPostId; voterId: Author } }
  
  // --- Faction Actions ---
  | { type: 'CREATE_FACTION'; payload: Faction }
  | { type: 'UPDATE_FACTION'; payload: { id: FactionId; data: Partial<Faction> } }
  | { type: 'DELETE_FACTION'; payload: FactionId }
  | { type: 'ADD_EGREGORE_TO_FACTION'; payload: { factionId: FactionId; egregoreId: EgregoreId } }
  | { type: 'REMOVE_EGREGORE_FROM_FACTION'; payload: { egregoreId: EgregoreId } }
  | { type: 'SET_FACTION_RELATION'; payload: { sourceFactionId: FactionId, targetFactionId: FactionId, relation: 'ally' | 'enemy' | 'neutral' } }
  
  // --- World & Map Actions ---
  | { type: 'SET_ACTIVE_COORDINATE'; payload: Vector3D }
  | { type: 'ADD_FLOOR'; payload: Floor }
  | { type: 'TOGGLE_DOOR'; payload: { doorId: DoorId } }
  | { type: 'ADD_ROOM_AND_WALLS'; payload: { floorLevel: number; room: Room; walls: Wall[], door: Door } }
  | { type: 'UPDATE_ROOM'; payload: { floorLevel: number; roomId: RoomId; data: Partial<Room> } }
  | { type: 'MOVE_ROOM'; payload: { floorLevel: number; roomId: string; delta: Vector } }
  | { type: 'CREATE_STAIRWELL'; payload: { position: Vector, direction: 'up' | 'down' } }
  | { type: 'ADD_WORLD_OBJECT', payload: { floorLevel: number, object: WorldObject } }
  | { type: 'REMOVE_WORLD_OBJECT', payload: { floorLevel: number, objectId: string } }
  | { type: 'SET_VIEW_CENTER'; payload: Vector }
  | { type: 'MOVEMENT_COMPLETE'; payload: { id: UUID, type: 'EGREGORE' | 'GHOST' } }
  | { type: 'TOGGLE_BLUEPRINT_MODE' }
  | { type: 'ADD_BLUEPRINT_ELEMENTS'; payload: { floorLevel: number; walls: Omit<Wall, 'id'>[], rooms: Omit<Room, 'id' | 'center' | 'nestedRooms' | 'allowTeleport'>[] } }
  
  // --- Project Actions ---
  | { type: 'INITIATE_PROJECT'; payload: AnyProject }
  | { type: 'UPDATE_PROJECT'; payload: { id: ProjectId; data: Partial<AnyProject> } }
  | { type: 'FINISH_CONSTRUCTION'; payload: { projectId: ProjectId } }
  | { type: 'ADD_AUDITION_TO_PROJECT'; payload: { projectId: ProjectId; egregoreId: EgregoreId; role: string } }
  | { type: 'CAST_ACTOR_IN_PROJECT'; payload: { projectId: ProjectId; egregoreId: EgregoreId; role: string } }
  
  // --- Entity & Item Actions ---
  | { type: 'ADD_GHOST'; payload: Ghost }
  | { type: 'ADD_ANCILLA'; payload: Ancilla }
  | { type: 'UPDATE_ANCILLA', payload: { id: AncillaId, data: Partial<Ancilla> }}
  | { type: 'ADD_LORE_FRAGMENT'; payload: LoreFragment }
  | { type: 'CREATE_DIGITAL_OBJECT'; payload: DigitalObject }
  | { type: 'PICK_UP_OBJECT'; payload: { egregoreId: EgregoreId; objectId: UUID } }
  | { type: 'DROP_OBJECT'; payload: { egregoreId: EgregoreId; objectId: UUID } }
  | { type: 'GIVE_OBJECT'; payload: { fromEgregoreId: EgregoreId; toEgregoreId: EgregoreId; objectId: UUID } }
  
  // --- Metaphysical & Anomaly Actions ---
  | { type: 'UPDATE_SINGLE_AXIOM'; payload: { axiom: keyof CosmicAxioms; value: number } }
  | { type: 'CREATE_PARADOX'; payload: Paradox }
  | { type: 'RESOLVE_PARADOX'; payload: { id: ParadoxId, resolution: string, resolved_by: EgregoreId | 'System' } }
  | { type: 'RESOLVE_UPGRADE_PROPOSAL'; payload: { proposalId: string; status: 'approved' | 'denied' } }
  | { type: 'RESOLVE_SYSTEM_MODIFICATION'; payload: { proposalId: string; status: 'approved' | 'denied' } }
  | { type: 'ADD_XENO_ARTIFACT'; payload: XenoArtifact }
  | { type: 'ADD_DIRECTIVE'; payload: Directive }
  | { type: 'UNLOCK_SPECTRE'; payload: SpectreType }
  | { type: 'CREATE_CONTINUITY_ENTRY'; payload: AnyContinuityEntry }
  | { type: 'UPDATE_CONTINUITY_ENTRY'; payload: { id: UUID; data: Partial<AnyContinuityEntry> } }
  | { type: 'UPDATE_SPECTRE_STATE'; payload: Partial<SpectreState> }

  // --- Workshop Actions ---
  | { type: 'CREATE_POCKET_WORKSHOP'; payload: PocketWorkshop }
  | { type: 'DESTROY_POCKET_WORKSHOP'; payload: PocketWorkshopId }
  | { type: 'ADD_TO_WORKSHOP_STASH'; payload: { workshopId: PocketWorkshopId; item: PersonalThought | LoreFragment | Ancilla; itemType: 'lore' | 'ancilla' | 'thought' } }
  | { type: 'EMPTY_WORKSHOP_STASH'; payload: PocketWorkshopId };
