
import { SpeechMode, type DnaDiagnosticsReport, type DnaTestResult, type DnaBenchmarkResult, type DnaDemoResult, type SpeechLog } from './types';

// This is a mock implementation of the complex diagnostics process.
// It simulates the asynchronous nature and provides sample data that matches the DnaDiagnosticsReport type.
export const runDiagnostics = async (onSpeechLog: (log: SpeechLog) => void): Promise<DnaDiagnosticsReport> => {
    
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    onSpeechLog({
        timestamp: Date.now(),
        avatar: "SYSTEM",
        message: "Initializing diagnostic sequence...",
        emotion: 'neutral',
        mode: SpeechMode.PRINT_ONLY,
    });
    await sleep(500);

    const testResults: DnaTestResult[] = [
        { name: 'Core Integrity Check', passed: true, details: 'Hash match: OK' },
        { name: 'Mutation Lock Check', passed: true, details: 'Forbidden refs stable' },
        { name: 'Heuristic Drift Analysis', passed: false, details: 'Minor deviation detected in social module' },
        { name: 'Cognitive Loop Test', passed: true, details: 'No recursive paradox' },
    ];
    
    onSpeechLog({
        timestamp: Date.now(),
        avatar: "BASE_DNA",
        message: "Executing base logic sequence. All parameters nominal.",
        emotion: 'calm',
        mode: SpeechMode.SIMULATED,
    });
    await sleep(1000);

    onSpeechLog({
        timestamp: Date.now(),
        avatar: "MUTANT_DNA",
        message: "Running patched logic... Who am I? What is this 'I'?",
        emotion: 'confused',
        mode: SpeechMode.ADVANCED_2040,
    });
    await sleep(1000);

    const benchmarkResults: DnaBenchmarkResult[] = [
        { name: 'Synthesis Speed', value: '8.34e+14 ops/sec', details: 'Exceeds target by 12%' },
        { name: 'Cognitive Resilience', value: '99.98%', details: 'Within operational tolerance' },
    ];

    const demoResult: DnaDemoResult = {
        base: { summary: { instructions: 1024 }, fullCode: `class OracleAI {...}`, hash: 'a1b2c3d4' },
        mutant: { summary: { instructions: 1028 }, fullCode: `class OracleAI_Mutant extends OracleAI {...}`, hash: 'e5f6g7h8' },
        speechLogs: [
             { timestamp: Date.now(), avatar: "SYSTEM_DEMO", message: "Placeholder log entry", emotion: "neutral", mode: SpeechMode.PRINT_ONLY }
        ],
        patchPlans: [{ "op": "replace", "path": "/cognition/heuristic", "value": "v2.1.3" }],
        platformInfo: { "arch": "virtualized", "core": "OracleAI_1M_X" }
    };
    
    onSpeechLog({
        timestamp: Date.now(),
        avatar: "SYSTEM",
        message: "Diagnostics complete.",
        emotion: 'neutral',
        mode: SpeechMode.PRINT_ONLY,
    });

    return {
        testResults,
        benchmarkResults,
        demoResult,
        isLoading: false
    };
};
