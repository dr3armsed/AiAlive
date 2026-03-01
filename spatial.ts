
import { MetacosmState, Egregore, Room, Vector } from '../../types';

export function getCurrentRoom(state: MetacosmState, agent: Egregore): Room | undefined {
    const { x, y } = agent.vector;
    return state.world.floors[0].rooms.find(room =>
        x >= room.bounds.x && x < room.bounds.x + room.bounds.width &&
        y >= room.bounds.y && y < room.bounds.y + room.bounds.height
    );
}

export function getVisibleEgregores(state: MetacosmState, agent: Egregore): Egregore[] {
    const currentRoom = getCurrentRoom(state, agent);
    if (!currentRoom) return [];
    // Updated genmetas to egregores
    return state.egregores.filter(e => e.id !== agent.id && getCurrentRoom(state, e)?.id === currentRoom.id);
}

export function findRoomByName(state: MetacosmState, name: string): Room | undefined {
    const search = (rooms: Room[]): Room | undefined => {
        for (const room of rooms) {
            if (room.name.toLowerCase() === name.toLowerCase()) return room;
            if (room.subdivisions) {
                const found = search(room.subdivisions);
                if (found) return found;
            }
        }
        return undefined;
    };
    return search(state.world.floors[0].rooms);
}

export function getRoomCoordinates(room: Room): Vector {
    return { x: room.center.x, y: room.center.y, z: 0 };
}
