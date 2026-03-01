
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
        }));
};

const ContextualAwarenessScanner = (state: MetacosmState): { egregoreId: string, aware: boolean }[] => {
    return state.egregores
        .filter(e => !e.is_core_frf && e.state)
        .map(e => {
            let isAware = false;
            const publicStatement = e.state!.public_statement;
            if (publicStatement) {
                 // Simple check: does their statement mention another egregore by name?
                 for (const other of state.egregores) {
                     if (e.id !== other.id && publicStatement.includes(other.name)) {
                         isAware = true;
                         break;
                     }
                 }
            }
            return {
                egregoreId: e.id,
                aware: isAware
            }
        });
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


/**
 * Main service function to run all locus analyses and return the combined state.
 */
export const runSystemLocus = (state: MetacosmState): SystemLocusState => {
    return {
        efficiencyScores: EfficiencyAnalysisService(state),
        awarenessReports: ContextualAwarenessScanner(state),
        emergentThemes: EmergentNarrativeSynthesizer(state),
    };
};
