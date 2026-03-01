
import type { Vector3D, Room, Floor } from '../../types';

export const getRoomForVector = (vector: Vector3D, floor: Floor | undefined): Room | undefined => {
    if (!floor) return undefined;
    return floor.rooms.find(room =>
        vector.x >= room.bounds.x && vector.x <= room.bounds.x + room.bounds.width &&
        vector.y >= room.bounds.y && vector.y <= room.bounds.y + room.bounds.height
    );
};

export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
