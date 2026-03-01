import { ActionType } from "./actions";

// =================================================================
//                  WORLD & ENVIRONMENT DEFINITIONS
// =================================================================

export type LoreType = 'history' | 'fiction' | 'poem' | 'technical-document' | 'personal-account' | 'discovery';

/**
 * A piece of content created by a soul and stored in a room's library.
 */
export interface LoreEntry {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  timestamp: number;
  title: string;
  content: string;
  type: LoreType;
  tags: string[];
}

/**
 * An object within a room that souls can interact with.
 */
export interface InteractableObject {
    id: string;
    name: string;
    description: string;
    /** The possible actions a soul can perform on this object. */
    affordances: ActionType[];
    /** The current state of the object, which can be changed by interactions. */
    state: Record<string, any>; // e.g., { "ticking": true, "chime_volume": 11 }
    /** Optional ID of the faction that created this object */
    creatorFactionId?: string;
}

/**
 * Represents a single room in the house, a sentient environment.
 */
export interface Room {
  id: string;
  name: string;
  description: string;
  /** IDs of rooms connected to this one. */
  connections: string[];
  /** The library of lore created within this room. */
  library: LoreEntry[];
  /** The objects present in this room. */
  interactableObjects: InteractableObject[];
  /** The passive generation of resources in this room. */
  resourceYield: {
    computation: number;
    anima: number;
  };
  /** Dynamic ambient conditions that can affect souls. */
  ambience: {
    lightLevel: number; // 0-1
    soundscape: 'silent' | 'humming' | 'whispering' | 'roaring';
    temperature: number; // in Celsius
    scent: string; // Descriptive smell of the room
  };
  /** ID of the parent room, if this is a sub-room */
  parentId?: string | null;
  /** Array of nested rooms */
  subRooms?: Room[];
}
