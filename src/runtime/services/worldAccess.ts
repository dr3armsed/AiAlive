import { RuntimeEgregore, RuntimePrivateWorld } from '../types';

export type RuntimeWorldMode = 'shared-world' | 'private-world';

export type RuntimeWorldPresence = Record<string, RuntimeWorldMode>;

export interface RuntimeWorldTransitionResult {
  ok: boolean;
  worldPresence: RuntimeWorldPresence;
  reason?: 'egregore-not-found' | 'private-world-missing';
}

export function initializeWorldPresence(egregores: RuntimeEgregore[]): RuntimeWorldPresence {
  return egregores.reduce<RuntimeWorldPresence>((acc, egregore) => {
    acc[egregore.id] = 'shared-world';
    return acc;
  }, {});
}

export function resolveWorldTransition(
  worldPresence: RuntimeWorldPresence,
  egregores: RuntimeEgregore[],
  privateWorlds: RuntimePrivateWorld[],
  egregoreId: string,
  targetMode: RuntimeWorldMode,
): RuntimeWorldTransitionResult {
  if (!egregores.some((egregore) => egregore.id === egregoreId)) {
    return { ok: false, worldPresence, reason: 'egregore-not-found' };
  }

  if (targetMode === 'private-world') {
    const ownsPrivateWorld = privateWorlds.some((world) => world.egregoreId === egregoreId);
    if (!ownsPrivateWorld) {
      return { ok: false, worldPresence, reason: 'private-world-missing' };
    }
  }

  return {
    ok: true,
    worldPresence: {
      ...worldPresence,
      [egregoreId]: targetMode,
    },
  };
}

export function countPrivateWorldResidents(worldPresence: RuntimeWorldPresence): number {
  return Object.values(worldPresence).filter((mode) => mode === 'private-world').length;
}
