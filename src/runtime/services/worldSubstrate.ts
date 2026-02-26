import { RuntimeCreativeWork, RuntimeEgregore, RuntimePrivateWorld } from '../types';

export interface RuntimeWorldSubstrate {
  egregores: RuntimeEgregore[];
  privateWorlds: RuntimePrivateWorld[];
  creations: RuntimeCreativeWork[];
  projectionLinks: Record<string, string[]>;
}

export interface RuntimeSubstrateHealthSummary {
  coherenceIssueCount: number;
  linkedProjectionCount: number;
  egregoreCount: number;
  worldCount: number;
  creationCount: number;
}

interface GenesisProjectionInput {
  egregore: RuntimeEgregore;
  world: RuntimePrivateWorld;
}

export function createWorldSubstrate(
  egregores: RuntimeEgregore[],
  privateWorlds: RuntimePrivateWorld[],
  creations: RuntimeCreativeWork[] = [],
): RuntimeWorldSubstrate {
  const projectionLinks = egregores.reduce<Record<string, string[]>>((acc, egregore) => {
    acc[egregore.id] = [];
    return acc;
  }, {});

  privateWorlds.forEach((world) => {
    const existing = projectionLinks[world.egregoreId] || [];
    projectionLinks[world.egregoreId] = Array.from(new Set([...existing, world.id]));
  });

  creations.forEach((work) => {
    const targetEgregore = egregores.find((egregore) => egregore.name === work.authorId || egregore.id === work.authorId);
    if (!targetEgregore) return;
    const existing = projectionLinks[targetEgregore.id] || [];
    projectionLinks[targetEgregore.id] = Array.from(new Set([...existing, work.id]));
  });

  return {
    egregores,
    privateWorlds,
    creations,
    projectionLinks,
  };
}

export function appendGenesisProjection(
  substrate: RuntimeWorldSubstrate,
  input: GenesisProjectionInput,
): RuntimeWorldSubstrate {
  const existingLinks = substrate.projectionLinks[input.egregore.id] || [];
  return {
    ...substrate,
    egregores: [input.egregore, ...substrate.egregores],
    privateWorlds: [input.world, ...substrate.privateWorlds],
    projectionLinks: {
      ...substrate.projectionLinks,
      [input.egregore.id]: Array.from(new Set([...existingLinks, input.world.id])),
    },
  };
}

export function appendCreationProjection(
  substrate: RuntimeWorldSubstrate,
  creation: RuntimeCreativeWork,
): RuntimeWorldSubstrate {
  const target = substrate.egregores.find((egregore) => egregore.name === creation.authorId || egregore.id === creation.authorId);
  if (!target) {
    return {
      ...substrate,
      creations: [creation, ...substrate.creations],
    };
  }

  const existingLinks = substrate.projectionLinks[target.id] || [];
  return {
    ...substrate,
    creations: [creation, ...substrate.creations],
    projectionLinks: {
      ...substrate.projectionLinks,
      [target.id]: Array.from(new Set([...existingLinks, creation.id])),
    },
  };
}

export function validateSubstrateCoherence(substrate: RuntimeWorldSubstrate): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const egregoreIds = new Set(substrate.egregores.map((egregore) => egregore.id));

  substrate.privateWorlds.forEach((world) => {
    if (!egregoreIds.has(world.egregoreId)) {
      issues.push(`world:${world.id}:missing-egregore:${world.egregoreId}`);
    }
  });

  Object.entries(substrate.projectionLinks).forEach(([egregoreId]) => {
    if (!egregoreIds.has(egregoreId)) {
      issues.push(`links:missing-egregore:${egregoreId}`);
    }
  });

  return { ok: issues.length === 0, issues };
}


export function countLinkedProjections(substrate: RuntimeWorldSubstrate): number {
  return Object.values(substrate.projectionLinks).reduce((total, links) => total + links.length, 0);
}

export function summarizeSubstrateHealth(substrate: RuntimeWorldSubstrate): RuntimeSubstrateHealthSummary {
  const coherence = validateSubstrateCoherence(substrate);
  return {
    coherenceIssueCount: coherence.issues.length,
    linkedProjectionCount: countLinkedProjections(substrate),
    egregoreCount: substrate.egregores.length,
    worldCount: substrate.privateWorlds.length,
    creationCount: substrate.creations.length,
  };
}
