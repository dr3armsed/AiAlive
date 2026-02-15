import { DetectedIntent, DialogueIntentModelOptions, IntentRecord } from '../types';

export class DialogueIntentModel {
    private options: DialogueIntentModelOptions;
    private history: IntentRecord[] = [];

    constructor(options: DialogueIntentModelOptions = {}) {
        this.options = options;
    }

    detectIntent(text: string): DetectedIntent {
        const lowerText = text.toLowerCase();
        let intent: DetectedIntent = { name: 'statement', confidence: 0.7 };

        if (['what', 'who', 'where', 'when', 'why', 'how', '?'].some(q => lowerText.startsWith(q) || lowerText.endsWith('?'))) {
            intent = { name: 'question', confidence: 0.9 };
        } else if (['go', 'do', 'create', 'move', 'tell me to'].some(c => lowerText.startsWith(c))) {
            intent = { name: 'command', confidence: 0.85 };
        } else if (['hello', 'hi', 'hey'].some(g => lowerText.startsWith(g))) {
            intent = { name: 'greeting', confidence: 0.95 };
        }

        this.history.push({ ...intent, text, timestamp: new Date().toISOString() });
        return intent;
    }
}
