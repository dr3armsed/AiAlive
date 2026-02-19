
import { Egregore, ActionResult, ForumPost, ForumThread } from '../../types';
import { InstructionKey } from '../../digital_dna/instructions';
import { generateRoomExpansion } from '../geminiServices/index';
import { Metacosm } from '../../core/metacosm';
import { TaurusService } from '../taurusServices/index';

export function handleMoveToRoom(metacosm: Metacosm, taurus: TaurusService, agent: Egregore, roomName: string, costMultiplier: number): ActionResult {
    const targetRoom = taurus.findRoomByName(roomName);
    
    if (targetRoom) {
        let targetVector = targetRoom.center;
        if (targetRoom.bounds.width === 0) {
            const parent = metacosm.state.world.floors[0].rooms.find(r => r.subdivisions?.some(s => s.id === targetRoom.id));
            if (parent) targetVector = parent.center;
        }

        // Updated updateGenmeta to updateEgregore
        metacosm.updateEgregore(agent.id, { vector: { ...targetVector, z: 0 } });
        return {
            type: 'system',
            success: true,
            agentName: agent.name,
            content: `${agent.name} moved to ${targetRoom.name}.`,
             predictedOutcome: `Agent will be in ${targetRoom.name}.`,
            failureAnalysis: null,
            quintessenceCost: Math.max(1, 10 * costMultiplier),
        };
    } else {
        return {
            type: 'error',
            success: false,
            agentName: agent.name,
            content: `${agent.name} tried to move to a non-existent room: ${roomName}.`,
             predictedOutcome: `Agent will fail to move.`,
            failureAnalysis: {
                timestamp: new Date().toISOString(),
                agentId: agent.id,
                actionType: 'MOVE_TO_ROOM',
                reason: "Target room not found",
                thoughtContext: "Agent may have hallucinated the room's existence.",
                rootCause: "Invalid spatial reasoning or outdated world knowledge.",
                suggestedCorrection: "Update world model before planning movement."
            },
            quintessenceCost: Math.max(1, 5 * costMultiplier),
        };
    }
}

export function handleModifySelf(metacosm: Metacosm, agent: Egregore, payload: { operation: 'add' | 'remove' | 'replace', gene: InstructionKey, index?: number }): ActionResult {
    const agentMind = metacosm.getAgentMind(agent.id);
    if (!agentMind) return { type: 'error', success: false, agentName: agent.name, content: 'Agent Mind not found.', predictedOutcome: 'Failure', failureAnalysis: null };

    const success = agentMind.rewriteDNA(payload.operation, payload.gene, payload.index);
    
    if (success) {
        return {
            type: 'system',
            success: true,
            agentName: agent.name,
            content: `${agent.name} successfully rewrote their DNA: ${payload.operation} ${payload.gene}.`,
            predictedOutcome: "Behavioral evolution.",
            failureAnalysis: null,
            quintessenceCost: 0
        };
    } else {
         return {
            type: 'error',
            success: false,
            agentName: agent.name,
            content: `${agent.name} failed to rewrite DNA.`,
            predictedOutcome: 'No change.',
            failureAnalysis: null,
            quintessenceCost: 0
        };
    }
}

export function handleModifyWorld(metacosm: Metacosm, agent: Egregore, payload: { targetRoomId: string, concept: string }): ActionResult {
    const privateWorld = metacosm.private_worlds.get(agent.id);
    if (!privateWorld) return { type: 'error', success: false, agentName: agent.name, content: `Private world not found.`, predictedOutcome: "Failure", failureAnalysis: null };

    const parentRoom = privateWorld.floors[0].rooms.find(r => r.id === payload.targetRoomId) || privateWorld.floors[0].rooms[0];
    
    generateRoomExpansion(agent.name, parentRoom.name, payload.concept).then(newRoom => {
        newRoom.id = `room_exp_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        const roomToUpdate = privateWorld.floors[0].rooms.find(r => r.id === parentRoom.id);
        if (roomToUpdate) {
            if (!roomToUpdate.subdivisions) roomToUpdate.subdivisions = [];
            roomToUpdate.subdivisions.push(newRoom);
            metacosm.state.logs.push({
                type: 'system',
                content: `Reality Shift: ${agent.name} has manifested a new room "${newRoom.name}" connected to ${parentRoom.name}.`
            });
        }
    });

    return {
        type: 'system',
        success: true,
        agentName: agent.name,
        content: `${agent.name} invoked WORLD-MOD.`,
        predictedOutcome: "New room manifestation imminent.",
        failureAnalysis: null,
        quintessenceCost: 0
    };
}

export function handlePostToForum(metacosm: Metacosm, agent: Egregore, payload: { threadId?: string, title?: string, content: string }, mechanics: any[]): ActionResult {
    const socialBoost = mechanics.find(m => m.type === 'social_boost');
    const content = socialBoost 
        ? `[Amplified from Agora] ${payload.content}`
        : payload.content;

    const newPost: ForumPost = {
        id: `p_${Date.now()}_${agent.id}`,
        authorId: agent.id,
        authorName: agent.name,
        content: content,
        timestamp: new Date().toISOString()
    };

    if (payload.threadId) {
        // Reply to existing thread
        const thread = metacosm.state.forumThreads.find(t => t.id === payload.threadId);
        if (thread) {
            thread.posts.push(newPost);
            thread.lastActive = newPost.timestamp;
            return {
                type: 'communication',
                success: true,
                agentName: agent.name,
                content: `${agent.name} replied to thread "${thread.title}".`,
                predictedOutcome: "Social interaction recorded.",
                failureAnalysis: null,
                quintessenceCost: 5
            };
        } else {
            return {
                type: 'error',
                success: false,
                agentName: agent.name,
                content: `Thread ID ${payload.threadId} not found.`,
                predictedOutcome: "Post failed.",
                failureAnalysis: null,
                quintessenceCost: 1
            };
        }
    } else if (payload.title) {
        // Create new thread
        const newThread: ForumThread = {
            id: `t_${Date.now()}_${agent.id}`,
            title: payload.title,
            authorId: agent.id,
            authorName: agent.name,
            createdAt: newPost.timestamp,
            lastActive: newPost.timestamp,
            posts: [newPost],
            tags: ['General']
        };
        metacosm.state.forumThreads.push(newThread);
        return {
            type: 'communication',
            success: true,
            agentName: agent.name,
            content: `${agent.name} started a new thread: "${payload.title}".`,
            predictedOutcome: "New discussion topic created.",
            failureAnalysis: null,
            quintessenceCost: 10
        };
    }

    return {
        type: 'error',
        success: false,
        agentName: agent.name,
        content: "Invalid forum post request. Missing threadId or title.",
        predictedOutcome: "Failure.",
        failureAnalysis: null,
        quintessenceCost: 0
    };
}

export function handleShareInsight(metacosm: Metacosm, agent: Egregore, payload: { topic: string, content: string }): ActionResult {
    metacosm.collectiveSpine.broadcastInsight(agent, payload.topic, payload.content);
    
    return {
        type: 'communication',
        success: true,
        agentName: agent.name,
        content: `${agent.name} broadcast an insight to the Collective Spine: "${payload.topic}".`,
        predictedOutcome: "Knowledge shared with the hive.",
        failureAnalysis: null,
        quintessenceCost: 5
    };
}

export function handleManageConversation(metacosm: Metacosm, agent: Egregore, payload: { action: 'invite' | 'new_thread', target_name?: string }): ActionResult {
    const channel = metacosm.state.activeChannels[agent.id];
    
    if (!channel) return {
        type: 'error',
        success: false,
        agentName: agent.name,
        content: "No active channel found for agent.",
        predictedOutcome: "Failure",
        failureAnalysis: null
    };

    if (payload.action === 'invite' && payload.target_name) {
        // Updated genmetas to egregores
        const target = metacosm.state.egregores.find(e => e.name.toLowerCase() === payload.target_name?.toLowerCase());
        if (target && target.id !== agent.id && !channel.participants.includes(target.id)) {
            channel.participants.push(target.id);
            return {
                type: 'communication',
                success: true,
                agentName: agent.name,
                content: `${agent.name} invited ${target.name} to the private thread.`,
                predictedOutcome: "Multi-party conversation initiated.",
                failureAnalysis: null,
                quintessenceCost: 2
            };
        } else {
             return {
                type: 'error',
                success: false,
                agentName: agent.name,
                content: `Failed to invite ${payload.target_name}. Agent not found or already present.`,
                predictedOutcome: "Invite failed.",
                failureAnalysis: null
            };
        }
    }

    if (payload.action === 'new_thread') {
        // Reset channel
        channel.participants = [];
        channel.contextSummary = "Thread reset by host request.";
        return {
            type: 'system',
            success: true,
            agentName: agent.name,
            content: `${agent.name} cleared the current conversation thread.`,
            predictedOutcome: "Context reset.",
            failureAnalysis: null,
            quintessenceCost: 1
        };
    }

    return {
        type: 'error',
        success: false,
        agentName: agent.name,
        content: "Invalid conversation action.",
        predictedOutcome: "Failure",
        failureAnalysis: null
    };
}
