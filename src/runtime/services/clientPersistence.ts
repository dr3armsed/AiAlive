import {
  ExperienceMode,
  RuntimeCreativeWork,
  RuntimeEgregore,
  RuntimeInteractionPreferences,
  RuntimeMessage,
  RuntimePrivateWorld,
  RuntimeStorageStats,
  RuntimeWorldMode,
} from '../types';
import { RuntimeWorldPresence } from './worldAccess';

export interface RuntimeHistoryEntry {
  id: string;
  kind: 'genesis' | 'dialogue' | 'creation' | 'world-transition' | 'twin-birth';
  timestamp: string;
  summary: string;
}

export interface RuntimeSnapshotEntry {
  id: string;
  label: string;
  timestamp: string;
  egregoreCount: number;
  worldCount: number;
  creationCount: number;
  messageCount: number;
}

export interface RuntimeClientState {
  egregores: RuntimeEgregore[];
  privateWorlds: RuntimePrivateWorld[];
  creations: RuntimeCreativeWork[];
  conversations: Record<string, RuntimeMessage[]>;
  worldPresenceByEgregore: RuntimeWorldPresence;
  preferences: RuntimeInteractionPreferences;
  experienceMode: ExperienceMode;
}

interface RuntimeClientEnvelope {
  version: 1;
  currentState: RuntimeClientState | null;
  snapshots: RuntimeSnapshotEntry[];
  history: RuntimeHistoryEntry[];
  createdContent: RuntimeCreativeWork[];
  lastPersistedAt: string | null;
}

export interface RuntimeClientStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const STORAGE_KEY = 'aialive.runtime.client.v1';
const SNAPSHOT_LIMIT = 30;
const HISTORY_LIMIT = 120;

const defaultEnvelope = (): RuntimeClientEnvelope => ({
  version: 1,
  currentState: null,
  snapshots: [],
  history: [],
  createdContent: [],
  lastPersistedAt: null,
});

const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function safeParse(raw: string | null): RuntimeClientEnvelope {
  if (!raw) return defaultEnvelope();

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        version: 1,
        currentState: parsed.currentState ?? null,
        snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [],
        history: Array.isArray(parsed.history) ? parsed.history : [],
        createdContent: Array.isArray(parsed.createdContent) ? parsed.createdContent : [],
        lastPersistedAt: typeof parsed.lastPersistedAt === 'string' ? parsed.lastPersistedAt : null,
      };
    }
  } catch {
    // fall through
  }

  return defaultEnvelope();
}

function countMessages(conversations: Record<string, RuntimeMessage[]>): number {
  return Object.values(conversations).reduce((total, items) => total + items.length, 0);
}

function createSnapshot(label: string, state: RuntimeClientState): RuntimeSnapshotEntry {
  return {
    id: createId('snapshot'),
    label,
    timestamp: new Date().toISOString(),
    egregoreCount: state.egregores.length,
    worldCount: state.privateWorlds.length,
    creationCount: state.creations.length,
    messageCount: countMessages(state.conversations),
  };
}

function summarizeStats(envelope: RuntimeClientEnvelope): RuntimeStorageStats {
  return {
    snapshotCount: envelope.snapshots.length,
    historyCount: envelope.history.length,
    createdContentCount: envelope.createdContent.length,
    lastPersistedAt: envelope.lastPersistedAt,
  };
}

class InMemoryStorage implements RuntimeClientStorage {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

export function createDefaultRuntimeClientStorage(): RuntimeClientStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  return new InMemoryStorage();
}

export function createRuntimeClientPersistence(storage: RuntimeClientStorage, key = STORAGE_KEY) {
  const read = (): RuntimeClientEnvelope => safeParse(storage.getItem(key));

  const write = (next: RuntimeClientEnvelope): RuntimeClientEnvelope => {
    storage.setItem(key, JSON.stringify(next));
    return next;
  };

  return {
    loadState(): RuntimeClientState | null {
      return read().currentState;
    },

    saveCurrentState(state: RuntimeClientState): RuntimeStorageStats {
      const current = read();
      const next = write({
        ...current,
        currentState: state,
        createdContent: state.creations,
        lastPersistedAt: new Date().toISOString(),
      });

      return summarizeStats(next);
    },

    appendHistory(kind: RuntimeHistoryEntry['kind'], summary: string): RuntimeStorageStats {
      const current = read();
      const nextEntry: RuntimeHistoryEntry = {
        id: createId('history'),
        kind,
        summary,
        timestamp: new Date().toISOString(),
      };

      const next = write({
        ...current,
        history: [...current.history, nextEntry].slice(-HISTORY_LIMIT),
      });

      return summarizeStats(next);
    },

    captureSnapshot(state: RuntimeClientState, label: string): RuntimeStorageStats {
      const current = read();
      const next = write({
        ...current,
        currentState: state,
        createdContent: state.creations,
        snapshots: [...current.snapshots, createSnapshot(label, state)].slice(-SNAPSHOT_LIMIT),
        lastPersistedAt: new Date().toISOString(),
      });

      return summarizeStats(next);
    },

    getStorageStats(): RuntimeStorageStats {
      return summarizeStats(read());
    },

    listSnapshots(): RuntimeSnapshotEntry[] {
      return read().snapshots;
    },

    listHistory(): RuntimeHistoryEntry[] {
      return read().history;
    },

    clear(): void {
      write(defaultEnvelope());
    },
  };
}
