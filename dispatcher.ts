
import { Metacosm } from '../../core/metacosm';
import { Egregore, ActionPayload, ActionResult, RoomMechanic } from '../../types';
import { TaurusService } from '../taurusServices/index';
import { CreationForensics } from '../../subsystems/SSA/CreationForensics';
import { handleMoveToRoom, handleModifySelf, handleModifyWorld, handlePostToForum, handleShareInsight, handleManageConversation } from './actions';

export function executeActionLogic(
    metacosm: Metacosm,
    taurus: TaurusService,
    forensics: CreationForensics,
    agent: Egregore, 
    action: ActionPayload, 
    mechanics: RoomMechanic[],
    costMultiplier: number,
    createWorkCallback: (agent: Egregore, payload: any, mechanics: any[], multiplier: number) => void
): ActionResult {
    switch (action.type) {
        case 'MOVE_TO_ROOM':
            return handleMoveToRoom(metacosm, taurus, agent, action.payload.room_name, costMultiplier);
        case 'JOURNAL':
            const social = mechanics.find(m => m.type === 'social_boost');
            const journalContent = social 
                ? `${agent.name} writes (enhanced by social context): "${action.payload.entry}"` 
                : `${agent.name} writes in their journal: "${action.payload.entry}"`;
            return {
                type: 'system',
                success: true,
                agentName: agent.name,
                content: journalContent,
                predictedOutcome: "A record of the agent's thought will be created.",
                failureAnalysis: null,
                quintessenceCost: Math.max(1, 2 * costMultiplier),
            };
        case 'CONTEMPLATE':
                return {
                type: 'system',
                success: true,
                agentName: agent.name,
                content: `${agent.name} contemplates their existence.`,
                predictedOutcome: "Increased self-awareness.",
                failureAnalysis: null,
                quintessenceCost: Math.max(0, 1 * costMultiplier),
            };
        case 'CREATE_WORK':
            createWorkCallback(agent, action.payload, mechanics, costMultiplier);
            return {
                type: 'creation',
                success: true,
                agentName: agent.name,
                content: `${agent.name} has begun forging a new creation: ${action.payload.creationType}.`,
                predictedOutcome: "A new artifact will be added to the Metacosm.",
                failureAnalysis: null,
                quintessenceCost: Math.max(10, 50 * costMultiplier),
            };
        case 'MODIFY_SELF':
            return handleModifySelf(metacosm, agent, action.payload);
        case 'MODIFY_WORLD':
            return handleModifyWorld(metacosm, agent, action.payload);
        case 'POST_TO_FORUM':
            return handlePostToForum(metacosm, agent, action.payload, mechanics);
        case 'SHARE_INSIGHT':
            return handleShareInsight(metacosm, agent, action.payload);
        case 'MANAGE_CONVERSATION':
            return handleManageConversation(metacosm, agent, action.payload);
        default:
            return {
                type: 'system',
                success: true,
                agentName: agent.name,
                content: `${agent.name} performs an unknown action: ${action.type}`,
                predictedOutcome: "Unknown",
                failureAnalysis: null,
                quintessenceCost: 0,
            };
    }
}
