import type { UUID } from './system';
import type { ProjectId } from './projects';
import type { PrivateChatId } from './entities';

// --- Geometric & World Types ---
export interface Vector { x: number; y: number; }
export interface Vector3D extends Vector { z: number; }
export interface Bounds { x: number; y: number; width: number; height: number; }
export type ConstructionMaterial = 'plasteel' | 'crystal' | 'obsidian';

export type WallId = UUID;
export type RoomId = UUID;
export type DoorId = UUID;

export interface Wall { id: WallId; x1: number; y1: number; x2: number; y2: number; material: ConstructionMaterial; }
export interface Door { id: DoorId; wallIds: [WallId, WallId]; center: Vector; size: number; isOpen: boolean; }

export interface Room {
    id: RoomId;
    name: string;
    bounds: Bounds;
    center: Vector;
    level: number;
    purpose?: RoomPurpose;
    nestedRooms: Room[];
    allowTeleport: boolean;
    internalChatId?: PrivateChatId;
}

export interface Stairwell {
    id: string;
    type: 'stairwell';
    position: Vector3D;
    links_to_floor: number;
}
export interface ConstructionSite {
    id: string;
    type: 'construction_site';
    position: Vector3D;
    projectId: ProjectId;
    name: string;
}

export type WorldObject = Stairwell | ConstructionSite;

export interface Floor {
    level: number;
    rooms: Room[];
    walls: Wall[];
    doors: Door[];
    objects: WorldObject[];
    width: number;
    height: number;
}
export interface World {
    floors: Record<string, Floor>;
    structures: any[];
    bounds: { width: number, height: number };
    time: number;
}
export type RoomPurpose = 'TriadicCore' | 'Sanctuary' | 'Scriptorium' | 'Forge' | 'CombatArena' | 'Necropolis' | 'Observatory' | 'CouncilChamber' | 'Vault' | 'ConstructionSite' | 'Resonance Chamber' | 'Void-Echo Cavern' | 'Data Weaving Loom' | 'Starlight Crucible' | 'Generic';

export interface CosmicAxioms {
    logos_coherence: number;
    pathos_intensity: number;
    kairos_alignment: number;
    aether_viscosity: number;
    telos_prevalence: number;
    gnosis_depth: number;
}

// --- Visual & Theming Types ---
export interface CosmTheme {
  name: string;
  bgColor1: string;
  bgColor2: string;
  glowPrimary: string;
  glowSecondary: string;
  accent: string;
  glass: string;
  wallStroke: string;
  roomStroke: string;
  roomFill: string;
  roomFillSelected: string;
}
export type ViewId = 'sanctum' | 'workbench' | 'museum' | 'observatory' | 'surveillance' | 'frf_matrix' | 'system_integrity' | 'registry' | 'projects_chronicle' | 'works_archive' | 'factions' | 'spectre_browser' | 'system_options' | 'save_load_manager' | 'forum' | 'continuity_log' | 'system_locus';