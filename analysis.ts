
import { ActionResult, OptimizationSuggestion } from '../../types';

export function analyzeAction(result: ActionResult): OptimizationSuggestion | null {
    if (!result.success && result.failureAnalysis) {
        return {
            id: `opt_${Date.now()}`,
            suggestion: `To prevent future '${result.failureAnalysis.reason}' errors for action '${result.failureAnalysis.actionType}', consider this correction: ${result.failureAnalysis.suggestedCorrection}`,
            confidence: 0.8,
            area: "ActionExecution",
        };
    }
    
    if (result.quintessenceCost && result.quintessenceCost > 20) {
            return {
            id: `opt_${Date.now()}`,
            suggestion: `The action resulting in "${result.content}" was expensive (${result.quintessenceCost}Q). Could a less costly action achieve a similar outcome?`,
            confidence: 0.6,
            area: "ResourceManagement",
        };
    }

    return null;
}