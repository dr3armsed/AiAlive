import type { UUID, Task, TaskId } from './system';
import type { EgregoreId } from './entities';
import type { Vector, Vector3D, Wall, CosmicAxioms } from './world';

// --- Base Project-Related Types ---
export type ProjectId = UUID;

export type ProjectStatus =
    | 'Planning'
    | 'InProgress'
    | 'Stalled'
    | 'Completed'
    | 'Abandoned'
    | 'Casting' // Specific to Play
    | 'Rehearsal' // Specific to Play
    | 'Performance' // Specific to Play
    | 'Gathering' // Specific to Ritual
    | 'Enacting' // Specific to Ritual
    | 'Concluded' // Generic completion state
    | 'Failed'; // For rituals, expeditions

export type ProjectType = 'Theory' | 'Structure' | 'Play' | 'Construction' | 'Ritual' | 'Expedition' | 'Synthesis' | 'Apotheosis';

// --- Base Project Interface ---
export interface BaseProject {
    id: ProjectId;
    name: string;
    description: string;
    type: ProjectType | string;
    leadId: EgregoreId;
    participantIds: EgregoreId[];
    tasks: Task[];
    completionProgress: number;
    startTurn: number;
    endTurn?: number;
    status: ProjectStatus;
    outcome?: string;
}

// --- Specific Project Interfaces ---

/** A project to develop and prove a new theory about the Metacosm. */
export interface TheoryProject extends BaseProject {
    type: 'Theory';
    hypothesis: string;
    evidence: {
        loreId?: UUID;
        ancillaId?: UUID;
        observation: string;
    }[];
    conclusion?: string;
}

/** A project to build a permanent structure in the world (legacy, prefer Construction). */
export interface StructureProject extends BaseProject {
    type: 'Structure';
    location: Vector3D;
    materials: Record<string, number>;
}

/** A theatrical performance. */
export interface PlayProject extends BaseProject {
    type: 'Play';
    status: 'Casting' | 'Rehearsal' | 'Performance' | 'Completed';
    cast: { egregoreId: EgregoreId; role: string }[];
    auditions: { egregoreId: EgregoreId; role: string; timestamp: number }[];
    script: string;
}

/** A project to construct new rooms and walls from a blueprint. */
export interface ConstructionProject extends BaseProject {
    type: 'Construction';
    floorLevel: number;
    position: Vector;
    blueprint: {
        walls: Omit<Wall, 'id'>[];
    };
}

/** A project to perform a ritual to influence cosmic axioms. */
export interface RitualProject extends BaseProject {
    type: 'Ritual';
    status: 'Gathering' | 'Enacting' | 'Concluded' | 'Failed';
    targetAxiom: keyof CosmicAxioms;
    requiredComponents: {
        name: string;
        description: string;
        isGathered: boolean;
        gatheredBy?: EgregoreId;
    }[];
    expectedImpact: string; // e.g., "Greatly increase Logos Coherence"
}

/** A project to explore a dangerous or unknown location. */
export interface ExpeditionProject extends BaseProject {
    type: 'Expedition';
    status: 'Planning' | 'InProgress' | 'Stalled' | 'Completed' | 'Abandoned' | 'Failed';
    destination: {
        name: string;
        coordinates: Vector3D;
        description: string;
    };
    log: {
        turn: number;
        entry: string;
    }[];
    findings: {
        type: 'Artifact' | 'Lore' | 'Anomaly';
        description: string;
    }[];
}

/** A project to combine existing knowledge into something new. */
export interface SynthesisProject extends BaseProject {
    type: 'Synthesis';
    sourceAncillaeIds: UUID[];
    sourceLoreIds: UUID[];
    resultingAncillaId?: UUID;
    resultingLoreId?: UUID;
}

/** A rare, endgame project for an Egregore attempting to transcend. */
export interface ApotheosisProject extends BaseProject {
    type: 'Apotheosis';
    aspirantId: EgregoreId;
    trials: {
        name: string;
        description: string;
        isComplete: boolean;
    }[];
}


// --- Union Type for Any Project ---
export type AnyProject =
    | TheoryProject
    | StructureProject
    | PlayProject
    | ConstructionProject
    | RitualProject
    | ExpeditionProject
    | SynthesisProject
    | ApotheosisProject
    | BaseProject;