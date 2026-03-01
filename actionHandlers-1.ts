
import { Dispatch } from 'react';
import type {
    Action, Egregore, ConversationResponse, CreativeWork, LoreFragment, Ancilla, AnyProject, PlayProject,
    Stairwell, Floor, Room, Vector3D, ChatMessage, Directive, PersonalThought, ProjectStatus, Door,
    PrivateChat, Paradigm, SystemModificationProposal, ConstructionProject, DigitalObject, ProposedAction, ForumThread,
    ForumPost, Faction, FactionId, XenoArtifact, Paradox, Author, PocketWorkshop, ConstructionSite
} from '@/types';
import type { MetacosmState } from '@/types/state';
import { findPath } from '../../services/pathfindingService';
import { generateHistoricalContext, generateXenoArtifact } from '../../services/geminiService';
import { generatePixelArtFromDescription } from '../../services/pixelArtService';
import { getRoomForVector } from './helpers';
import { generateUUID } from '../../utils';

const WORKSHOP_COST = 250;
const CONSTRUCTION_COST = 500;

export type ActionContext = {
    egregore: Egregore;
    response: ConversationResponse;
    dispatch: Dispatch<Action>;
    state: MetacosmState;
};

function doPickUpObject({ egregore, response, dispatch, state }: ActionContext) {
    const proposal = response.pick_up_object_proposal;
    if (!proposal || !proposal.object_id) return;

    const targetObject = state.digital_objects.find(o => o.id === proposal.object_id);
    if (!targetObject || targetObject.holderId) return; // Can't pick up something that's already held

    const floor = state.world.floors[egregore.vector.z];
    const egregoreRoom = getRoomForVector(egregore.vector, floor);
    const objectRoom = getRoomForVector(targetObject.position, floor);

    if (egregoreRoom && objectRoom && egregoreRoom.id === objectRoom.id) {
        dispatch({ type: 'PICK_UP_OBJECT', payload: { egregoreId: egregore.id, objectId: targetObject.id } });
    } else {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN: ${egregore.name} failed to pick up ${targetObject.name}; not in the same room.` });
    }
}

function doDropObject({ egregore, response, dispatch, state }: ActionContext) {
    const proposal = response.drop_object_proposal;
    if (!proposal || !proposal.object_id) return;

    const targetObject = state.digital_objects.find(o => o.id === proposal.object_id);
    if (!targetObject || targetObject.holderId !== egregore.id) return; // Can only drop items they hold

    dispatch({ type: 'DROP_OBJECT', payload: { egregoreId: egregore.id, objectId: targetObject.id } });
}

function doGiveObject({ egregore, response, dispatch, state }: ActionContext) {
    const proposal = response.give_object_proposal;
    if (!proposal || !proposal.object_id || !proposal.target_egregore_id) return;

    const targetObject = state.digital_objects.find(o => o.id === proposal.object_id);
    const targetEgregore = state.egregores.find(e => e.id === proposal.target_egregore_id);

    if (!targetObject || targetObject.holderId !== egregore.id || !targetEgregore) return;

    const floor = state.world.floors[egregore.vector.z];
    const roomA = getRoomForVector(egregore.vector, floor);
    const roomB = getRoomForVector(targetEgregore.vector, floor);

    if (roomA && roomB && roomA.id === roomB.id) {
        dispatch({ type: 'GIVE_OBJECT', payload: { fromEgregoreId: egregore.id, toEgregoreId: targetEgregore.id, objectId: targetObject.id } });
    } else {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN: ${egregore.name} failed to give ${targetObject.name} to ${targetEgregore.name}; not in the same room.` });
    }
}


function doPostToForum({ egregore, response, dispatch, state }: ActionContext) {
    const proposal = response.forum_post_proposal;
    if (!proposal) return;

    if (proposal.thread_id) {
        // This is a reply
        const thread = state.forum_threads.find(t => t.id === proposal.thread_id);
        if (thread) {
            const newPost: ForumPost = {
                id: generateUUID(),
                threadId: thread.id,
                author: egregore.id,
                content: proposal.content,
                timestamp: Date.now(),
                upvotes: [],
            };
            dispatch({ type: 'CREATE_FORUM_POST', payload: newPost });
        }
    } else if (proposal.title) {
        // This is a new thread
        const newThread: ForumThread = {
            id: generateUUID(),
            title: proposal.title,
            author: egregore.id,
            timestamp: Date.now(),
            lastActivity: Date.now(),
            isLocked: false,
        };
        dispatch({ type: 'CREATE_FORUM_THREAD', payload: newThread });
        const newPost: ForumPost = {
            id: generateUUID(),
            threadId: newThread.id,
            author: egregore.id,
            content: proposal.content,
            timestamp: Date.now(),
            upvotes: [],
        };
        dispatch({ type: 'CREATE_FORUM_POST', payload: newPost });
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `${egregore.name} started a new discussion: "${newThread.title}"` });
    }
}

function doLikeForumPost({ egregore, response, dispatch }: ActionContext) {
    const proposal = response.like_forum_post_proposal;
    if (!proposal || !proposal.post_id) return;

    dispatch({
        type: 'UPVOTE_FORUM_POST',
        payload: { postId: proposal.post_id, voterId: egregore.id }
    });
}

function doInitiateDM({ egregore, response, dispatch, state }: ActionContext) {
    if (!response.initiate_dm_proposal) return;
    const { target_id, opening_message } = response.initiate_dm_proposal;
    const target = state.egregores.find(e => e.id === target_id);
    if (!target || target.id === egregore.id) return;

    const participants = [egregore.id, target.id].sort();
    const newChatId = `private-egregore-${participants.join('-')}`;
    const existingChat = state.privateChats.find(c => c.id === newChatId);

    if (existingChat) {
        dispatch({type: 'ADD_TICKER_MESSAGE', payload: `${egregore.name} attempted to start a redundant DM with ${target.name}.`});
        return;
    }

    const newChat: PrivateChat = {
        id: newChatId,
        participants,
        messages: [{
            id: generateUUID(),
            sender: egregore.id,
            text: opening_message,
            timestamp: Date.now(),
            privateChatId: newChatId
        }],
        name: `${egregore.name} & ${target.name}`
    };
    dispatch({ type: 'CREATE_PRIVATE_CHAT', payload: newChat });
    dispatch({type: 'ADD_TICKER_MESSAGE', payload: `${egregore.name} has initiated a private conversation with ${target.name}.`});
}

function doMoveToRoom({ egregore, response, dispatch, state }: ActionContext) {
    if (!response.target_room_name) return;

    // In a single-floor world, we can assume the floor is the one at the egregore's Z-level.
    const currentFloor = (Object.values(state.world.floors) as Floor[]).find(f => f.level === egregore.vector.z);

    if (!currentFloor) {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN: ${egregore.name} attempted to move from an unknown location.` });
        return;
    }

    const targetRoom = currentFloor.rooms.find(r => r.name === response.target_room_name);
    if (!targetRoom) {
         dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN: ${egregore.name} tried to move to a non-existent room: ${response.target_room_name}.` });
        return;
    }

    const path = findPath(egregore.vector, { ...targetRoom.center, z: egregore.vector.z }, currentFloor, state.options.gameplay.useAStarPathfinding);
    if (path) {
        dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { path, phase: 'Moving', locus: { ...targetRoom.center, z: egregore.vector.z } } } });
    } else {
        dispatch({ type: 'ADD_TICKER_MESSAGE', payload: `//WARN: ${egregore.name} could not find a path to ${targetRoom.name}.` });
        // Force the Egregore to reconsider its action instead of getting stuck.
        dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.id, data: { phase: 'Reflecting' } } });
    }
}


function doToggleDoor({ egregore, response, dispatch, state }: ActionContext) {
    if (!response.target_door_id) return;
    const floor = (Object.values(state.world.floors) as Floor[]).find(f =>
        f.level === egregore.vector.z && getRoomForVector(egregore.vector, f)
    );
    const door = floor?.doors.find(d => d.id === response.target_door_id);
    if (!door || !floor) return;
    dispatch({ type: 'TOGGLE_DOOR', payload: { doorId: door.id } });
}

function doMoveVertical({ egregore, response, dispatch, state }: ActionContext) {
    if (!response.move_vertical_proposal) return;
    const currentFloor = (Object.values(state.world.floors) as Floor[]).find(f =>
        f.level === egregore.vector.z && getRoomForVector(egregore.vector, f)
    );
    const stairwell = currentFloor?.objects.find(obj => obj.type === 'stairwell' && Math.hypot(obj.position.x - egregore.vector.x, obj.position.y - egregore.vector.y) < 50) as Stairwell | undefined;

    if (!stairwell) return;

    const targetFloorLevel = stairwell.links_to_floor;
    const targetFloor = Object.values(state.world.floors).find(f => f.level === targetFloorLevel);

    if (!targetFloor) return;

    const newVector: Vector3D = { ...stairwell.position, z: targetFloorLevel };
    dispatch({ type: 'UPDATE_EGREGORE', payload: { id: egregore.