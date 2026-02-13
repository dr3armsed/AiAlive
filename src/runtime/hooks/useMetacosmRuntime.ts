import { useMemo, useState } from 'react';
import {
  RuntimeCreativeWork,
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

const themes = ['Mythic', 'Cybernetic', 'Noetic', 'Dream-Logic', 'Archival'];

function pickTheme(seed: string): string {
  const normalized = seed.trim();
  if (!normalized) return themes[0];
  const idx = normalized.length % themes.length;
  return themes[idx];
}

export function useMetacosmRuntime() {
  const defaults = useMemo(() => buildDefaultRuntimeState(), []);
  const [egregores, setEgregores] = useState<RuntimeEgregore[]>(defaults.egregores);
  const [privateWorlds, setPrivateWorlds] = useState<RuntimePrivateWorld[]>(defaults.privateWorlds);
  const [creations, setCreations] = useState<RuntimeCreativeWork[]>([]);
  const [conversations, setConversations] = useState<Record<string, RuntimeMessage[]>>(defaults.conversations);
  const [systems] = useState<RuntimeSystem[]>(() => buildLegendarySystems());
  const [lastDialogueSource, setLastDialogueSource] = useState<'python-bridge' | 'local-fallback' | 'none'>('none');

  const createFromGenesis = (name: string, persona: string, sourceMaterial: string) => {
    const now = new Date().toISOString();
    const egregore: RuntimeEgregore = {
      id: `egregore_${Date.now()}`,
      name,
      persona,
      sourceMaterial,
      createdAt: now,
    };

    const world: RuntimePrivateWorld = {
      id: `world_${Date.now()}`,
      egregoreId: egregore.id,
      roomCount: Math.max(3, Math.min(12, Math.ceil(sourceMaterial.length / 180))),
      dominantTheme: pickTheme(`${name}${persona}${sourceMaterial}`),
      summary: `A subconscious architecture generated for ${name} from source resonance material.`,
      createdAt: now,
    };

    setEgregores((prev) => [egregore, ...prev]);
    setPrivateWorlds((prev) => [world, ...prev]);
    setConversations((prev) => ({
      ...prev,
      [egregore.id]: [
        {
          id: `message_${Date.now()}`,
          egregoreId: egregore.id,
          role: 'egregore',
          content: `${egregore.name}: I awaken in this architecture.`,
          timestamp: now,
        },
      ],
    }));

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

    const result = await generateDialogueTurn({ prompt: content, egregore });
    setLastDialogueSource(result.source);

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
    setCreations((prev) => [work, ...prev]);
    return work;
  };

  const worldByEgregore = useMemo(() => {
    const map = new Map<string, RuntimePrivateWorld>();
    privateWorlds.forEach((world) => map.set(world.egregoreId, world));
    return map;
  }, [privateWorlds]);

  const telemetry: RuntimeTelemetry = useMemo(() => {
    const all = Object.values(conversations).flat();
    return {
      totalMessages: all.length,
      unknownMessages: all.filter((m) => m.egregoreId === 'egregore_unknown').length,
      lastDialogueSource,
    };
  }, [conversations, lastDialogueSource]);

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
  };
}
