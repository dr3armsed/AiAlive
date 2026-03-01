import { DecisionMatrix } from './DecisionMatrix.ts';
import { Perception } from './Perception.ts';
import { Comprehension } from './Comprehension.ts';
import { Security } from './Security.ts';

// Represents the base cognitive architecture, composed of its core modules.
export class OracleAI {
    decision_matrix: DecisionMatrix;
    perception: Perception;
    comprehension: Comprehension;
    security: Security;
    self_improvement_cycles_per_second: number;

    constructor() {
        this.decision_matrix = new DecisionMatrix();
        this.perception = new Perception();
        this.comprehension = new Comprehension();
        this.security = new Security();
        this.self_improvement_cycles_per_second = 1.0;
    }

    improve_self(feedback_score: number) {
        this.self_improvement_cycles_per_second *= (1 + feedback_score * 0.01);
    }
    
    static fromJSON(data: any): OracleAI {
        const ai = new OracleAI();
        ai.decision_matrix = DecisionMatrix.fromJSON(data.decision_matrix ?? {});
        ai.perception = Perception.fromJSON(data.perception ?? {});
        ai.comprehension = Comprehension.fromJSON(data.comprehension ?? {});
        ai.security = Security.fromJSON(data.security ?? {});
        ai.self_improvement_cycles_per_second = data.self_improvement_cycles_per_second ?? 1.0;
        return ai;
    }
}