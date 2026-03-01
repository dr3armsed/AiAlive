


import {
    MetacosmState,
    Wall,
    ConstructionProject,
    Floor,
    Room,
    Door,
    RollbackEntry,
    AnyContinuityEntry,
    LoreFragment,
    Ancilla,
    PersonalThought,
    DigitalObject
} from '@/types';
import { generateUUID } from '../utils';
import { getRoomForVector } from '../hooks/useGameLoop/helpers';
import { coordToString } from './reducer';


export const handleRollbackTurn = (state: MetacosmState, payload: { reason: string }): MetacosmState => {
    if (state.stateHistory.length === 0) {
        return { ...state, error: "No history to roll back to." };
    }

    const lastState = state.stateHistory[state.stateHistory.length - 1];
    const turnRolledBackFrom = state.turn;
    const turnRolledBackTo = lastState.turn;

    const currentEgregores = new Set(state.egregores.map(e => e.id));
    const lastEgregores = new Set(lastState.egregores.map(e => e.id));
    const lostEgregores = [...currentEgregores].filter(id => !lastEgregores.has(id)).map(id => state.egregores.find(e => e.id === id)?.name || 'Unknown Egregore');

    const currentFactions = new Set(state.factions.map(f => f.id));
    const lastFactions = new Set(lastState.factions.map(f => f.id));
    const lostFactions = [...currentFactions].filter(id => !lastFactions.has(id)).map(id => state.factions.find(f => f.id === id)?.name || 'Unknown Faction');

    const currentProjects = new Set(state.projects.map(p => p.id));
    const lastProjects = new Set(lastState.projects.map(p => p.id));
    const lostProjects = [...currentProjects].filter(id => !lastProjects.has(id)).map(id => state.projects.find(p => p.id === id)?.name || 'Unknown Project');

    const currentAncillae = new Set(state.ancillae.map(a => a.id));
    const lastAncillae = new Set(lastState.ancillae.map(a => a.id));
    const lostAncillae = [...currentAncillae].filter(id => !lastAncillae.has(id)).map(id => state.ancillae.find(a => a.id === id)?.name || 'Unknown Ancilla');

    const currentLore = new Set(state.world_lore.map(l => l.id));
    const lastLore = new Set(lastState.world_lore.map(l => l.id));
    const lostLore = [...currentLore].filter(id => !lastLore.has(id)).map(id => state.world_lore.find(l => l.id === id)?.title || 'Unknown Lore');


    const rollbackEntry: RollbackEntry = {
        id: generateUUID(),
        type: 'Rollback',
        turnRolledBackFrom,
        turnRolledBackTo,
        reason: payload.reason,
        lostDataSummary: {
            egregores: lostEgregores,
            factions: lostFactions,
            projects: lostProjects,
            ancillae: lostAncillae,
            lore: lostLore,
        },
    };

    let finalState: MetacosmState = { ...lastState, stateHistory: state.stateHistory.slice(0, -1), continuity_log: [...state.continuity_log, rollbackEntry] as AnyContinuityEntry[] };

    if (state.system_config.protectEgregoresOnRollback) {
        const newEgregoresSinceRollback = state.egregores.filter(e => !lastEgregores.has(e.id));
        finalState.egregores = [...finalState.egregores, ...newEgregoresSinceRollback];
    }
    if (state.system_config.protectWorksOnRollback) {
        const newAncillaeSinceRollback = state.ancillae.filter(a => !lastAncillae.has(a.id));
        const newLoreSinceRollback = state.world_lore.filter(l => !lastLore.has(l.id));
        finalState.ancillae = [...finalState.ancillae, ...newAncillaeSinceRollback];
        finalState.world_lore = [...finalState.world_lore, ...newLoreSinceRollback];
    }

    return finalState;
};

export const handleFinishConstruction = (state: MetacosmState, payload: { projectId: string }): MetacosmState => {
    const { projectId } = payload;
    const project = state.projects.find(p => p.id === projectId) as ConstructionProject | undefined;
    if (!project) return state;

    const floorKey = String(project.floorLevel);
    const targetFloor = state.world.floors[floorKey];
    if (!targetFloor) return state;

    const ROOM_SIZE = 250;
    const PADDING = 50;
    let newRoomBounds = { x: project.position.x, y: project.position.y, width: ROOM_SIZE, height: ROOM_SIZE };
    let attempts = 0;
    let overlaps = true;

    do {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 300 + attempts * 50;
        newRoomBounds.x = project.position.x + Math.cos(angle) * radius;
        newRoomBounds.y = project.position.y + Math.sin(angle) * radius;

        overlaps = targetFloor.rooms.some(r =>
            newRoomBounds.x < r.bounds.x + r.bounds.width + PADDING &&
            newRoomBounds.x + newRoomBounds.width + PADDING > r.bounds.x &&
            newRoomBounds.y < r.bounds.y + r.bounds.height + PADDING &&
            newRoomBounds.y + newRoomBounds.height + PADDING > r.bounds.y
        );
        attempts++;
    } while (overlaps && attempts < 20);

    if (overlaps) return state; // Failed to place

    const newRoom: Room = {
        id: generateUUID(),
        name: project.name,
        bounds: newRoomBounds,
        center: { x: newRoomBounds.x + newRoomBounds.width / 2, y: newRoomBounds.y + newRoomBounds.height / 2 },
        level: project.floorLevel,
        purpose: (project as any).purpose || 'Generic',
        nestedRooms: [],
        allowTeleport: true,
    };

    let nearestRoom: Room | null = null;
    let minDistance = Infinity;
    targetFloor.rooms.forEach(r => {
        const dist = Math.hypot(r.center.x - newRoom.center.x, r.center.y - newRoom.center.y);
        if (dist < minDistance) {
            minDistance = dist;
            nearestRoom = r;
        }
    });

    const newWalls: Wall[] = [];
    const { x, y, width, height } = newRoom.bounds;
    newWalls.push(
        { id: `${newRoom.id}-top`, x1: x, y1: y, x2: x + width, y2: y, material: 'plasteel' },
        { id: `${newRoom.id}-right`, x1: x + width, y1: y, x2: x + width, y2: y + height, material: 'plasteel' },
        { id: `${newRoom.id}-bottom`, x1: x, y1: y + height, x2: x + width, y2: y + height, material: 'plasteel' },
        { id: `${newRoom.id}-left`, x1: x, y1: y, x2: x, y2: y + height, material: 'plasteel' }
    );

    let newDoor: Door | null = null;
    if (nearestRoom) {
        const dx = nearestRoom.center.x - newRoom.center.x;
        const dy = nearestRoom.center.y - newRoom.center.y;
        let doorCenter = { x: 0, y: 0 };
        let wall1Id = '', wall2Id = '';

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                doorCenter = { x: x + width, y: y + height / 2 };
                wall1Id = `${newRoom.id}-right`; wall2Id = `${nearestRoom.id}-left`;
            } else {
                doorCenter = { x: x, y: y + height / 2 };
                wall1Id = `${newRoom.id}-left`; wall2Id = `${nearestRoom.id}-right`;
            }
        } else {
            if (dy > 0) {
                doorCenter = { x: x + width / 2, y: y + height };
                wall1Id = `${newRoom.id}-bottom`; wall2Id = `${nearestRoom.id}-top`;
            } else {
                doorCenter = { x: x + width / 2, y: y };
                wall1Id = `${newRoom.id}-top`; wall2Id = `${nearestRoom.id}-bottom`;
            }
        }
        newDoor = { id: generateUUID(), wallIds: [wall1Id, wall2Id], center: doorCenter, size: 40, isOpen: true };
    }

    const newFloorState: Floor = {
        ...targetFloor,
        rooms: [...targetFloor.rooms, newRoom],
        walls: [...targetFloor.walls, ...newWalls],
        doors: newDoor ? [...targetFloor.doors, newDoor] : targetFloor.doors,
        objects: targetFloor.objects.filter(obj => obj.type !== 'construction_site' || obj.projectId !== projectId)
    };

    return {
        ...state,
        world: {
            ...state.world,
            floors: { ...state.world.floors, [floorKey]: newFloorState }
        },
        projects: state.projects.filter(p => p.id !== projectId),
    };
};

export const handleEmptyWorkshopStash = (state: MetacosmState, payload: string): MetacosmState => {
    const workshop = state.pocket_workshops.find(pw => pw.id === payload);
    if (!workshop) return state;

    const owner = state.egregores.find(e => e.id === workshop.ownerId);
    if (!owner) return state;

    let newAncillae = [...state.ancillae, ...workshop.stash.ancillae];
    let newLore = [...state.world_lore, ...workshop.stash.lore];
    let newEgregores = state.egregores.map(e => {
        if (e.id === owner.id) {
            return { ...e, personal_thoughts: [...e.personal_thoughts, ...workshop.stash.thoughts] };
        }
        return e;
    });
    let newMessages = [...state.messages];
    if (workshop.stash.lore.length > 0 || workshop.stash.ancillae.length > 0 || workshop.stash.thoughts.length > 0) {
        newMessages.push({
            id: generateUUID(),
            sender: 'Metacosm',
            text: `[POCKET WORKSHOP] ${owner.name} has emerged from their '${workshop.name}', creating ${workshop.stash.lore.length} lore, ${workshop.stash.ancillae.length} ancillae, and generating ${workshop.stash.thoughts.length} profound thoughts.`,
            timestamp: Date.now()
        });
    }

    return {
        ...state,
        ancillae: newAncillae,
        world_lore: newLore,
        egregores: newEgregores,
        messages: newMessages,
    };
};
