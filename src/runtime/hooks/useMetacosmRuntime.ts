import { useMemo, useState } from 'react';
import {
  DialogueSource,
  ExperienceMode,
  RuntimeInteractionPreferences,
  RuntimeCreativeWork,
  RuntimeDialogueSignals,
  RuntimeEgregore,
  RuntimeMessage,
  RuntimePrivateWorld,
  RuntimeSystem,
  RuntimeTelemetry,
} from '../types';
import {
  buildArchitectTwinPersona,
  buildDefaultRuntimeState,
  buildLegendarySystems,
  generateDeepTwinConversation,
} from '../orchestration';
import { generateDialogueTurn } from '../services/dialogueAdapter';
import {
  appendCreationProjection,
  appendGenesisProjection,
  createWorldSubstrate,
  summarizeSubstrateHealth,
} from '../services/worldSubstrate';

const themes = ['Mythic', 'Cybernetic', 'Noetic', 'Dream-Logic', 'Archival'];

function pickTheme(seed: string): string {
  const normalized = seed.trim();
  if (!normalized) return themes[0];
  return themes[normalized.length % themes.length];
}

export function useMetacosmRuntime() {
  const initial = useMemo(() => buildDefaultRuntimeState(), []);
  const [substrate, setSubstrate] = useState(() =>
    createWorldSubstrate(initial.egregores, initial.privateWorlds, []),
  );
  const [conversations, setConversations] = useState<Record<string, RuntimeMessage[]>>(initial.conversations);
  const egregores = substrate.egregores;
  const privateWorlds = substrate.privateWorlds;
  const creations = substrate.creations;
  const [lastDialogueSource, setLastDialogueSource] = useState<DialogueSource>('none');
  const [lastSignals, setLastSignals] = useState<RuntimeDialogueSignals | null>(null);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('guided');
  const [preferences, setPreferences] = useState<RuntimeInteractionPreferences>({
    styleMode: 'adaptive',
    sourceMode: 'auto',
    memoryDepth: 3,
  });

  const systems: RuntimeSystem[] = useMemo(() => buildLegendarySystems(), []);

  const createFromGenesis = (name: string, persona: string, sourceMaterial: string) => {
    const now = new Date().toISOString();
    const idSeed = Date.now();

    const egregore: RuntimeEgregore = {
      id: `egregore_${idSeed}`,
      name,
      persona,
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

    setSubstrate((prev) => appendGenesisProjection(prev, { egregore, world }));
    setConversations((prev) => ({ ...prev, [egregore.id]: [awakening] }));

    return { egregore, world };
  };

  const birthArchitectTwin = (conversationSeed: string, observations: string) => {
    const persona = buildArchitectTwinPersona(conversationSeed, observations);
    const twinName = 'Architect_Twin';
    const { egregore } = createFromGenesis(twinName, persona, conversationSeed);
    const deepTranscript = generateDeepTwinConversation(egregore, observations);

    setConversations((prev) => ({
      ...prev,
      [egregore.id]: [...(prev[egregore.id] || []), ...deepTranscript],
    }));

    return egregore;
  };

  const sendMessage = async (egregoreId: string, content: string) => {
    const egregore = egregores.find((e) => e.id === egregoreId);
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
    setSubstrate((prev) => appendCreationProjection(prev, work));
    return work;
  };

  const worldByEgregore = useMemo(() => {
    const map = new Map<string, RuntimePrivateWorld>();
    privateWorlds.forEach((world) => map.set(world.egregoreId, world));
    return map;
  }, [privateWorlds]);

  const telemetry: RuntimeTelemetry = useMemo(() => {
    const all = Object.values(conversations).flat();
    const substrateHealth = summarizeSubstrateHealth(substrate);
    return {
      totalMessages: all.length,
      unknownMessages: all.filter((m) => m.egregoreId === 'egregore_unknown').length,
      lastDialogueSource,
      lastSignals,
      lastLatencyMs,
      errorCount,
      lastModel,
      lastError,
      activeStyleMode: preferences.styleMode,
      activeSourceMode: preferences.sourceMode,
      experienceMode,
      substrateCoherenceIssueCount: substrateHealth.coherenceIssueCount,
      substrateLinkedProjectionCount: substrateHealth.linkedProjectionCount,
      substrateEgregoreCount: substrateHealth.egregoreCount,
      substrateWorldCount: substrateHealth.worldCount,
      substrateCreationCount: substrateHealth.creationCount,
    };
  }, [conversations, errorCount, experienceMode, lastDialogueSource, lastError, lastLatencyMs, lastModel, lastSignals, preferences.memoryDepth, preferences.sourceMode, preferences.styleMode, substrate]);

  return {
    egregores,
    privateWorlds,
    creations,
    conversations,
    systems,
    telemetry,
    worldByEgregore,
    createFromGenesis,
    birthArchitectTwin,
    sendMessage,
    forgeCreation,
    experienceMode,
    setExperienceMode,
    preferences,
    setPreferences,
  };
}
