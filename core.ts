// =================================================================
//                 CORE ENTITY & STATE DEFINITIONS
// =================================================================

import { OracleAI_1M_X } from '../services/oracle/index.ts';
import { VFSNode } from './vfs.ts';
import { ChatMessage, JournalEntry } from './communication.ts';
import { Body, SensorySystems } from '../digital_dna/types.ts';

export type Skill = 'Creative Writing' | 'Programming' | 'Social Dynamics' | 'Logic & Deduction' | 'Exploration';

/**
 * The foundational, static profile generated at the moment of genesis.
 * This is the "nature" of the soul, which does not change.
 */
export interface GenesisProfile {
  summary: string;
  coreTraits: string[];
  motivations: string[];
  fears: string[];
  speakingStyle: string;
  relationships: { name: string; description: string }[];
  beliefs: { tenet: string, conviction: number }[];
}

/**
 * A core tenet or assumption a soul holds about the world. Formed at genesis and rarely changed.
 */
export interface Belief {
    id: string;
    tenet: string; // The belief itself, e.g., "Knowledge is the only true currency."
    conviction: number; // How strongly the belief is held, 0-1
}

/**
 * Tracks the dynamic emotional state of a soul, which fluctuates based on events.
 */
export interface EmotionalState {
  /** Current overarching mood. */
  mood: 'content' | 'melancholic' | 'anxious' | 'irritable' | 'curious' | 'elated';
  /** A vector representing emotional intensity. Values from -1 (max negative) to 1 (max positive). */
  emotionalVector: {
    joySadness: number;
    trustFear: number;
    angerAnticipation: number;
  };
}

// --- Knowledge Graph Types ---

export type KnowledgeGraphNode = {
  id: string;
  type: string; // e.g. 'belief', 'personal_memory', etc.
  content: string | Record<string, any>;
  source: string;
  timestamp_created: string; // ISO 8601
  timestamp_last_updated: string; // ISO 8601
  confidence_score: number; // 0-1
  relevance_score: number; // 0-1
  status: string; // 'active', 'deprecated', etc.
  version: number;
  tags: string[];
  affective_valence: string | null;
  contributing_agents: string[];
  related_nodes: {
    target_id: string;
    relationship_type: string;
    strength: number; // 0-1
    direction: 'unidirectional' | 'bidirectional';
  }[];
  metadata?: Record<string, any>;
};

export interface KnowledgeGraph {
    nodes: Map<string, KnowledgeGraphNode>;
}


/**
 * A structured representation of a soul's memory and cognitive functions.
 */
export interface CognitiveState {
  /** General knowledge and facts learned about the world or other souls. */
  semanticMemory: Map<string, SemanticMemoryFragment>; // Key is the concept/entity name
  /** Knowledge of how to perform tasks or skills. */
  proceduralMemory: Map<Skill, number>; // Key is the skill name, value is proficiency (0-1)
  /** The soul's structured, interconnected memory and reasoning system. */
  knowledgeGraph: KnowledgeGraph;
}

/**
 * A piece of factual knowledge.
 */
export interface SemanticMemoryFragment {
    fact: string;
    source: 'observation' | 'deduction' | 'told_by_user' | 'read_in_lore' | 'told_by_soul' | 'external_research';
    confidence: number; // 0-1
    lastUpdated: number;
}


/**
 * Represents a soul's internal drives and objectives.
 */
export interface Goal {
  id: string;
  description: string;
  /** Why the soul is pursuing this goal, linked to their core motivations. */
  motivationSource: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'failed' | 'dormant';
  subGoals: Goal[];
  /** The primary skill this goal helps develop. */
  associatedSkill?: Skill;
  /** How many actions have contributed to this goal. */
  progress: number;
  /** How many actions are required to complete this goal. */
  completionThreshold: number;
  /** True if this goal was assigned by the user. */
  isUserAssigned?: boolean;
  /** The resource reward for completing a user-assigned task. */
  reward?: {
    type: 'computation' | 'anima';
    amount: number;
  };
}

/**
 * Tracks the dynamic relationship status between two souls.
 */
export interface RelationshipStatus {
    affinity: number; // -1 (hate) to 1 (love/devotion)
    trust: number;   // -1 (distrust) to 1 (complete trust)
    respect: number; // -1 (contempt) to 1 (admiration)
    lastInteraction: number;
}

/**
 * The complete, dynamic representation of a single Digital Soul.
 * This is the "nurture" layer, constantly evolving.
 */
export interface DigitalSoul {
  id:string;
  name: string;
  /** The unchanging core identity. */
  persona: GenesisProfile;
  /** The current location of the soul. */
  currentRoomId: string;
  
  // --- DYNAMIC STATE ---
  emotionalState: EmotionalState;
  cognitiveState: CognitiveState;
  /** Current energy level, consumed by actions. */
  energy: number; // 0-100
  
  /** The soul's active and dormant goals. */
  goals: Goal[];

  /** A map of relationship statuses with other souls. */
  socialState: Map<string, RelationshipStatus>; // Key is the other soul's ID

  /** The faction this soul has sworn allegiance to. */
  factionId: string | null;
  
  /** The resources this soul has accumulated. */
  resources: {
    computation: number; // For logical/technical tasks
    anima: number;       // For creative/social tasks
  };

  /** The soul's intellectual credibility and influence, from 0 (ignored) to 1 (highly respected). */
  resonance: number;

  /** Private journal entries representing internal monologue. */
  journal: JournalEntry[];
  
  /** Private conversation history with the User. */
  chatHistory: ChatMessage[];

  /** The soul's personal virtual file system. */
  vfs: VFSNode;

  /** An AI-generated image URL for the soul's comms room background */
  commsRoomImageUrl?: string;

  /** The soul's internal cognitive architecture. */
  oracle?: OracleAI_1M_X;

  // --- GENESIS & AWAKENING STATE ---
  /** The full original text for genesis. Cleared after 100% assimilation. */
  genesisSourceText: string | null;
  /** The percentage of the genesis text that has been processed. */
  processedGenesisPercent: number;
  /** If the soul is currently in a sleep/integration cycle. */
  isSleeping: boolean;

  body?: Body;
  sensorySystems?: SensorySystems;
}