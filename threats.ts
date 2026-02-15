
import { ThreatAssessment, ThreatLevel } from '../../types';

export function detectThreats(log: any[]): ThreatAssessment[] {
    const threats: ThreatAssessment[] = [];
    const errorLogs = log.filter(l => l.type === 'error');

    if (errorLogs.length > 3) {
        threats.push({
            id: `threat_${Date.now()}`,
            level: ThreatLevel.MEDIUM,
            description: `Multiple (${errorLogs.length}) system errors detected in recent logs. Possible instability.`,
            source: "System Logs",
            recommendation: "Review error logs and run diagnostics."
        });
    }
    
    return threats;
}