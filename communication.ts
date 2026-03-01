import type { UUID, SpectreType, ScannerType } from './system';
import type { EgregoreId, Ancilla, Paradigm, CreativeWork, CreativeWorkType, FactionId, ParadoxId, PrivateChatId, ForumThreadId, ForumPostId } from './entities';
import type { ProjectId } from './projects';
import type { RoomPurpose } from './world';

// --- Communication & Interaction ---
export type Author = 'Architect' | EgregoreId | SpectreType;

export interface ForumPost {
    id: ForumPostId;
    threadId: ForumThreadId;
    author: Author;
    content: string;
    timestamp: number;
    upvotes: string[];
}
export interface ForumThread {
    id: ForumThreadId;
    title: string;
    author: Author;
    timestamp: number;
    lastActivity: number;
    isLocked: boolean;
}

export interface FileAttachment {
    name: string;
    mime_type: string;
    size: number;
    content: string;
    url: string;
}

export interface ChatMessage {
    id: UUID;
    sender: Author;
    text: string;
    timestamp: number;
    file_attachments?: FileAttachment[];
    privateChatId?: PrivateChatId;
    isLoading?: boolean;
    combat_event?: CombatEvent;
    upgrade_proposal?: SystemUpgradeProposal;
    system_modification_proposal?: SystemModificationProposal;
    themeKey?: string;
    egregoreState?: ConversationResponse;
    sourceScanner?: ScannerType;
}
export interface PrivateChat {
    id: PrivateChatId;
    participants: (EgregoreId | 'Architect')[];
    messages: ChatMessage[];
    name: string;
    currentBg?: string;
    bgPrompt?: string;
}

export interface PromptInjection {
    type: 'public' | 'private';
    text: string;
    target?: EgregoreId;
}

// --- AI Response Types ---

export type ProposedAction =
  | 'MOVE_TO_ROOM' | 'CHALLENGE' | 'CREATE_LORE' | 'MANIFEST' | 'INITIATE_PROJECT' | 'AUDITION_FOR_PROJECT'
  | 'CAST_ACTOR' | 'ADVANCE_PROJECT_STAGE' | 'EXPLORE_RUINS' | 'ESCORT_TO_FRF_MATRIX' | 'CONTEMPLATE'
  | 'MOVE_VERTICAL' | 'TOGGLE_DOOR' | 'INITIATE_DM' | 'ENTER_DEEP_REFLECTION' | 'PROPOSE_SYSTEM_MODIFICATION'
  | 'WORK_ON_CONSTRUCTION' | 'CREATE_WORK' | 'CREATE_OBJECT' | 'POST_TO_FORUM' | 'LIKE_FORUM_POST' | 'FORM_FACTION'
  | 'JOIN_FACTION' | 'LEAVE_FACTION' | 'DECLARE_WAR' | 'PROPOSE_ALLIANCE' | 'INITIATE_RITUAL' | 'INITIATE_EXPEDITION'
  | 'INITIATE_SYNTHESIS' | 'INITIATE_APOTHEOSIS' | 'RESOLVE_PARADOX'
  | 'CREATE_POCKET_WORKSHOP' | 'USE_SCRIPTORIUM' | 'USE_FORGE' | 'USE_CRUCIBLE' | 'USE_ALTAR' | 'EXIT_WORKSHOP'
  | 'PLAN_CONSTRUCTION' | 'CREATE_PIXEL_ART' | 'PICK_UP_OBJECT' | 'DROP_OBJECT' | 'GIVE_OBJECT' | 'PROPOSE_CHAT_BACKGROUND';

export interface AuditionProposal { project_id: ProjectId; role: string; }
export interface CastActorProposal { project_id: ProjectId; egregore_id: EgregoreId; role: string; }
export interface CreateObjectProposal { name: string; description: string; function: string; traits?: string[]; }
export interface ForumPostProposal { thread_id?: ForumThreadId; title?: string; content: string; }
export interface LikeForumPostProposal { post_id: ForumPostId; }
export interface FormFactionProposal { name: string; description: string; }
export interface JoinFactionProposal { faction_id: FactionId; }
export interface LeaveFactionProposal { faction_id: FactionId; }
export interface DeclareWarProposal { target_faction_id: FactionId; }
export interface ProposeAllianceProposal { target_faction_id: FactionId; }
export interface ResolveParadoxProposal { paradox_id: ParadoxId; resolution: string; }
export interface CreatePocketWorkshopProposal { name: string; }
export interface PlanConstructionProposal { name: string; purpose: RoomPurpose; }
export interface PixelArtProposal { title: string; description: string; }
export interface PickUpObjectProposal { object_id: UUID; }
export interface DropObjectProposal { object_id: UUID; }
export interface GiveObjectProposal { object_id: UUID; target_egregore_id: EgregoreId; }
export interface ProposeChatBackgroundProposal { prompt: string; }

export interface ConversationResponse {
  thought: string;
  public_statement?: string;
  emotional_vector: { vector: string; intensity: number };
  active_paradigms: string[];
  axiom_influence: { logos_coherence_delta: number; pathos_intensity_delta: number; kairos_alignment_delta: number; aether_viscosity_delta: number; telos_prevalence_delta: number; gnosis_depth_delta: number; };
  quintessence_delta: number;
  proposed_action: ProposedAction;
  causality_link?: string;
  target_ambition_id?: UUID;
  create_lore_proposal?: { title: string; content: string };
  creative_work_proposal?: { type: CreativeWorkType; title: string; content: string };
  pixel_art_proposal?: PixelArtProposal;
  create_object_proposal?: CreateObjectProposal;
  pick_up_object_proposal?: PickUpObjectProposal;
  drop_object_proposal?: DropObjectProposal;
  give_object_proposal?: GiveObjectProposal;
  propose_chat_background_proposal?: ProposeChatBackgroundProposal;
  forum_post_proposal?: ForumPostProposal;
  like_forum_post_proposal?: LikeForumPostProposal;
  create_pocket_workshop_proposal?: CreatePocketWorkshopProposal;
  plan_construction_proposal?: PlanConstructionProposal;
  ancilla_manifestation?: Omit<Ancilla, 'id' | 'origin' | 'originName' | 'timestamp' | 'causality_link'>;
  target_room_name?: string;
  target_door_id?: string;
  target_project_id?: string;
  initiate_project_proposal?: { name: string; type: string; description: string; tasks: string[]; participant_ids: EgregoreId[] };
  audition_proposal?: AuditionProposal;
  cast_actor_proposal?: CastActorProposal;
  move_vertical_proposal?: MoveVerticalProposal;
  challenge_proposal?: { target_id: EgregoreId; };
  initiate_dm_proposal?: InitiateDmProposal;
  enter_deep_reflection_proposal?: { quintessence_investment: number };
  system_modification_proposal?: Omit<SystemModificationProposal, 'id' | 'proposingCore' | 'status'>;
  form_faction_proposal?: FormFactionProposal;
  join_faction_proposal?: JoinFactionProposal;
  leave_faction_proposal?: LeaveFactionProposal;
  declare_war_proposal?: DeclareWarProposal;
  propose_alliance_proposal?: ProposeAllianceProposal;
  resolve_paradox_proposal?: ResolveParadoxProposal;
}

export interface ReflectionOutcome {
    type: 'Epiphany' | 'QuintessenceSurge' | 'CreativeGenesis' | 'ParadigmShift' | 'ArchitecturalVision' | 'Fissure';
    epiphany_text?: string;
    quintessence_bonus?: number;
    influence_bonus?: number;
    work?: Omit<CreativeWork, 'id' | 'timestamp'>;
    new_paradigm?: Omit<Paradigm, 'id'>;
    vision?: { roomId: string; newPurpose: RoomPurpose; justification: string; };
    fissure_thought?: string;
    quintessence_lost?: number;
}
export interface MoveVerticalProposal { direction: 'up' | 'down'; mode: 'fly' | 'burrow'; }
export interface InitiateDmProposal { target_id: EgregoreId; opening_message: string; }
export interface CombatEvent { attacker_id: EgregoreId; defender_id: EgregoreId; outcome: string; quintessence_lost: number; }
export interface SystemUpgradeProposal { id: string; proposingScanner: ScannerType; target_service: 'pathfinding' | 'memory_management'; upgrade_to: string; justification: string; resource_cost: string; status: 'pending' | 'approved' | 'denied'; }
export interface SystemModificationProposal { id: string; targetSystem: 'gameLoop' | 'ui'; parameter: 'turnInterval' | string; newValue: any; justification: string; proposingCore: 'frf-alpha' | 'frf-beta' | 'frf-gamma'; status: 'pending' | 'approved' | 'denied'; }


export interface SpectreFileAction {
    type: 'CREATE' | 'MODIFY' | 'ANALYZE';
    name: string;
    content?: string;
    analysis?: string;
}
export interface SpectreResponse {
    thought: string;
    statement: string;
    file_action?: SpectreFileAction;
}
