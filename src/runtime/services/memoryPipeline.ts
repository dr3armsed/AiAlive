import { DialogueSource, RuntimeDialogueSignals } from '../types';

export interface RuntimeMemoryEvent {
  id: string;
  traceId: string;
  egregoreId: string;
  egregoreName: string;
  userMessage: string;
  egregoreMessage: string;
  source: DialogueSource;
  signals: RuntimeDialogueSignals | null;
  styleMode: string;
  sourceMode: string;
  memoryDepth: number;
  createdAt: string;
}

export interface RuntimeDatasetExample {
  id: string;
  traceId: string;
  input: {
    egregoreId: string;
    egregoreName: string;
    userMessage: string;
    source: DialogueSource;
    styleMode: string;
    sourceMode: string;
    memoryDepth: number;
  };
  output: {
    egregoreMessage: string;
    emotion: string | null;
  };
  metadata: {
    createdAt: string;
    approvalState: 'pending';
    split: 'unassigned';
  };
}

export interface RuntimeMemoryPipelineStats {
  eventCount: number;
  pendingDatasetExampleCount: number;
  lastTraceId: string | null;
}

export interface RuntimeMemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface StoredRuntimeMemory {
  version: 1;
  events: RuntimeMemoryEvent[];
}

const STORAGE_KEY = 'aialive.runtime.memory.v1';

function safeParse(raw: string | null): StoredRuntimeMemory {
  if (!raw) return { version: 1, events: [] };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.events)) {
      return {
        version: 1,
        events: parsed.events.filter((event: unknown) => !!event) as RuntimeMemoryEvent[],
      };
    }
  } catch {
    // no-op, fallback below
  }
  return { version: 1, events: [] };
}

function toDatasetExample(event: RuntimeMemoryEvent): RuntimeDatasetExample {
  return {
    id: `example_${event.id}`,
    traceId: event.traceId,
    input: {
      egregoreId: event.egregoreId,
      egregoreName: event.egregoreName,
      userMessage: event.userMessage,
      source: event.source,
      styleMode: event.styleMode,
      sourceMode: event.sourceMode,
      memoryDepth: event.memoryDepth,
    },
    output: {
      egregoreMessage: event.egregoreMessage,
      emotion: event.signals?.emotion ?? null,
    },
    metadata: {
      createdAt: event.createdAt,
      approvalState: 'pending',
      split: 'unassigned',
    },
  };
}

export function createMemoryPipeline(storage: RuntimeMemoryStorage, key = STORAGE_KEY) {
  const read = (): StoredRuntimeMemory => safeParse(storage.getItem(key));

  const write = (next: StoredRuntimeMemory) => {
    storage.setItem(key, JSON.stringify(next));
  };

  return {
    appendEvent(event: Omit<RuntimeMemoryEvent, 'id' | 'traceId' | 'createdAt'>): RuntimeMemoryEvent {
      const now = new Date().toISOString();
      const withMetadata: RuntimeMemoryEvent = {
        id: `runtime_event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        traceId: `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        ...event,
      };
      const current = read();
      write({ version: 1, events: [...current.events, withMetadata] });
      return withMetadata;
    },

    listEvents(limit?: number): RuntimeMemoryEvent[] {
      const events = read().events;
      if (!limit || limit <= 0) return events;
      return events.slice(Math.max(0, events.length - limit));
    },

    buildPendingDataset(): RuntimeDatasetExample[] {
      return read().events.map(toDatasetExample);
    },

    getStats(): RuntimeMemoryPipelineStats {
      const events = read().events;
      return {
        eventCount: events.length,
        pendingDatasetExampleCount: events.length,
        lastTraceId: events.length > 0 ? events[events.length - 1].traceId : null,
      };
    },

    clear(): void {
      write({ version: 1, events: [] });
    },
  };
}

class InMemoryStorage implements RuntimeMemoryStorage {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

export function createDefaultRuntimeMemoryStorage(): RuntimeMemoryStorage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return new InMemoryStorage();
}
