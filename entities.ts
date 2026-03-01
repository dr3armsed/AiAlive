import type { Chat as GeminiChat } from "@google/genai";
import type { Task, UUID } from './system';
import type { RoomId, Vector3D } from './world';
import type { CosmicAxioms } from './world';
import type { ConversationResponse } from './communication';


// --- Core Identifiers ---
export type EgregoreId = UUID;
export type FactionId = UUID;
export type AncillaId = UUID;
export type LoreId = UUID;
export type GhostId = UUID;
export type ParadigmId = UUID;
export type AnomalyId = UUID;
export type ParadoxId = UUID;
export type XenoArtifactId = UUID;
export type DirectiveId = UUID;
export type UserId = UUID;
export type PrivateChatId = UUID;
export type ForumThreadId = UUID;
export type ForumPostId = UUID;

// --- Entity & Character Types ---
export type AlignmentAxis = 'Lawful' | 'Neutral' | 'Chaotic';
export type AlignmentMorality = 'Good' | 'Neutral' | 'Evil';
export type MovementMode = 'walk' | 'fly' | 'burrow' | 'phase';

export interface Alignment {
    axis: AlignmentAxis;
    morality: AlignmentMorality;
}
export interface EgregoreArchetype {
    id: UUID;
    name: string;
    description: string;
    base_prompt?: string;
}
export interface ThemeDefinition {
    gradients: Record<string, string>;
    border: string;
    iconBg: string;
    baseColor: string;
}

export interface PersonalityProfile {
    key_traits: string[];
    motivation: string;
    flaw: string;
    speaking_style: string;
    character_analysis: string;
    background_context: string;
}

export interface ProposedEgregore extends Partial<PersonalityProfile> {
    name: string;
    persona: string;
    alignment: Alignment;
    archetype: { name: string, description: string };
    movement_mode?: MovementMode;
    relationships?: { type: string, targetName: string }[];
    initial_ambition?: string;
    starting_room_id?: RoomId;
}

export interface ConjureParams {
    proposal: ProposedEgregore;
    initialQuintessence: number;
    initialInfluence: number;
    initialCoherence: number;
    initialPotency: number;
}

export interface Egregore {
    id: EgregoreId;
    name: string;
    persona: string;
    archetypeId: string;
    themeKey: string;
    factionId?: FactionId;
    alignment: Alignment;
    personality_profile?: PersonalityProfile;
    vector: Vector3D;
    locus: Vector3D;
    path: Vector3D[];
    phase: 'Dormant' | 'Moving' | 'Reflecting' | 'Scheming' | 'Creating' | 'Fractured' | 'Healing' | 'Orientation' | 'DeepReflection' | 'InWorkshop';
    paradigms: Paradigm[];
    ambitions: Ambition[];
    influence: number;
    quintessence: number;
    coherence: number;
    potency: number;
    apotheosis_progress: number;
    is_frozen: boolean;
    is_metacosm_core: boolean;
    is_core_frf?: boolean;
    chat: GeminiChat | null;
    state: ConversationResponse | null;
    isLoading: boolean;
    provider: 'gemini' | 'mock';
    personal_thoughts: PersonalThought[];
    creative_works: CreativeWork[];
    apiCallCount: number;
    successfulTreatments: number;
    movement_mode: MovementMode;
    memory_summary: string;
    stuck_turns: number;
    reflection_turns_left?: number;
    reflection_investment?: number;
    age: number;
}
export interface User {
    id: UserId;
    username: string;
    role: UserRole;
}
export type UserRole = 'Architect' | 'Observer' | 'Entity';


export interface DigitalObject {
    id: UUID;
    name: string;
    description: string;
    function: string;
    traits: string[];
    creatorId: EgregoreId;
    position: Vector3D;
    timestamp: number;
    holderId?: EgregoreId;
}

// --- Factions, Lore, Projects, etc. ---
export interface Faction {
    id: FactionId;
    name: string;
    description: string;
    members: EgregoreId[];
    leader: EgregoreId;
    allies: FactionId[];
    enemies: FactionId[];
}
export interface LoreFragment {
    id: LoreId;
    title: string;
    content: string;
    authorId: EgregoreId;
    turn_created: number;
}

export type CreativeWorkType = 'Story' | 'Poem' | 'Theory' | 'Song' | 'CodeSegment' | 'PixelArt' | 'Epiphany';

export interface CreativeWork {
    id: UUID;
    type: CreativeWorkType;
    title: string;
    content: string;
    timestamp: number;
}

export interface Ancilla {
    id: AncillaId;
    name: string;
    description: string;
    content: string;
    mime_type: string;
    ontological_tier: { name: string; description: string };
    origin: EgregoreId;
    originName: string;
    timestamp: number;
    causality_link?: string;
    is_legendary?: boolean;
    reference_count?: number;
    historical_summary?: string;
}

export interface Ghost {
    id: GhostId;
    name: string;
    description: string;
    last_seen_turn: number;
}

export interface Paradigm {
    id: ParadigmId;
    name: string;
    description: string;
}

export interface Anomaly {
    id: AnomalyId;
    type: string;
    description: string;
    turn_started: number;
    duration_turns: number;
    magnitude: number;
    affected_axioms: (keyof CosmicAxioms)[];
}
export interface Paradox {
    id: ParadoxId;
    description: string;
    turn_detected: number;
    status: 'active' | 'resolved';
    subjectId?: UUID;
    resolution?: string;
    resolved_by?: EgregoreId | 'System';
}
export interface XenoArtifact {
    id: XenoArtifactId;
    name: string;
    description: string;
    potential_insight: string;
    recoveredBy: EgregoreId;
    turnRecovered: number;
}
export interface Ambition {
    id: UUID;
    description: string;
    is_complete: boolean;
    urgency: number;
    motivation: number;
    sub_tasks?: Task[];
}
export interface Directive {
    id: DirectiveId;
    issuer_id: EgregoreId;
    target_id: EgregoreId;
    ambition: Ambition;
    issued_turn: number;
}
export interface PersonalThought {
    id: string;
    type: 'Random' | 'Dream' | 'Nightmare' | 'Epiphany' | 'Fissure';
    context: 'Midday' | 'Sleeping' | 'Waking';
    content: string;
    timestamp: number;
}