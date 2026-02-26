export interface RuntimeEgregore {
  id: string;
  name: string;
  persona: string;
  sourceMaterial: string;
  createdAt: string;
}

export interface RuntimePrivateWorld {
  id: string;
  egregoreId: string;
  roomCount: number;
  dominantTheme: string;
  summary: string;
  createdAt: string;
}

export interface RuntimeCreativeWork {
  id: string;
  title: string;
  type: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface RuntimeMessage {
  id: string;
  egregoreId: string;
  role: 'user' | 'egregore';
  content: string;
  timestamp: string;
}

export interface RuntimeSubsystem {
  id: string;
  name: string;
  status: 'online' | 'warming' | 'offline';
}

export interface RuntimeSystem {
  id: string;
  name: string;
  status: 'online' | 'warming' | 'offline';
  description: string;
  subsystems: RuntimeSubsystem[];
}

export interface RuntimeDialogueSignals {
  emotion: string;
  id_desire_count: number;
  superego_rule_count: number;
  ego_filter_strength: number;
}

export type DialogueSource =
  | 'python-bridge:ollama'
  | 'python-bridge:heuristic'
  | 'python-bridge:error'
  | 'local-fallback'
  | 'none';


export type DialogueStyleMode = 'poetic' | 'tactical' | 'adaptive';
export type DialogueSourceMode = 'auto' | 'external-first' | 'local-first';
export type ExperienceMode = 'guided' | 'console';

export interface RuntimeInteractionPreferences {
  styleMode: DialogueStyleMode;
  sourceMode: DialogueSourceMode;
  memoryDepth: number;
}

export interface RuntimeTelemetry {
  totalMessages: number;
  unknownMessages: number;
  lastDialogueSource: DialogueSource;
  lastSignals: RuntimeDialogueSignals | null;
  lastLatencyMs: number | null;
  errorCount: number;
  lastModel: string | null;
  lastError: string | null;
}
