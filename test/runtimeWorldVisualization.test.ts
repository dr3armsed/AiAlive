import assert from 'assert';
import { RuntimePrivateWorld } from '../src/runtime/types';
import { buildIsometricRoomLayout, getIsometricViewport } from '../src/runtime/services/worldVisualization';

function seedWorld(roomCount: number): RuntimePrivateWorld {
  return {
    id: 'world-visual',
    egregoreId: 'eg-unknown',
    roomCount,
    dominantTheme: 'Mythic',
    summary: 'visual test world',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function testBuildsRoomNodesForAllRooms() {
  const nodes = buildIsometricRoomLayout(seedWorld(7));
  assert.strictEqual(nodes.length, 7);
  assert.ok(nodes.every((node) => node.id.startsWith('world-visual_room_')));
}

function testViewportIsNonZero() {
  const nodes = buildIsometricRoomLayout(seedWorld(9));
  const viewport = getIsometricViewport(nodes);
  assert.ok(viewport.width > 0);
  assert.ok(viewport.height > 0);
}

function main() {
  testBuildsRoomNodesForAllRooms();
  testViewportIsNonZero();
  console.log('Runtime world visualization tests passed.');
}

main();
