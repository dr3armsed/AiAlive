import { DataPoint, PredictiveAnalysisResult, Terminology } from '../types';

export class PredictiveAnalysis {
    private terminology: Terminology = {
        trend: "The general direction of a series of data points.",
        volatility: "The degree of variation of a trading price series over time.",
    };

    analyze(data: DataPoint[]): PredictiveAnalysisResult {
        if (data.length < 2) {
            return {
                prediction: "Insufficient data for analysis.",
                confidence: 0,
                explanation: "At least two data points are required to establish a trend.",
            };
        }
        
        const last = data[data.length - 1].value;
        const secondLast = data[data.length - 2].value;
        
        let prediction: string;
        if (last > secondLast) {
            prediction = "Uptrend detected. Future values are likely to increase.";
        } else if (last < secondLast) {
            prediction = "Downtrend detected. Future values are likely to decrease.";
        } else {
            prediction = "Stable trend. Future values are likely to remain constant.";
        }
        
        return {
            prediction,
            confidence: 0.75,
            explanation: `Based on the last two data points (${secondLast} -> ${last}), a trend was identified.`,
        };
    }
}
