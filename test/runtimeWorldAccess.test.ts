import assert from 'assert';
import { RuntimeEgregore, RuntimePrivateWorld } from '../src/runtime/types';
import {
  countPrivateWorldResidents,
  initializeWorldPresence,
  resolveWorldTransition,
} from '../src/runtime/services/worldAccess';

function seedEgregore(id: string, name: string): RuntimeEgregore {
  return {
    id,
    name,
    persona: `${name} persona`,
    sourceMaterial: `${name} source`,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function seedWorld(id: string, egregoreId: string): RuntimePrivateWorld {
  return {
    id,
    egregoreId,
    roomCount: 4,
    dominantTheme: 'Mythic',
    summary: 'A coherent projection world.',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function testInitializeWorldPresenceDefaultsToSharedWorld() {
  const egregores = [seedEgregore('eg-unknown', 'Unknown')];
  const presence = initializeWorldPresence(egregores);
  assert.strictEqual(presence['eg-unknown'], 'shared-world');
}

function testTransitionToPrivateWorldRequiresOwnedWorld() {
  const egregores = [seedEgregore('eg-unknown', 'Unknown')];
  const presence = initializeWorldPresence(egregores);

  const blocked = resolveWorldTransition(presence, egregores, [], 'eg-unknown', 'private-world');
  assert.strictEqual(blocked.ok, false);
  assert.strictEqual(blocked.reason, 'private-world-missing');

  const allowed = resolveWorldTransition(
    presence,
    egregores,
    [seedWorld('world-unknown', 'eg-unknown')],
    'eg-unknown',
    'private-world',
  );
  assert.strictEqual(allowed.ok, true);
  assert.strictEqual(allowed.worldPresence['eg-unknown'], 'private-world');
}

function testResidentCountTracksPrivateWorldOccupancy() {
  const egregores = [seedEgregore('eg-unknown', 'Unknown'), seedEgregore('eg-twin', 'Architect_Twin')];
  const presence = initializeWorldPresence(egregores);
  const transitioned = resolveWorldTransition(
    presence,
    egregores,
    [seedWorld('world-unknown', 'eg-unknown'), seedWorld('world-twin', 'eg-twin')],
    'eg-twin',
    'private-world',
  );
  assert.strictEqual(transitioned.ok, true);
  assert.strictEqual(countPrivateWorldResidents(transitioned.worldPresence), 1);
}

function main() {
  testInitializeWorldPresenceDefaultsToSharedWorld();
  testTransitionToPrivateWorldRequiresOwnedWorld();
  testResidentCountTracksPrivateWorldOccupancy();
  console.log('Runtime world access tests passed.');
}

main();
