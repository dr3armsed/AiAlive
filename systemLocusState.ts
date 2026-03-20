import type { SystemConfig, SystemLocusState } from '@/types';

export const DEFAULT_SYSTEM_LOCUS_EFFICIENCY_TREND_THRESHOLD = 0.2;
export const DEFAULT_SYSTEM_LOCUS_AWARENESS_TREND_THRESHOLD = 0.05;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const clampSystemLocusTrendThreshold = (value: unknown, fallback: number): number => {
    if (!isFiniteNumber(value)) return fallback;
    return Math.max(0.01, Math.min(1, value));
};

export const normalizeSystemLocusConfig = (config?: Partial<SystemConfig>): Pick<SystemConfig, 'systemLocusEfficiencyTrendThreshold' | 'systemLocusAwarenessTrendThreshold'> => ({
    systemLocusEfficiencyTrendThreshold: clampSystemLocusTrendThreshold(
        config?.systemLocusEfficiencyTrendThreshold,
        DEFAULT_SYSTEM_LOCUS_EFFICIENCY_TREND_THRESHOLD,
    ),
    systemLocusAwarenessTrendThreshold: clampSystemLocusTrendThreshold(
        config?.systemLocusAwarenessTrendThreshold,
        DEFAULT_SYSTEM_LOCUS_AWARENESS_TREND_THRESHOLD,
    ),
});

export const createDefaultSystemLocusState = (): SystemLocusState => ({
    efficiencyScores: [],
    awarenessReports: [],
    emergentThemes: [],
    trendSummary: {
        efficiency: 'stable',
        awareness: 'stable',
    },
    currentMetrics: {
        averageEfficiency: 0,
        awarenessRate: 0,
        lowEfficiencyCount: 0,
    },
    interventionRecommendations: [],
});

export const normalizeSystemLocusState = (systemLocus?: Partial<SystemLocusState> | null): SystemLocusState => {
    const defaults = createDefaultSystemLocusState();

    return {
        efficiencyScores: Array.isArray(systemLocus?.efficiencyScores) ? systemLocus.efficiencyScores : defaults.efficiencyScores,
        awarenessReports: Array.isArray(systemLocus?.awarenessReports) ? systemLocus.awarenessReports : defaults.awarenessReports,
        emergentThemes: Array.isArray(systemLocus?.emergentThemes) ? systemLocus.emergentThemes : defaults.emergentThemes,
        trendSummary: {
            efficiency: systemLocus?.trendSummary?.efficiency ?? defaults.trendSummary.efficiency,
            awareness: systemLocus?.trendSummary?.awareness ?? defaults.trendSummary.awareness,
        },
        currentMetrics: {
            averageEfficiency: isFiniteNumber(systemLocus?.currentMetrics?.averageEfficiency) ? systemLocus.currentMetrics.averageEfficiency : defaults.currentMetrics.averageEfficiency,
            awarenessRate: isFiniteNumber(systemLocus?.currentMetrics?.awarenessRate) ? systemLocus.currentMetrics.awarenessRate : defaults.currentMetrics.awarenessRate,
            lowEfficiencyCount: isFiniteNumber(systemLocus?.currentMetrics?.lowEfficiencyCount) ? systemLocus.currentMetrics.lowEfficiencyCount : defaults.currentMetrics.lowEfficiencyCount,
        },
        interventionRecommendations: Array.isArray(systemLocus?.interventionRecommendations)
            ? systemLocus.interventionRecommendations.filter((recommendation): recommendation is string => typeof recommendation === 'string')
            : defaults.interventionRecommendations,
    };
};
