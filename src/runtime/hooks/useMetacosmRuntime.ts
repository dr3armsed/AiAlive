import { useEffect, useMemo, useState } from 'react';
import {
  DialogueSource,
  ExperienceMode,
  RuntimeCreativeWork,
  RuntimeDialogueSignals,
  RuntimeEgregore,
  RuntimeInteractionPreferences,
  RuntimeMessage,
  RuntimePrivateWorld,
  RuntimeSystem,
  RuntimeTelemetry,
  RuntimeWorldMode,
} from '../types';
import {
  buildArchitectTwinPersona,
  buildDefaultRuntimeState,
  buildLegendarySystems,
  generateDeepTwinConversation,
} from '../orchestration';
import { generateDialogueTurn } from '../services/dialogueAdapter';
import {
  createDefaultRuntimeClientStorage,
  createRuntimeClientPersistence,
  RuntimeClientState,
} from '../services/clientPersistence';
import { createDefaultRuntimeMemoryStorage, createMemoryPipeline } from '../services/memoryPipeline';
import { createWorldSubstrate, appendCreationProjection, appendGenesisProjection, summarizeSubstrateHealth } from '../services/worldSubstrate';
import { initializeWorldPresence, resolveWorldTransition } from '../services/worldAccess';

const themes = ['Mythic', 'Cybernetic', 'Noetic', 'Dream-Logic', 'Archival'];
const DEFAULT_PREFERENCES: RuntimeInteractionPreferences = {
  styleMode: 'adaptive',
  sourceMode: 'auto',
  memoryDepth: 4,
};

function pickTheme(seed: string): string {
  const normalized = seed.trim();
  if (!normalized) return themes[0];
  return themes[normalized.length % themes.length];
}

function createFallbackState(): RuntimeClientState {
  const initial = buildDefaultRuntimeState();
  return {
    egregores: initial.egregores,
    privateWorlds: initial.privateWorlds,
    creations: [],
    conversations: initial.conversations,
    worldPresenceByEgregore: initializeWorldPresence(initial.egregores),
    preferences: DEFAULT_PREFERENCES,
    experienceMode: 'guided',
  };
}

export function useMetacosmRuntime() {
  const persistence = useMemo(
    () => createRuntimeClientPersistence(createDefaultRuntimeClientStorage()),
    [],
  );
  const memoryPipeline = useMemo(
    () => createMemoryPipeline(createDefaultRuntimeMemoryStorage()),
    [],
  );
  const restoredState = useMemo(() => persistence.loadState() ?? createFallbackState(), [persistence]);

  const [egregores, setEgregores] = useState<RuntimeEgregore[]>(restoredState.egregores);
  const [privateWorlds, setPrivateWorlds] = useState<RuntimePrivateWorld[]>(restoredState.privateWorlds);
  const [creations, setCreations] = useState<RuntimeCreativeWork[]>(restoredState.creations);
  const [conversations, setConversations] = useState<Record<string, RuntimeMessage[]>>(restoredState.conversations);
  const [worldPresenceByEgregore, setWorldPresenceByEgregore] = useState(restoredState.worldPresenceByEgregore);
  const [preferences, setPreferences] = useState<RuntimeInteractionPreferences>(restoredState.preferences);
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>(restoredState.experienceMode);
  const [lastDialogueSource, setLastDialogueSource] = useState<DialogueSource>('none');
  const [lastSignals, setLastSignals] = useState<RuntimeDialogueSignals | null>(null);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState(persistence.getStorageStats());
  const [memoryStats, setMemoryStats] = useState(memoryPipeline.getStats());
  const [substrate, setSubstrate] = useState(() =>
    createWorldSubstrate(restoredState.egregores, restoredState.privateWorlds, restoredState.creations),
  );

  const systems: RuntimeSystem[] = useMemo(() => buildLegendarySystems(), []);

  useEffect(() => {
    const stateToPersist: RuntimeClientState = {
      egregores,
      privateWorlds,
      creations,
      conversations,
      worldPresenceByEgregore,
      preferences,
      experienceMode,
    };

    setStorageStats(persistence.saveCurrentState(stateToPersist));
  }, [
    conversations,
    creations,
    egregores,
    experienceMode,
    persistence,
    preferences,
    privateWorlds,
    worldPresenceByEgregore,
  ]);

  const createFromGenesis = (name: string, persona: string, sourceMaterial: string) => {
    const now = new Date().toISOString();
    const idSeed = Date.now();

    const egregore: RuntimeEgregore = {
      id: `egregore_${idSeed}`,
      name,
      persona: persona || buildArchitectTwinPersona(name, sourceMaterial),
      sourceMaterial,
      createdAt: now,
    };

    const world: RuntimePrivateWorld = {
      id: `world_${idSeed}`,
      egregoreId: egregore.id,
      roomCount: Math.max(3, Math.min(12, Math.ceil(sourceMaterial.length / 180))),
      dominantTheme: pickTheme(`${name}${persona}${sourceMaterial}`),
      summary: `A subconscious architecture generated for ${name} from source resonance material.`,
      createdAt: now,
    };

    const awakening: RuntimeMessage = {
      id: `message_${idSeed}_awake`,
      egregoreId: egregore.id,
      role: 'egregore',
      content: `${egregore.name}: I awaken in this architecture.`,
      timestamp: now,
    };

    setEgregores((prev) => [egregore, ...prev]);
    setPrivateWorlds((prev) => [world, ...prev]);
    setConversations((prev) => ({ ...prev, [egregore.id]: [awakening] }));
    setWorldPresenceByEgregore((prev) => ({ ...prev, [egregore.id]: 'shared-world' }));
    setSubstrate((prev) => appendGenesisProjection(prev, { egregore, world }));

    const nextState: RuntimeClientState = {
      egregores: [egregore, ...egregores],
      privateWorlds: [world, ...privateWorlds],
      creations,
      conversations: { ...conversations, [egregore.id]: [awakening] },
      worldPresenceByEgregore: { ...worldPresenceByEgregore, [egregore.id]: 'shared-world' },
      preferences,
      experienceMode,
    };

    setStorageStats(persistence.appendHistory('genesis', `Genesis initiated for ${egregore.name}.`));
    setStorageStats(persistence.captureSnapshot(nextState, `Genesis: ${egregore.name}`));

    return { egregore, world };
  };

  const birthArchitectTwin = (conversationSeed: string, observations: string) => {
    const persona = buildArchitectTwinPersona(conversationSeed, observations);
    const { egregore } = createFromGenesis('Architect_Twin', persona, conversationSeed);
    const deepTranscript = generateDeepTwinConversation(egregore, observations);

    setConversations((prev) => ({
      ...prev,
      [egregore.id]: [...(prev[egregore.id] || []), ...deepTranscript],
    }));

    setStorageStats(persistence.appendHistory('twin-birth', `Architect Twin awakened with ${deepTranscript.length} seeded turns.`));
    return egregore;
  };

  const sendMessage = async (egregoreId: string, content: string) => {
    const egregore = egregores.find((entry) => entry.id === egregoreId);
    if (!egregore) return;

    const userMessage: RuntimeMessage = {
      id: `message_${Date.now()}_user`,
      egregoreId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) => ({
      ...prev,
      [egregoreId]: [...(prev[egregoreId] || []), userMessage],
    }));

    const steeringPrefix = `[style=${preferences.styleMode};source=${preferences.sourceMode};memoryDepth=${preferences.memoryDepth}]`;
    const result = await generateDialogueTurn({ prompt: `${steeringPrefix} ${content}`, egregore });
    setLastDialogueSource(result.source);
    setLastSignals(result.signals);
    setLastLatencyMs(result.latencyMs);
    setLastModel(result.model);

    if (result.error) {
      setErrorCount((prev) => prev + 1);
      setLastError(result.error);
    } else {
      setLastError(null);
    }

    const egregoreMessage: RuntimeMessage = {
      id: `message_${Date.now()}_egregore`,
      egregoreId,
      role: 'egregore',
      content: result.response,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) => ({
      ...prev,
      [egregoreId]: [...(prev[egregoreId] || []), egregoreMessage],
    }));

    memoryPipeline.appendEvent({
      egregoreId,
      egregoreName: egregore.name,
      userMessage: content,
      egregoreMessage: result.response,
      source: result.source,
      signals: result.signals,
      styleMode: preferences.styleMode,
      sourceMode: preferences.sourceMode,
      memoryDepth: preferences.memoryDepth,
    });

    setMemoryStats(memoryPipeline.getStats());
    setStorageStats(persistence.appendHistory('dialogue', `Dialogue exchange recorded for ${egregore.name}.`));
  };

  const setEgregoreWorldMode = (egregoreId: string, targetMode: RuntimeWorldMode) => {
    setWorldPresenceByEgregore((prev) => {
      const transition = resolveWorldTransition(prev, egregores, privateWorlds, egregoreId, targetMode);
      if (!transition.ok) return prev;
      setStorageStats(persistence.appendHistory('world-transition', `${egregoreId} moved to ${targetMode}.`));
      return transition.worldPresence;
    });
  };

  const forgeCreation = (title: string, type: string, content: string, authorId: string) => {
    const work: RuntimeCreativeWork = {
      id: `creation_${Date.now()}`,
      title,
      type,
      content,
      authorId,
      createdAt: new Date().toISOString(),
    };

    setCreations((prev) => [work, ...prev]);
    setSubstrate((prev) => appendCreationProjection(prev, work));
    setStorageStats(persistence.appendHistory('creation', `Creation forged: ${work.title}.`));
    return work;
  };

  const worldByEgregore = useMemo(() => {
    const map = new Map<string, RuntimePrivateWorld>();
    privateWorlds.forEach((world) => map.set(world.egregoreId, world));
    return map;
  }, [privateWorlds]);

  const telemetry: RuntimeTelemetry = useMemo(() => {
    const allMessages = Object.values(conversations).flat();
    return {
      totalMessages: allMessages.length,
      unknownMessages: allMessages.filter((message) => message.egregoreId === 'egregore_unknown').length,
      lastDialogueSource,
      lastSignals,
      lastLatencyMs,
      errorCount,
      lastModel,
      lastError,
      activeStyleMode: preferences.styleMode,
      activeSourceMode: preferences.sourceMode,
      experienceMode,
      storageStats,
      memoryStats,
      substrateHealth: summarizeSubstrateHealth(substrate),
    };
  }, [
    conversations,
    errorCount,
    experienceMode,
    lastDialogueSource,
    lastError,
    lastLatencyMs,
    lastModel,
    lastSignals,
    memoryStats,
    preferences.memoryDepth,
    preferences.sourceMode,
    preferences.styleMode,
    storageStats,
    substrate,
  ]);

  return {
    egregores,
    privateWorlds,
    creations,
    conversations,
    systems,
    telemetry,
    worldByEgregore,
    worldPresenceByEgregore,
    createFromGenesis,
    birthArchitectTwin,
    sendMessage,
    setEgregoreWorldMode,
    forgeCreation,
    experienceMode,
    setExperienceMode,
    preferences,
    setPreferences,
  };
}
