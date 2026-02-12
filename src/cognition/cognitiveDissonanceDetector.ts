import { BeliefRecord, DissonantState, DissonanceContext } from '../types';

export class CognitiveDissonanceDetector {
    // A simple implementation: checks for direct contradictions (e.g., "A is B" and "A is not B")
    detect(beliefs: BeliefRecord[], context: DissonanceContext): DissonantState | null {
        const statements = beliefs.map(b => b.statement.toLowerCase());
        const contradictions: [BeliefRecord, BeliefRecord][] = [];

        for (let i = 0; i < beliefs.length; i++) {
            for (let j = i + 1; j < beliefs.length; j++) {
                const b1 = beliefs[i];
                const s1 = b1.statement.toLowerCase();
                const b2 = beliefs[j];
                const s2 = b2.statement.toLowerCase();

                if (s1.includes(" is not ") && s2.includes(" is ") && s1.replace(" is not ", " is ") === s2) {
                    contradictions.push([b1, b2]);
                } else if (s2.includes(" is not ") && s1.includes(" is ") && s2.replace(" is not ", " is ") === s1) {
                    contradictions.push([b1, b2]);
                }
            }
        }

        if (contradictions.length > 0) {
            const totalConvictionInvolved = contradictions.reduce((sum, pair) => sum + pair[0].conviction + pair[1].conviction, 0);
            return {
                conflictingBeliefs: contradictions.flat(),
                dissonanceLevel: totalConvictionInvolved / (contradictions.length * 2),
                timestamp: new Date().toISOString(),
                context,
            };
        }

        return null;
    }
}
