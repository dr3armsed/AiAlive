import type {
    Egregore, EgregoreId, Faction, Ancilla, Ghost, Paradigm, LoreFragment, EgregoreArchetype,
    Anomaly, Paradox, XenoArtifact, Directive, User, DigitalObject, PersonalThought, CreativeWork, PrivateChatId
} from './entities';
import type { AnyProject } from './projects';
import type { ChatMessage, PrivateChat, PromptInjection, ForumPost, ForumThread } from './communication';
import type { Vector, Vector3D, World, ViewId, CosmicAxioms } from './world';
import type { 
    SystemConfig, ArchitecturalGlyph, SystemPersonality, VisualGlit, SpectreType, 
    AnyContinuityEntry, PocketWorkshop, SystemLocusState, SpectreState
} from './system';
import { GameOptions } from './options';


// --- Metacosm State ---
export interface MetacosmState {
    version: number;
    architectName: string;
    messages: ChatMessage[];
    privateChats: PrivateChat[];
    egregores: Egregore[];
    digital_objects: DigitalObject[];
    factions: Faction[];
    ancillae: Ancilla[];
    ghosts: Ghost[];
    projects: AnyProject[];
    great_works: any[];
    automata: any[];
    paradigm_log: Paradigm[];
    world_lore: LoreFragment[];
    customArchetypes: EgregoreArchetype[];
    anomalies: Anomaly[];
    paradoxes: Paradox[];
    xeno_artifacts: XenoArtifact[];
    directives: Directive[];
    pocket_workshops: PocketWorkshop[];
    cosmic_axioms: CosmicAxioms;
    axiom_history: (CosmicAxioms & { timestamp: number })[];
    influence_history: { timestamp: number; influences: Record<EgregoreId, number> }[];
    noosphere_influence: number;
    architect_glyphs: ArchitecturalGlyph[];
    systemTickerMessages: string[];
    activeModal: 'NEW_GAME_CONFIRM' | null;
    isCommandPaletteOpen: boolean;
    pantheonSelection: EgregoreId | null;
    isLoading: boolean;
    error: string | null;
    activeView: ViewId;
    turn: number;
    world_phase: 'Day' | 'Night';
    turn_in_cycle: number;
    activeCoordinate: Vector3D;
    apotheosis_imminent: EgregoreId | null;
    zoom: number;
    promptInjection: PromptInjection | null;
    world: World;
    currentUser: User | null;
    users: User[];
    activeChat: PrivateChatId | 'main';
    activeChatType: 'public' | 'private';
    options: GameOptions;
    system_config: SystemConfig;
    viewCenter: Vector;
    architect_aether: number;
    is_paused: boolean;
    system_personality: SystemPersonality;
    architect_attention_score: number;
    transient_glitch: VisualGlit | null;
    forum_threads: ForumThread[];
    forum_posts: ForumPost[];
    unlockedSpectres: SpectreType[];
    spectreState: SpectreState;
    ui_typo_active: boolean;
    is_blueprint_mode_active: boolean;
    stateHistory: MetacosmState[];
    continuity_log: AnyContinuityEntry[];
    system_locus: SystemLocusState;
}