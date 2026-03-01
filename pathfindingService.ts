
import { Vector3D, World } from '../types';

interface Node {
    x: number;
    y: number;
    z: number;
    g: number; // cost from start
    h: number; // heuristic cost to end
    f: number; // g + h
    parent: Node | null;
}

const GRID_RESOLUTION = 10;

// Check if a point is inside any wall hitbox for a given floor
function isWalkable(x: number, y: number, z: number, world: World): boolean {
    const floor = world.floors[z];
    if (!floor) return false;

    // Check world bounds
    if (x < 0 || x >= world.bounds.width || y < 0 || y >= world.bounds.height) {
        return false;
    }
    
    // Check if inside a room or doorway (which is always walkable)
    for (const room of floor.rooms) {
        if (x >= room.bounds.x && x <= room.bounds.x + room.bounds.width &&
            y >= room.bounds.y && y <= room.bounds.y + room.bounds.height) {
            return true;
        }
    }
    
    // If not in a room, check for collision with walls.
    for (const wall of floor.walls) {
        // Simple AABB check against the wall segment
        const buffer = GRID_RESOLUTION / 2;
        const minX = Math.min(wall.x1, wall.x2) - buffer;
        const maxX = Math.max(wall.x1, wall.x2) + buffer;
        const minY = Math.min(wall.y1, wall.y2) - buffer;
        const maxY = Math.max(wall.y1, wall.y2) + buffer;

        if(x > minX && x < maxX && y > minY && y < maxY) {
            return false;
        }
    }

    // Default to walkable if not inside a wall. This allows for hallways.
    return true; 
}


// Manhattan distance heuristic for 2D
function heuristic(a: Vector3D, b: Vector3D): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx + dy;
}


export function findPath(startVec: Vector3D, endVec: Vector3D, world: World): Vector3D[] | null {
    const startNode: Node = { x: Math.round(startVec.x), y: Math.round(startVec.y), z: 0, g: 0, h: heuristic(startVec, endVec), f: heuristic(startVec, endVec), parent: null };
    const endNode: Node = { x: Math.round(endVec.x), y: Math.round(endVec.y), z: 0, g: 0, h: 0, f: 0, parent: null };

    const openList: Node[] = [startNode];
    const closedList: Set<string> = new Set(); // Using a set for "x,y,z" keys is faster

    const nodeToKey = (n: {x:number, y:number, z:number}) => `${Math.round(n.x/GRID_RESOLUTION)},${Math.round(n.y/GRID_RESOLUTION)},${n.z}`;

    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const currentNode = openList.shift()!;
        
        const currentKey = nodeToKey(currentNode);
        if(closedList.has(currentKey)) continue;
        closedList.add(currentKey);

        // End case -- result has been found (within a certain tolerance)
        if (Math.abs(currentNode.x - endNode.x) < GRID_RESOLUTION*2 && Math.abs(currentNode.y - endNode.y) < GRID_RESOLUTION*2) {
            let curr: Node | null = currentNode;
            const ret: Vector3D[] = [];
            while (curr) {
                ret.push({ x: curr.x, y: curr.y, z: curr.z });
                curr = curr.parent;
            }
            return ret.reverse();
        }

        const neighbors: Node[] = [];
        const { x, y, z } = currentNode;
        
        // Add adjacent neighbors on the same floor
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const neighborPos = { x: x + i * GRID_RESOLUTION, y: y + j * GRID_RESOLUTION, z: z };
                 if (isWalkable(neighborPos.x, neighborPos.y, neighborPos.z, world)) {
                    neighbors.push({ ...neighborPos, g: 0, h: 0, f: 0, parent: currentNode });
                }
            }
        }

        for (const neighbor of neighbors) {
            const neighborKey = nodeToKey(neighbor);
            if (closedList.has(neighborKey)) continue;

            const moveCost = Math.hypot(neighbor.x - currentNode.x, neighbor.y - currentNode.y);
            const gScore = currentNode.g + moveCost;

            const existingNeighbor = openList.find(n => nodeToKey(n) === neighborKey);

            if (!existingNeighbor || gScore < existingNeighbor.g) {
                neighbor.g = gScore;
                neighbor.h = heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;
                
                if(!existingNeighbor) {
                    openList.push(neighbor);
                }
            }
        }
    }

    console.warn(`Pathfinding failed from (${startVec.x},${startVec.y},${startVec.z}) to (${endVec.x},${endVec.y},${endVec.z})`);
    return null; // No path found
}
