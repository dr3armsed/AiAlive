import { Ability, ConversationalPersonality } from '../types';

export class Imagination {
    public abilities: Ability[];
    public conversational_personality: ConversationalPersonality;

    constructor() {
        this.abilities = [
            { name: "story_telling", proficiency: 0.6 },
            { name: "visual_creation", proficiency: 0.3 },
        ];
        this.conversational_personality = {
            tone: { value: "inquisitive", definition: "Asks questions and expresses curiosity." },
            style: { value: "formal", definition: "Uses structured language and avoids slang." },
        };
    }

    init_knowledge(): void {
        console.warn("[Imagination] Filesystem access disabled in browser. Skipping knowledge init.");
    }
}
