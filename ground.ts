
import type { World, Room, Wall, Bounds, Floor, Door, WorldObject, RoomPurpose, PrivateChatId } from '@/types';
import { WORLD_SIZE } from '../../constants';

const DOOR_SIZE = 40;
const HALL_WIDTH = 60;
const MIN_ROOM_SIZE = 200;
const MAX_ROOM_SIZE = 400;
const ROOM_COUNT = 20; 
const ROOM_PLACEMENT_PADDING = 120;

function checkOverlap(roomA: Room, roomB: Room, padding: number): boolean {
    return (
        roomA.bounds.x < roomB.bounds.x + roomB.bounds.width + padding &&
        roomA.bounds.x + roomA.bounds.width + padding > roomB.bounds.x &&
        roomA.bounds.y < roomB.bounds.y + roomB.bounds.height + padding &&
        roomA.bounds.y + roomA.bounds.height + padding > roomB.bounds.y
    );
}

const ROOM_NAMES = [
    'Fading Archive', 'Glass Orrey', 'Whispering Gallery', 'Heartforge', 'The Penumbral Lobby', 
    'Chamber of Echoes', 'The Weeping Library', 'The Silent Forum', 'The Crimson Scriptorium',
    'The Azure Athenaeum', 'The Verdant Conservatory', 'The Obsidian Nexus', 'The Gilded Menagerie',
    'The Somber Reliquary', 'The Ethereal Orrery', 'The Sunken Cathedral', 'The Lunar Sanctum',
    'The Star-Chart Chamber', 'The Resonant Hall', 'The Timeless Vault', 'The Forgotten Workshop',
    'Chamber of Silence', 'The Resonant Antechamber', 'The Foundry of Wills', 'The Archive of Whispers', 'The Stasis Chamber'
];

// Generates 4 nested rooms inside a parent room
const generateNestedRooms = (parentRoom: Room): Room[] => {
    const subRooms: Room[] = [];
    const { width, height } = parentRoom.bounds;
    const subWidth = width / 2 - 10;
    const subHeight = height / 2 - 10;
    const positions = [
        { x: parentRoom.bounds.x + 5, y: parentRoom.bounds.y + 5, name: "Antechamber" },
        { x: parentRoom.bounds.x + width / 2 + 5, y: parentRoom.bounds.y + 5, name: "Study" },
        { x: parentRoom.bounds.x + 5, y: parentRoom.bounds.y + height / 2 + 5, name: "Refuge" },
        { x: parentRoom.bounds.x + width / 2 + 5, y: parentRoom.bounds.y + height / 2 + 5, name: "Core" }
    ];
    for (let i = 0; i < 4; i++) {
        const bounds = { x: positions[i].x, y: positions[i].y, width: subWidth, height: subHeight };
        subRooms.push({
            id: `${parentRoom.id}-sub-${i}`,
            name: `${parentRoom.name} ${positions[i].name}`,
            bounds: bounds,
            center: { x: bounds.x + bounds.width/2, y: bounds.y + bounds.height/2 },
            level: parentRoom.level,
            nestedRooms: [], // Sub-rooms don't have further nests
            allowTeleport: true,
        });
    }
    return subRooms;
};


export const generateGroundFloor = (level: number): { floor: Floor, privateChats: { id: PrivateChatId, name: string }[] } => {
    let roomNameCounter = 0;
    // Note: This function will start repeating names if ROOM_COUNT > ROOM_NAMES.length.
    // For the current constants, this is not an issue.
    const getUniqueRoomName = () => ROOM_NAMES[roomNameCounter++ % ROOM_NAMES.length];
    
    const rooms: Room[] = [];
    let walls: Wall[] = [];
    const doors: Door[] = [];
    const objects: WorldObject[] = [];
    const newPrivateChats: { id: PrivateChatId, name: string }[] = [];

    const roomPurposes: RoomPurpose[] = ['Sanctuary', 'Scriptorium', 'Forge', 'CombatArena', 'Necropolis', 'Observatory', 'CouncilChamber', 'Vault'];
    let purposeIndex = 0;

    // Create Triadic Core first, at the center
    const coreRoomSize = 350;
    const coreRoom: Room = {
        id: 'room-core', name: 'Triadic Core',
        bounds: { x: (WORLD_SIZE.width - coreRoomSize) / 2, y: (WORLD_SIZE.height - coreRoomSize) / 2, width: coreRoomSize, height: coreRoomSize },
        center: { x: WORLD_SIZE.width / 2, y: WORLD_SIZE.height / 2 },
        level: level, purpose: 'TriadicCore', nestedRooms: [], allowTeleport: false,
    };
    rooms.push(coreRoom);

    // Create other main rooms
    for (let i = 0; i < ROOM_COUNT - 1; i++) {
        let room: Room;
        let overlaps;
        let attempts = 0;

        do {
            const width = MIN_ROOM_SIZE + Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE);
            const height = MIN_ROOM_SIZE + Math.random() * (MAX_ROOM_SIZE - MIN_ROOM_SIZE);
            const x = Math.random() * (WORLD_SIZE.width - width);
            const y = Math.random() * (WORLD_SIZE.height - height);
            
            const bounds: Bounds = { x, y, width, height };
            const purpose = purposeIndex < roomPurposes.length ? roomPurposes[purposeIndex++] : undefined;
            const roomId = `room-${i}`;
            const internalChatId: PrivateChatId = `private-chat-room-${roomId}`;

            room = {
                id: roomId, name: purpose || getUniqueRoomName(), bounds,
                center: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
                level: level, purpose: purpose, nestedRooms: [], allowTeleport: true, internalChatId,
            };

            overlaps = rooms.some(existingRoom => checkOverlap(room, existingRoom, ROOM_PLACEMENT_PADDING));
            attempts++;
        } while (overlaps && attempts < 200);

        if (!overlaps) {
            room.nestedRooms = generateNestedRooms(room);
            rooms.push(room);
            newPrivateChats.push({ id: room.internalChatId!, name: `Internal Chat: ${room.name}` });
        }
    }
    
    const mainRoomsForMST = [...rooms];

    // Prim's Algorithm for Minimum Spanning Tree to connect all rooms
    if (mainRoomsForMST.length > 1) {
        const mstEdges: { from: Room; to: Room }[] = [];
        const visited = new Set<string>([mainRoomsForMST[0].id]);
        const edges: { from: Room; to: Room; dist: number }[] = [];

        mainRoomsForMST.forEach(room => {
            if (room.id !== mainRoomsForMST[0].id) {
                const dist = Math.hypot(mainRoomsForMST[0].center.x - room.center.x, mainRoomsForMST[0].center.y - room.center.y);
                edges.push({ from: mainRoomsForMST[0], to: room, dist });
            }
        });

        while (visited.size < mainRoomsForMST.length && edges.length > 0) {
            edges.sort((a, b) => a.dist - b.dist);
            const edge = edges.shift();
            if (!edge || visited.has(edge.to.id)) continue;
            
            const newRoom = edge.to;
            visited.add(newRoom.id);
            mstEdges.push({ from: edge.from, to: newRoom });

            mainRoomsForMST.forEach(room => {
                if (!visited.has(room.id)) {
                    const dist = Math.hypot(newRoom.center.x - room.center.x, newRoom.center.y - room.center.y);
                    edges.push({ from: newRoom, to: room, dist });
                }
            });
        }
        
        // Create hallways and doors from MST edges
        mstEdges.forEach(edge => {
            const { from: roomA, to: roomB } = edge;

            const getDoorPlacement = (r1: Room, r2_center: { x: number; y: number }) => {
                const dx = r2_center.x - r1.center.x;
                const dy = r2_center.y - r1.center.y;
                let center = { x: 0, y: 0 };
                let wallId = '';

                if (Math.abs(dx) > Math.abs(dy)) { // Horizontal connection
                    if (dx > 0) {
                        wallId = `${r1.id}-right`;
                        center = { x: r1.bounds.x + r1.bounds.width, y: r1.center.y };
                    } else {
                        wallId = `${r1.id}-left`;
                        center = { x: r1.bounds.x, y: r1.center.y };
                    }
                } else { // Vertical connection
                    if (dy > 0) {
                        wallId = `${r1.id}-bottom`;
                        center = { x: r1.center.x, y: r1.bounds.y + r1.bounds.height };
                    } else {
                        wallId = `${r1.id}-top`;
                        center = { x: r1.center.x, y: r1.bounds.y };
                    }
                }
                
                // Clamp door position to be within the room's bounds (not on a corner)
                center.y = Math.max(r1.bounds.y + DOOR_SIZE, Math.min(r1.bounds.y + r1.bounds.height - DOOR_SIZE, center.y));
                center.x = Math.max(r1.bounds.x + DOOR_SIZE, Math.min(r1.bounds.x + r1.bounds.width - DOOR_SIZE, center.x));

                return { center, wallId };
            };

            const doorAData = getDoorPlacement(roomA, roomB.center);
            const doorBData = getDoorPlacement(roomB, roomA.center);

            // Create hallway "rooms" for pathfinding
            const hallBounds: Bounds = {
                x: Math.min(doorAData.center.x, doorBData.center.x) - HALL_WIDTH / 2,
                y: Math.min(doorAData.center.y, doorBData.center.y) - HALL_WIDTH / 2,
                width: Math.abs(doorAData.center.x - doorBData.center.x) + HALL_WIDTH,
                height: Math.abs(doorAData.center.y - doorBData.center.y) + HALL_WIDTH
            };
            rooms.push({
                id: `hall-${roomA.id}-${roomB.id}`, name: 'Hallway', bounds: hallBounds,
                center: { x: hallBounds.x + hallBounds.width / 2, y: hallBounds.y + hallBounds.height / 2 },
                level: level, nestedRooms: [], allowTeleport: false
            });

            // Add doors
            doors.push({ id: `door-${roomA.id}-hall`, wallIds: [doorAData.wallId, `hall-side-${doorAData.wallId}`], center: doorAData.center, size: DOOR_SIZE, isOpen: true });
            doors.push({ id: `door-${roomB.id}-hall`, wallIds: [doorBData.wallId, `hall-side-${doorBData.wallId}`], center: doorBData.center, size: DOOR_SIZE, isOpen: true });
        });
    }

    // Create Walls for all main rooms
    rooms.forEach(room => {
        if(room.purpose) { // Only draw walls for the main rooms, not hallways
            const { x, y, width, height } = room.bounds;
            walls.push(
                { id: `${room.id}-top`, x1: x, y1: y, x2: x + width, y2: y, material: 'plasteel' },
                { id: `${room.id}-right`, x1: x + width, y1: y, x2: x + width, y2: y + height, material: 'plasteel' },
                { id: `${room.id}-bottom`, x1: x, y1: y + height, x2: x + width, y2: y + height, material: 'plasteel' },
                { id: `${room.id}-left`, x1: x, y1: y, x2: x, y2: y + height, material: 'plasteel' }
            );
        }
    });

    const floor: Floor = { level, rooms, walls, doors, objects, width: WORLD_SIZE.width, height: WORLD_SIZE.height };
    return { floor, privateChats: newPrivateChats };
};


export const generateSingleRoomFloor = (name: string, purpose: RoomPurpose, level: number): Floor => {
    const roomSize = 2000;
    const room: Room = {
        id: `room-single-${level}`,
        name: name,
        bounds: { x: (WORLD_SIZE.width - roomSize) / 2, y: (WORLD_SIZE.height - roomSize) / 2, width: roomSize, height: roomSize },
        center: { x: WORLD_SIZE.width / 2, y: WORLD_SIZE.height / 2 },
        level,
        purpose,
        nestedRooms: [],
        allowTeleport: true,
    };

    return {
        level,
        rooms: [room],
        walls: [
            { id: `${room.id}-top`, x1: room.bounds.x, y1: room.bounds.y, x2: room.bounds.x + room.bounds.width, y2: room.bounds.y, material: 'obsidian' },
            { id: `${room.id}-right`, x1: room.bounds.x + room.bounds.width, y1: room.bounds.y, x2: room.bounds.x + room.bounds.width, y2: room.bounds.y + room.bounds.height, material: 'obsidian' },
            { id: `${room.id}-bottom`, x1: room.bounds.x, y1: room.bounds.y + room.bounds.height, x2: room.bounds.x + room.bounds.width, y2: room.bounds.y + room.bounds.height, material: 'obsidian' },
            { id: `${room.id}-left`, x1: room.bounds.x, y1: room.bounds.y, x2: room.bounds.x, y2: room.bounds.y + room.bounds.height, material: 'obsidian' }
        ],
        doors: [],
        objects: [],
        width: WORLD_SIZE.width,
        height: WORLD_SIZE.height
    };
};
