import { useMemo, useState } from 'react';
import { RuntimeCreativeWork, RuntimeEgregore, RuntimeMessage, RuntimePrivateWorld } from '../types';

const themes = ['Mythic', 'Cybernetic', 'Noetic', 'Dream-Logic', 'Archival'];

function pickTheme(seed: string): string {
  const normalized = seed.trim();
  if (!normalized) return themes[0];
  const idx = normalized.length % themes.length;
  return themes[idx];
}

function craftReply(egregore: RuntimeEgregore, prompt: string): string {
  const originCue = egregore.sourceMaterial.slice(0, 80) || 'the origin signal';
  return `${egregore.name}: ${egregore.persona.slice(0, 120)} | I received: "${prompt}". I will process this through ${originCue}...`;
}

export function useMetacosmRuntime() {
  const [egregores, setEgregores] = useState<RuntimeEgregore[]>([]);
  const [privateWorlds, setPrivateWorlds] = useState<RuntimePrivateWorld[]>([]);
  const [creations, setCreations] = useState<RuntimeCreativeWork[]>([]);
  const [conversations, setConversations] = useState<Record<string, RuntimeMessage[]>>({});

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

  const sendMessage = (egregoreId: string, content: string) => {
    const egregore = egregores.find((e) => e.id === egregoreId);
    if (!egregore) return;

    const userMessage: RuntimeMessage = {
      id: `message_${Date.now()}_user`,
      egregoreId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const egregoreMessage: RuntimeMessage = {
      id: `message_${Date.now()}_egregore`,
      egregoreId,
      role: 'egregore',
      content: craftReply(egregore, content),
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) => ({
      ...prev,
      [egregoreId]: [...(prev[egregoreId] || []), userMessage, egregoreMessage],
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

  return {
    egregores,
    privateWorlds,
    creations,
    conversations,
    worldByEgregore,
    createFromGenesis,
    sendMessage,
    forgeCreation,
  };
}
