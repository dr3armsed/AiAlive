import { RuntimePrivateWorld } from '../types';

export interface WorldRoomNode {
  id: string;
  label: string;
  gridX: number;
  gridY: number;
  isoX: number;
  isoY: number;
}

const TILE_WIDTH = 68;
const TILE_HEIGHT = 34;

function projectIsometric(gridX: number, gridY: number) {
  return {
    isoX: (gridX - gridY) * (TILE_WIDTH / 2),
    isoY: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

export function buildIsometricRoomLayout(world: RuntimePrivateWorld): WorldRoomNode[] {
  const roomCount = Math.max(1, world.roomCount);
  const columns = Math.max(1, Math.ceil(Math.sqrt(roomCount)));

  return Array.from({ length: roomCount }, (_, index) => {
    const gridX = index % columns;
    const gridY = Math.floor(index / columns);
    const projected = projectIsometric(gridX, gridY);
    return {
      id: `${world.id}_room_${index + 1}`,
      label: `Room ${index + 1}`,
      gridX,
      gridY,
      isoX: projected.isoX,
      isoY: projected.isoY,
    };
  });
}

export function getIsometricViewport(nodes: WorldRoomNode[]) {
  if (nodes.length === 0) {
    return { minX: -120, minY: -90, width: 240, height: 180 };
  }

  const minX = Math.min(...nodes.map((node) => node.isoX)) - TILE_WIDTH;
  const maxX = Math.max(...nodes.map((node) => node.isoX)) + TILE_WIDTH;
  const minY = Math.min(...nodes.map((node) => node.isoY)) - TILE_HEIGHT;
  const maxY = Math.max(...nodes.map((node) => node.isoY)) + TILE_HEIGHT;

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
