import { HeuristicRecord, HeuristicEngineOptions } from '../types';

export class HeuristicEngine {
    private heuristics: HeuristicRecord[] = [];
    private options: HeuristicEngineOptions;

    constructor(options: HeuristicEngineOptions = {}) {
        this.options = options;
    }

    addHeuristic(heuristic: Omit<HeuristicRecord, 'id' | 'createdAt'>): HeuristicRecord {
        const newHeuristic: HeuristicRecord = {
            ...heuristic,
            id: `h_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        this.heuristics.push(newHeuristic);
        return newHeuristic;
    }

    evaluate(context: any): string[] {
        const triggeredActions: string[] = [];
        for (const h of this.heuristics) {
            // This is a very simple evaluator. A real one would be more complex.
            if (context[h.condition.fact] === h.condition.value) {
                triggeredActions.push(h.action);
            }
        }
        return triggeredActions;
    }
}
