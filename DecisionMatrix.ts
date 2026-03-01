// Represents the decision-making component of the Oracle AI.
export class DecisionMatrix {
    learning_rate: number;
    parallelism: number;

    constructor() {
        this.learning_rate = 1.0;
        this.parallelism = 1;
    }
    
    update_learning_rate(feedback: number) {
        if (feedback > 0) {
            this.learning_rate *= 1.05;
        } else {
            this.learning_rate *= 0.95;
        }
    }
    
    static fromJSON(data: any): DecisionMatrix {
        const matrix = new DecisionMatrix();
        matrix.learning_rate = data.learning_rate ?? 1.0;
        matrix.parallelism = data.parallelism ?? 1;
        return matrix;
    }
}
