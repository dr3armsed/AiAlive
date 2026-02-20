import assert from 'assert';
import {
  appendCreationProjection,
  appendGenesisProjection,
  countLinkedProjections,
  createWorldSubstrate,
  summarizeSubstrateHealth,
  validateSubstrateCoherence,
} from '../src/runtime/services/worldSubstrate';
import { RuntimeCreativeWork, RuntimeEgregore, RuntimePrivateWorld } from '../src/runtime/types';

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

function seedCreation(id: string, authorId: string): RuntimeCreativeWork {
  return {
    id,
    title: 'Creation',
    type: 'Manifesto',
    content: 'Foundational weave artifact',
    authorId,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function testSubstrateBuildsProjectionLinks() {
  const unknown = seedEgregore('eg-unknown', 'Unknown');
  const world = seedWorld('world-unknown', 'eg-unknown');

  const substrate = createWorldSubstrate([unknown], [world]);

  assert.strictEqual(substrate.egregores.length, 1);
  assert.strictEqual(substrate.privateWorlds.length, 1);
  assert.ok(substrate.projectionLinks['eg-unknown'].includes('world-unknown'));
  assert.ok(validateSubstrateCoherence(substrate).ok);
  assert.strictEqual(countLinkedProjections(substrate), 1);
  const health = summarizeSubstrateHealth(substrate);
  assert.strictEqual(health.coherenceIssueCount, 0);
  assert.strictEqual(health.egregoreCount, 1);
  assert.strictEqual(health.worldCount, 1);
}

function testSubstrateRecomposesAfterGenesisAndCreation() {
  const unknown = seedEgregore('eg-unknown', 'Unknown');
  const world = seedWorld('world-unknown', 'eg-unknown');
  const base = createWorldSubstrate([unknown], [world]);

  const twin = seedEgregore('eg-twin', 'Architect_Twin');
  const twinWorld = seedWorld('world-twin', 'eg-twin');
  const withTwin = appendGenesisProjection(base, { egregore: twin, world: twinWorld });

  const creation = seedCreation('creation-1', 'Architect_Twin');
  const recomposed = appendCreationProjection(withTwin, creation);

  assert.strictEqual(recomposed.egregores[0].id, 'eg-twin');
  assert.strictEqual(recomposed.privateWorlds[0].id, 'world-twin');
  assert.strictEqual(recomposed.creations[0].id, 'creation-1');
  assert.ok(recomposed.projectionLinks['eg-twin'].includes('world-twin'));
  assert.ok(recomposed.projectionLinks['eg-twin'].includes('creation-1'));
  assert.ok(validateSubstrateCoherence(recomposed).ok);
  assert.strictEqual(countLinkedProjections(recomposed), 3);
  const health = summarizeSubstrateHealth(recomposed);
  assert.strictEqual(health.creationCount, 1);
  assert.strictEqual(health.linkedProjectionCount, 3);
}

function testSubstrateFlagsOrphanedWorlds() {
  const orphanWorld = seedWorld('world-orphan', 'eg-missing');
  const substrate = createWorldSubstrate([], [orphanWorld]);
  const status = validateSubstrateCoherence(substrate);

  assert.strictEqual(status.ok, false);
  assert.ok(status.issues.some((issue) => issue.includes('missing-egregore')));
}

function main() {
  testSubstrateBuildsProjectionLinks();
  testSubstrateRecomposesAfterGenesisAndCreation();
  testSubstrateFlagsOrphanedWorlds();
  console.log('Runtime world substrate tests passed.');
}

main();
