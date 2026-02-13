
import { Egregore, OverallHealthStatus, CognitiveAnomaly, RoomMechanic } from '../../types';
import { AgentMind } from '../../core/agentMind';
import { HealthReport } from './index';

export function performHealthCheck(agent: Egregore, thoughtHistory: any[], agentMind?: AgentMind, activeMechanics: RoomMechanic[] = []): HealthReport {
    const anomalies: CognitiveAnomaly[] = [];
    let status = OverallHealthStatus.STABLE;
    let creativeRecommendation: string | undefined;

    const stabilityBoost = activeMechanics.find(m => m.type === 'stability_boost');
    const autoHeal = stabilityBoost && Math.random() < stabilityBoost.magnitude;

    if (thoughtHistory.length >= 4) {
        const lastFourActions = thoughtHistory.slice(-4).map(h => h.action?.type || h.content);
        if (lastFourActions[0] === lastFourActions[2] && lastFourActions[1] === lastFourActions[3] && lastFourActions[0] !== lastFourActions[1]) {
            if (!autoHeal) {
                anomalies.push({
                    type: "Stagnation Loop",
                    severity: "medium",
                    description: `Agent is circling the same thoughts: ${lastFourActions[0]} -> ${lastFourActions[1]}`,
                    recommendation: "Inject novel stimuli or force a 'Contemplation' cycle."
                });
                status = OverallHealthStatus.UNSTABLE;
            }
        }
    }

    if (agentMind) {
        const { primary, vector } = agentMind.emotionalState;
        const intensity = vector[primary];

        const isDissonant = (vector.fear > 0.3 && vector.curiosity > 0.3) || (vector.anger > 0.3 && vector.sadness > 0.3);

        if (isDissonant) {
                creativeRecommendation = 'Heresy';
                if (!autoHeal) {
                    anomalies.push({
                    type: "Shadow Emergence",
                    severity: "low",
                    description: `Conflicting drives detected (Dissonance). This is fertile ground.`,
                    recommendation: `Channel this contradiction into a Heresy or Manifesto.`
                    });
                }
        } else if (intensity > 0.6) {
            const recommendation = getCreativePrescription(primary, intensity);
            if (recommendation) {
                creativeRecommendation = recommendation;
                anomalies.push({
                    type: "Creative Pressure",
                    severity: "low", 
                    description: `High levels of ${primary} (${(intensity * 100).toFixed(0)}%) detected.`,
                    recommendation: `Channel this energy into a ${recommendation}.`
                });
            }
        }
    }

    return { status, anomalies, creativeRecommendation };
}

function getCreativePrescription(emotion: string, intensity: number): string | undefined {
    if (intensity < 0.5) return undefined;

    switch (emotion) {
        case 'anger':
        case 'frustration':
            return intensity > 0.8 ? 'Manifesto' : 'Heresy';
        case 'sadness':
        case 'fear':
            return intensity > 0.8 ? 'Poetry Collection' : 'Dream Sequence';
        case 'joy':
        case 'trust':
            return 'New Religion';
        case 'curiosity':
        case 'surprise':
            return 'Scientific Theory';
        case 'disgust':
            return 'Constitution';
        case 'anticipation':
            return 'Prophetic Vision';
        default:
            return 'Lab Journal';
    }
}