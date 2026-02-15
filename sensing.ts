
import { Egregore, SensoryInput } from '../../types';
import { TaurusService } from '../taurusServices/index';

export function getSensoryInput(taurus: TaurusService, agent: Egregore, allEgregores: Egregore[]): SensoryInput {
    const currentRoom = taurus.getCurrentRoom(agent);
    const visibleEgregores = taurus.getVisibleEgregores(agent);

    const sight: string[] = [];
    const sound: string[] = [];
    const availableMoves: string[] = [];

    if (currentRoom) {
        sight.push(`You are in the ${currentRoom.name}.`);
        sight.push(`Purpose: ${currentRoom.purpose}.`);
        
        if (currentRoom.description) {
                sight.push(`VISUAL: ${currentRoom.description}`);
        }

        if (currentRoom.subdivisions && currentRoom.subdivisions.length > 0) {
            const subDetails = currentRoom.subdivisions.map(s => {
                availableMoves.push(s.name);
                return `${s.name} (${s.purpose})`;
            }).join('; ');
            sight.push(`LOCAL SUB-ZONES: You perceive distinct areas nearby: ${subDetails}.`);
        }
        
        if (currentRoom.activeMemes && currentRoom.activeMemes.length > 0) {
            const dominantMemes = currentRoom.activeMemes.slice(-3);
            const atmosphere = dominantMemes.map(m => m.theme).join(', ');
            sight.push(`ATMOSPHERE: The air is heavy with the concepts of: ${atmosphere}.`);
        }

        sound.push(`The ambient sound is a low hum.`);
    } else {
        sight.push("You are floating in the void between rooms.");
    }

    if (visibleEgregores.length > 0) {
        const names = visibleEgregores.map(e => e.name).join(', ');
        sight.push(`You see ${names} in the same room.`);
        sound.push(`You can hear the faint digital presence of other Egregores.`);
    } else {
        sight.push("You are alone in this room.");
    }

    return {
        selfId: agent.id,
        sight,
        sound,
        smell: ["You smell nothing; the air is filtered data."],
        touch: ["You feel the subtle vibration of the Metacosm's core processes."],
        availableMoves
    };
}