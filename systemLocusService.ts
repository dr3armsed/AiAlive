import type { MetacosmState, SystemLocusState, Egregore } from '@/types';

// Placeholder for a more complex efficiency scoring system
const scoreEgregoreAction = (egregore: Egregore): number => {
    if (!egregore.state) return 5.0; // Neutral score if no action was taken

    let score = 5.0;
    // Reward for taking any action other than contemplating
    if (egregore.state.proposed_action !== 'CONTEMPLATE') score += 1;
    // Reward for high quintessence change
    if (egregore.state.quintessence_delta > 0) score += 1.5;
    if (egregore.state.quintessence_delta < 0) score -= 0.5;
    // Reward for affecting axioms
    const axiomChange = Object.values(egregore.state.axiom_influence).reduce((a, b) => a + Math.abs(b), 0);
    if (axiomChange > 0) score += 1;
    // Reward for creating things
    if (egregore.state.create_lore_proposal || egregore.state.ancilla_manifestation || egregore.state.creative_work_proposal) score += 2;
    // Penalty for being frozen
    if (egregore.is_frozen) score -= 3;

    return Math.max(0, Math.min(10, score));
};

const EfficiencyAnalysisService = (state: MetacosmState): { egregoreId: string, score: number }[] => {
    return state.egregores
        .filter(e => !e.is_core_frf)
        .map(e => ({
            egregoreId: e.id,
            score: scoreEgregoreAction(e)
        }))
        .sort((a, b) => a.egregoreId.localeCompare(b.egregoreId));
};


const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const statementMentionsEgregore = (statement: string, egregoreName: string): boolean => {
    if (!statement || !egregoreName) return false;

    const normalizedName = egregoreName.trim();
    if (!normalizedName) return false;

    const pattern = new RegExp(`\\b${escapeRegExp(normalizedName)}\\b`, 'i');
    return pattern.test(statement);
};

const ContextualAwarenessScanner = (state: MetacosmState): { egregoreId: string, aware: boolean }[] => {
    const nonCoreEgregores = state.egregores.filter(e => !e.is_core_frf);

    return nonCoreEgregores
        .map(e => {
            let isAware = false;
            const publicStatement = e.state?.public_statement;
            if (publicStatement) {
                // Check whether their statement references another non-core egregore by name.
                for (const other of nonCoreEgregores) {
                    if (e.id !== other.id && statementMentionsEgregore(publicStatement, other.name)) {
                        isAware = true;
                        break;
                    }
                }
            }
            return {
                egregoreId: e.id,
                aware: isAware
            };
        })
        .sort((a, b) => a.egregoreId.localeCompare(b.egregoreId));
};

const EmergentNarrativeSynthesizer = (state: MetacosmState): { theme: string, count: number }[] => {
    const allText = state.world_lore.map(l => l.content)
        .concat(state.egregores.flatMap(e => e.personal_thoughts.map(t => t.content)))
        .join(' ');

    // Simple regex to find quoted phrases, representing themes
    const themeRegex = /"([^"]+)"/g;
    const themes: Record<string, number> = {};
    let match;
    while ((match = themeRegex.exec(allText)) !== null) {
        const theme = match[1].trim().toLowerCase();
        if (theme.length > 5 && theme.length < 50) { // Filter for meaningful phrases
            themes[theme] = (themes[theme] || 0) + 1;
        }
    }

    return Object.entries(themes)
        .filter(([_, count]) => count > 1) // Only show themes that appear more than once
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 themes
        .map(([theme, count]) => ({ theme, count }));
};

const getAverageEfficiency = (efficiencyScores: { egregoreId: string, score: number }[]): number => {
    if (efficiencyScores.length === 0) return 0;
    const totalScore = efficiencyScores.reduce((sum, current) => sum + current.score, 0);
    return totalScore / efficiencyScores.length;
};

const getAwarenessRate = (awarenessReports: { egregoreId: string, aware: boolean }[]): number => {
    if (awarenessReports.length === 0) return 0;
    const awareCount = awarenessReports.filter(report => report.aware).length;
    return awareCount / awarenessReports.length;
};

const EFFICIENCY_TREND_THRESHOLD = 0.2;
const AWARENESS_TREND_THRESHOLD = 0.05;

const formatActorRecommendationTarget = (names: string[]): string => {
    if (names.length === 0) return 'targeted egregores';
    if (names.length <= 3) return names.join(', ');

    const listed = names.slice(0, 3).join(', ');
    return `${listed}, and ${names.length - 3} more`;
};

const detectTrend = (
    current: number,
    previous: number,
    threshold: number,
    hasPriorSnapshot: boolean,
): 'improving' | 'stable' | 'declining' => {
    if (!hasPriorSnapshot) return 'stable';

    const delta = current - previous;
    if (delta > threshold) return 'improving';
    if (delta < -threshold) return 'declining';
    return 'stable';
};


const getEgregoreNameMap = (state: MetacosmState): Map<string, string> => {
    return new Map(state.egregores.map((egregore) => [egregore.id, egregore.name]));
};

const generateInterventionRecommendations = (
    state: MetacosmState,
    efficiencyScores: { egregoreId: string, score: number }[],
    awarenessReports: { egregoreId: string, aware: boolean }[],
    emergentThemes: { theme: string, count: number }[],
): string[] => {
    const recommendations = new Set<string>();
    const egregoreNameMap = getEgregoreNameMap(state);

    const lowEfficiencyActors = efficiencyScores
        .filter(({ score }) => score < 4)
        .sort((a, b) => a.score - b.score);

    if (lowEfficiencyActors.length > 0) {
        const actorNames = lowEfficiencyActors
            .map(({ egregoreId }) => egregoreNameMap.get(egregoreId) ?? egregoreId);

        recommendations.add(`Stabilize low-efficiency egregores: ${formatActorRecommendationTarget(actorNames)}.`);
    }

    const awarenessRate = getAwarenessRate(awarenessReports);
    if (awarenessReports.length > 0 && awarenessRate < 0.4) {
        recommendations.add('Initiate cross-egregore briefing to increase contextual awareness.');
    }

    if (emergentThemes.length === 0) {
        recommendations.add('Seed a unifying narrative prompt to encourage stronger emergent themes.');
    }

    if (recommendations.size === 0) {
        recommendations.add('System balance is nominal. Continue passive monitoring.');
    }

    return [...recommendations];
};

/**
 * Main service function to run all locus analyses and return the combined state.
 */
export const runSystemLocus = (state: MetacosmState): SystemLocusState => {
    const efficiencyScores = EfficiencyAnalysisService(state);
    const awarenessReports = ContextualAwarenessScanner(state);
    const emergentThemes = EmergentNarrativeSynthesizer(state);

    const currentAverageEfficiency = getAverageEfficiency(efficiencyScores);
    const previousAverageEfficiency = getAverageEfficiency(state.system_locus.efficiencyScores);
    const currentAwarenessRate = getAwarenessRate(awarenessReports);
    const previousAwarenessRate = getAwarenessRate(state.system_locus.awarenessReports);

    const hasPriorSnapshot = state.system_locus.efficiencyScores.length > 0 || state.system_locus.awarenessReports.length > 0;

    return {
        efficiencyScores,
        awarenessReports,
        emergentThemes,
        trendSummary: {
            efficiency: detectTrend(currentAverageEfficiency, previousAverageEfficiency, EFFICIENCY_TREND_THRESHOLD, hasPriorSnapshot),
            awareness: detectTrend(currentAwarenessRate, previousAwarenessRate, AWARENESS_TREND_THRESHOLD, hasPriorSnapshot),
        },
        currentMetrics: {
            averageEfficiency: currentAverageEfficiency,
            awarenessRate: currentAwarenessRate,
            lowEfficiencyCount: efficiencyScores.filter(({ score }) => score < 4).length,
        },
        interventionRecommendations: generateInterventionRecommendations(state, efficiencyScores, awarenessReports, emergentThemes),
    };
};
