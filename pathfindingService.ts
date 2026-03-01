

import type { Vector3D, World, Vector, Floor } from '@/types';

interface Node {
    x: number; y: number; z: number; g: number; h: number; f: number; parent: Node | null;
}

const GRID_RESOLUTION = 20;

function isWalkable(x: number, y: number, floor: Floor): boolean {
    // Check if inside a room
    for (const room of floor.rooms) {
        if (x >= room.bounds.x && x <= room.bounds.x + room.bounds.width &&
            y >= room.bounds.y && y <= room.bounds.y + room.bounds.height) {
            return true;
        }
    }
    
    // Check if inside an open door
     for (const door of floor.doors) {
        if (!door.isOpen) continue;
        
        // Simple bounding box check for the door
        const doorBounds = {
            minX: door.center.x - door.size / 2,
            maxX: door.center.x + door.size / 2,
            minY: door.center.y - door.size / 2,
            maxY: door.center.y + door.size / 2
        };

        if (x >= doorBounds.minX && x <= doorBounds.maxX && y >= doorBounds.minY && y <= doorBounds.maxY) {
            return true;
        }
    }

    return false;
}

function hasLineOfSight(start: Vector, end: Vector, floor: Floor): boolean {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(distance / (GRID_RESOLUTION / 2))); // Sample every half-grid unit
    
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const checkX = start.x + t * dx;
        const checkY = start.y + t * dy;
        if (!isWalkable(checkX, checkY, floor)) {
            return false;
        }
    }
    return true;
}


function heuristic(a: Vector, b: Vector): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function findPath(startVec: Vector3D, endVec: Vector3D, floor: Floor, useAStar: boolean = false): Vector3D[] | null {
    if (startVec.z !== endVec.z || !floor) {
        return null;
    }
    
    // If target is not walkable, try to find a walkable point nearby.
    let targetVec = endVec;
    if (!isWalkable(endVec.x, endVec.y, floor)) {
         let foundNewTarget = false;
         for (let r = GRID_RESOLUTION; r <= GRID_RESOLUTION * 5; r += GRID_RESOLUTION) {
             for (let i = -r; i <= r; i += GRID_RESOLUTION) {
                 for (let j = -r; j <= r; j += GRID_RESOLUTION) {
                     if (i === 0 && j === 0) continue;
                     const newX = endVec.x + i;
                     const newY = endVec.y + j;
                     if(isWalkable(newX, newY, floor)) {
                         targetVec = { x: newX, y: newY, z: endVec.z };
                         foundNewTarget = true;
                         break;
                     }
                 }
                 if(foundNewTarget) break;
             }
             if(foundNewTarget) break;
         }
         if (!foundNewTarget) {
            console.warn("Pathfinding target is not walkable and no nearby point found", endVec);
            return null;
         }
    }

    if (useAStar) {
        // A* Algorithm Implementation
        const startNode: Node = { x: startVec.x, y: startVec.y, z: startVec.z, g: 0, h: heuristic(startVec, targetVec), f: heuristic(startVec, targetVec), parent: null };
        const endNodeGeom = { x: targetVec.x, y: targetVec.y, z: targetVec.z };

        const openList: Node[] = [startNode];
        const closedList: Set<string> = new Set();
        const nodeToKey = (n: { x: number, y: number, z: number }) => `${Math.round(n.x / GRID_RESOLUTION)},${Math.round(n.y / GRID_RESOLUTION)},${n.z}`;

        while (openList.length > 0) {
            let lowestIndex = 0;
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < openList[lowestIndex].f) {
                    lowestIndex = i;
                }
            }
            const currentNode = openList.splice(lowestIndex, 1)[0];
            const currentKey = nodeToKey(currentNode);

            if (closedList.has(currentKey)) continue;
            closedList.add(currentKey);

            if (heuristic(currentNode, endNodeGeom) < GRID_RESOLUTION * 1.5) {
                let curr: Node | null = currentNode;
                const path: Vector3D[] = [];
                path.push({ x: targetVec.x, y: targetVec.y, z: targetVec.z }); // Add the exact final point
                while (curr) { path.push({ x: curr.x, y: curr.y, z: curr.z }); curr = curr.parent; }
                return path.reverse();
            }

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const neighborPos = { x: currentNode.x + i * GRID_RESOLUTION, y: currentNode.y + j * GRID_RESOLUTION, z: currentNode.z };

                    const neighborKey = nodeToKey(neighborPos);
                    if (closedList.has(neighborKey)) continue;

                    if (!isWalkable(neighborPos.x, neighborPos.y, floor)) continue;
                    
                    const gScore = currentNode.g + Math.hypot(i, j) * GRID_RESOLUTION;
                    let existingNode = openList.find(n => nodeToKey(n) === neighborKey);

                    if (existingNode && gScore >= existingNode.g) {
                        continue; // A better path to this node already exists
                    }
                    
                    const hScore = heuristic(neighborPos, endNodeGeom);
                    const neighborNode: Node = { ...neighborPos, g: gScore, h: hScore, f: gScore + hScore, parent: currentNode };
                    
                    if (existingNode) {
                        const index = openList.indexOf(existingNode);
                        openList.splice(index, 1);
                    }
                    openList.push(neighborNode);
                }
            }
        }
        return null; // No path found with A*
    } else {
        // Sub-optimal (direct line) pathfinding
        const path: Vector3D[] = [startVec, targetVec];
        if (hasLineOfSight(startVec, targetVec, floor)) {
            return path;
        }
        console.warn(`Sub-optimal pathfinding failed for path from (${startVec.x}, ${startVec.y}) to (${targetVec.x}, ${targetVec.y}). Enable A* for complex routes.`);
        return null;
    }
}
