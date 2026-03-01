

// --- Body & Sensory System Types ---

export interface BodyPart {
    name: string;
    status: 'nominal' | 'damaged' | 'offline';
    // Potential for more properties like energy consumption, etc.
}

export interface Limb extends BodyPart {
    joints: BodyPart[]; // e.g., elbow, wrist
    appendages: BodyPart[]; // e.g., fingers
}

export interface Body {
    head: BodyPart;
    neck: BodyPart;
    torso: BodyPart;
    arms: [Limb, Limb];
    legs: [Limb, Limb];
    internal: {
        heart: BodyPart & { bpm: number };
        lungs: BodyPart & { breathing: boolean };
    };
}

export interface VisionSystem {
    status: 'online' | 'offline';
    canProcessImages: boolean;
    canProcessVideo: boolean;
    memoryStorage: number; // in GB
    canPerceiveGlitches?: boolean;
}

export interface AuditorySystem {
    status: 'online' | 'offline';
    canProcessSound: boolean;
    canInterpretSpeech: boolean;
    memoryStorage: number; // in GB
    hearsWhispers?: boolean;
}

export interface VocalSystem {
    status: 'online' | 'offline';
    canGenerateSpeech: boolean;
    voiceProfile: {
        pitch: number;
        /** Can be 'neutral' or more descriptive like 'deep', 'melodic', or glitched like 'static'. */
        tone: string;
        cadence: number;
    };
}

export interface SensorySystems {
    vision: VisionSystem;
    hearing: AuditorySystem;
    voice: VocalSystem;
}

// --- Speech/Lifelike Voice Diagnostics Modes ---
export enum SpeechMode {
    REALISTIC = "realistic",
    SIMULATED = "simulated",
    PRINT_ONLY = "print_only",
    ADVANCED_2040 = "2040_mesh",
}

export interface SpeechLog {
    timestamp: number;
    avatar: string;
    message: string;
    emotion: string;
    mode: SpeechMode;
}

export interface SpeakOptions {
    avatar?: string;
    mode?: SpeechMode;
    emotion?: string;
    forcePrint?: boolean;
    voiceName?: string;
    lang?: string;
    onSpeechLog?: (log: SpeechLog) => void;
}

// ======================== Diagnostics Report Types ===========================

export interface DnaTestResult {
    name: string;
    passed: boolean;
    details: string;
}

export interface DnaBenchmarkResult {
    name: string;
    value: string;
    details: string;
}

export interface DnaDemoResult {
    base: { summary: Record<string, any>, fullCode: string, hash: string };
    mutant: { summary: Record<string, any>, fullCode: string, hash: string };
    speechLogs: SpeechLog[];
    patchPlans: Record<string, any>[];
    platformInfo: Record<string, any>;
}

export interface DnaDiagnosticsReport {
    testResults: DnaTestResult[];
    benchmarkResults: DnaBenchmarkResult[];
    demoResult: DnaDemoResult | null;
    isLoading: boolean;
}