
import { Metacosm } from '../../core/metacosm';
import { Room, RoomAction, Egregore } from '../../types';
import { TaurusService } from '../taurusServices/index';

export function executeWorldAction(
    metacosm: Metacosm,
    taurus: TaurusService,
    room: Room,
    action: RoomAction
): { success: boolean, message: string } {
    
    // 1. Check Cost (Simulated here, assuming user has infinite or uses VF treasury)
    // In a real game loop, we'd check metacosm.state.ventureForge.architectsTreasury
    // For now, we log it.
    console.log(`[Aries] Executing World Action: ${action.label} (Cost: ${action.quintessenceCost})`);

    // Updated genmetas to egregores
    const occupants = metacosm.state.egregores.filter(e => {
        const r = taurus.getCurrentRoom(e);
        return r && (r.id === room.id || room.subdivisions?.some(sub => sub.id === r.id));
    });

    switch (action.effectType) {
        case 'buff_occupants':
            occupants.forEach(agent => {
                const mind = metacosm.getAgentMind(agent.id);
                if (mind) {
                    if (action.payload.mechanic === 'creativity_boost') {
                        mind.emotionalState.vector.curiosity = 1.0;
                        mind.processExperience(`The Architect ignited the Forge. I feel a surge of pure inspiration!`, 1.0, 'System');
                    } else if (action.payload.mechanic === 'stability_boost') {
                        mind.emotionalState.vector.serenity = 1.0;
                        mind.processExperience(`A wave of synchronization from the Nexus aligns my thoughts. I am stable.`, 1.0, 'System');
                    }
                }
            });
            metacosm.state.logs.push({ type: 'system', content: `Architect invoked ${action.label} in ${room.name}. ${occupants.length} entities affected.` });
            return { success: true, message: `${action.label} successful. Buffed ${occupants.length} agents.` };

        case 'purge_anomalies':
            occupants.forEach(agent => {
                // In a real implementation, we would access the Cancer service to clear anomalies directly.
                // Here we simulate it via memory injection and emotion reset.
                const mind = metacosm.getAgentMind(agent.id);
                if (mind) {
                    mind.emotionalState.vector.fear = 0;
                    mind.emotionalState.vector.anger = 0;
                    mind.processExperience(`The Sanctum's cleansing wave washed away my pain.`, 1.0, 'System');
                }
            });
            metacosm.state.logs.push({ type: 'system', content: `Architect cleansed ${room.name}. Anomalies purged.` });
            return { success: true, message: `Cleansed ${occupants.length} agents of corruption.` };

        case 'modify_atmosphere':
            if (action.payload.removeTheme && room.activeMemes) {
                const initialCount = room.activeMemes.length;
                room.activeMemes = room.activeMemes.filter(m => !m.theme.toLowerCase().includes(action.payload.removeTheme));
                const removed = initialCount - room.activeMemes.length;
                metacosm.state.logs.push({ type: 'system', content: `Architect purged '${action.payload.removeTheme}' memes from ${room.name}.` });
                return { success: true, message: `Removed ${removed} memes.` };
            }
            return { success: false, message: "No memes matched criteria." };

        default:
            return { success: false, message: "Unknown action type." };
    }
}
