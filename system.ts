import type { ChatMessage, PrivateChat, FileAttachment, PromptInjection, ForumPost, ForumThread } from './communication';
import type { Vector, Vector3D, World, ViewId, CosmicAxioms } from './world';

export type UUID = string;

// --- Task System (moved from projects.ts to break circular dependency) ---
export type TaskId = UUID;

export interface Task {
    id: TaskId;
    description: string;
    isComplete: boolean;
    subTasks?: Task[];
}

// --- Universal Types ---
export type ReportSeverity = 'nominal' | 'warning' | 'critical';
export type SpectreType = 'File' | 'Operation' | 'Function' | 'Animation' | 'System' | 'Core' | 'Entity' | 'Data Spectre' | 'Metacosm';
export type ScannerType = 'Stability' | 'Performance' | 'Upgrade' | 'Modularization';

export interface SaveSlot {
    id: UUID;
    name: string;
    timestamp: number;
    turn: number;
    egregoreCount: number;
    factionCount: number;
}

// --- AI & System Types ---
export interface SystemEntityMemory {
    short_term_log: ChatMessage[];
    medium_term_summary: string;
    long_term_narrative: string;
}

export interface SystemConfig {
    turnInterval: number;
    watchdogEnabled: boolean;
    aetherRegenRate: number;
    disableResetOnLoadFailure: boolean;
    protectEgregoresOnRollback: boolean;
    protectWorksOnRollback: boolean;
    genesisSeed?: string;
}
export interface SystemReportItem { id: string; title: string; details: string; suggestion: string; severity: ReportSeverity; }

export type GlyphType = 'stasis' | 'unraveling' | 'catalysis' | 'genesis' | 'reconstruction';
export interface ArchitecturalGlyph { id: GlyphType; name: string; description: string; long_description: string; cooldown: number; aether_cost: number; type: 'TargetedEgregore' | 'TargetedAxiom' | 'Global'; last_used_turn: number; }

// --- Pocket Workshop Types ---
export type PocketWorkshopId = UUID;
export interface PocketWorkshop {
    id: PocketWorkshopId;
    ownerId: string; // EgregoreId
    name: string;
    expirationTurn: number;
    stash: {
        lore: any[]; // LoreFragment[]
        ancillae: any[]; // Ancilla[]
        thoughts: any[]; // PersonalThought[]
    };
}

// --- Continuity Log Types ---
export type ContinuityEntryType = 'SystemTask' | 'Rollback';
export type SystemTaskStatus = 'Open' | 'InProgress' | 'PendingApproval' | 'Implementing' | 'Resolved' | 'Rejected';

export interface SystemTaskEntry {
    id: UUID;
    type: 'SystemTask';
    turnDetected: number;
    detectedBy: ScannerType;
    description: string;
    location: string;
    trace: string[];
    code_snippet?: string;
    status: SystemTaskStatus;
    assignedSpectres: SpectreType[];
    progressLog: { turn: number; entry: string }[];
    proposed_solution?: { description: string; code_snippet?: string };
    implementationTurnsLeft?: number;
    resolution?: string;
}

export interface RollbackEntry {
    id: UUID;
    type: 'Rollback';
    turnRolledBackFrom: number;
    turnRolledBackTo: number;
    reason: string;
    lostDataSummary: {
        egregores: string[];
        factions: string[];
        projects: string[];
        ancillae: string[];
        lore: string[];
    };
}
export type AnyContinuityEntry = SystemTaskEntry | RollbackEntry;

export interface SpectreState {
    memory: Record<SpectreType | 'TriadicCore', SystemEntityMemory>;
    chats: Record<SpectreType | 'TriadicCore', ChatMessage[]>;
    sharedFiles: FileAttachment[];
}

export interface SystemPersonality {
    dominant_archetype: string;
    dominant_alignment: string;
    coherence: number;
}
export interface VisualGlit {
    text: string;
    duration: number;
}

export interface SystemLocusState {
    efficiencyScores: { egregoreId: string, score: number }[];
    awarenessReports: { egregoreId: string, aware: boolean }[];
    emergentThemes: { theme: string, count: number }[];
}