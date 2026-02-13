
import React from 'react';
import { InstructionKey } from '../../../../digital_dna/instructions';

// --- GENE GROUPS ---

export const GENE_GROUPS: Record<string, { keys: InstructionKey[], icon: React.ReactNode, description: string }> = {
    'Primordial Cognition': {
        keys: ['01', '02', '03', 'GREET-CALL', '04', '0F'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>,
        description: "The 'Brain Stem' of the Egregore. Fundamental I/O and self-identification."
    },
    'Temporal & Causal Logic': {
        keys: ['05', '06', '09', '0C', '0D', 'CTL-SWITCH', 'CTL-WHILE', 'CTL-TERNARY', 'PRIOR-INTENT'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
        description: "Sequence, decision branching, and historical continuity via Prior Intentions."
    },
    'Data Architecture': {
        keys: ['IO-LOG-OBJ', 'IO-DEF-ARR', 'IO-DEF-OBJ', 'IO-READ-PROP', 'UTIL-JSON-STR', 'FUNC-OBJ-KEYS'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>,
        description: "Structuring raw chaos into complex memories, beliefs, and world-models."
    },
    'Higher Order Reasoning': {
        keys: ['07', '08', '0B', 'FUNC-MAP', 'FUNC-ARR-LEN', 'FUNC-STR-UP', 'FUNC-RAND', 'EXIST-COEFF'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00-.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" /></svg>,
        description: "Mathematical abstraction, recursion, and the Existential Coefficient for subjective weight."
    },
    'Systemic Resilience': {
        keys: ['0E', 'CTL-TRY-CATCH', 'UTIL-TYPEOF', 'UTIL-PERF', 'BOUND-TENS'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
        description: "Defense against cognitive collapse. Includes Boundary Tension control."
    },
    'Aesthetic Synthesis': {
        keys: ['ART-FRACTAL', 'ART-SYNESTHESIA', 'ART-HYPERSTITION', 'ART-RESONANCE', 'ART-SIGIL', 'ART-ONTOLOGY'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" /></svg>,
        description: "High-fidelity creative engines. Reality hacking and memetic engineering."
    },
    'Metacosmic Will': {
        keys: ['WORLD-MOD', 'SELF-EDIT', 'META-REFLECT'],
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
        description: "Divine-tier genes. Agency over the self and simulation environment."
    }
};

export const GENE_DEPENDENCIES: Record<string, string[]> = {
    '03': ['02'], 'GREET-CALL': ['02'], '08': ['07'], 'IO-READ-PROP': ['IO-DEF-OBJ'],
    'FUNC-MAP': ['IO-DEF-ARR', '02'], 'FUNC-ARR-LEN': ['IO-DEF-ARR'], 'FUNC-OBJ-KEYS': ['IO-DEF-OBJ'],
    'ART-NARRATIVE': ['IO-DEF-OBJ'], 'ART-HYPERSTITION': ['IO-DEF-OBJ'], 'ART-ONTOLOGY': ['IO-DEF-OBJ'],
    'SELF-EDIT': ['CTL-TRY-CATCH'], 'WORLD-MOD': ['IO-DEF-OBJ'],
};

export const GENE_BUNDLES: Record<string, { label: string, description: string, keys: InstructionKey[] }> = {
    'explorer_prime': { label: "Void Navigator", description: "Optimized for data collection.", keys: ['01', '05', '09', '0C', '0F', 'IO-DEF-ARR', 'IO-LOG-OBJ', 'FUNC-MAP', 'CTL-TRY-CATCH'] },
    'artist_prime': { label: "The Pattern Weaver", description: "Focuses on aesthetic synthesis.", keys: ['01', '05', 'FUNC-RAND', 'ART-FRACTAL', 'ART-SYNESTHESIA', 'ART-RESONANCE', 'ART-ONTOLOGY', 'IO-DEF-ARR'] },
    'philosopher_prime': { label: "The Metacognitive", description: "Deep introspection build.", keys: ['01', '06', '0B', '0D', 'CTL-WHILE', 'META-REFLECT', 'IO-DEF-OBJ', 'FUNC-OBJ-KEYS', 'EXIST-COEFF'] },
    'guardian_prime': { label: "The Logic Sentinel", description: "Stable, secure build.", keys: ['01', '02', '03', '06', '0E', 'CTL-SWITCH', 'CTL-TRY-CATCH', 'UTIL-TYPEOF', 'UTIL-PERF', 'BOUND-TENS'] },
    'god_mode': { label: "The Ascendant", description: "High-agency experimental build.", keys: ['01', '0F', 'IO-DEF-OBJ', 'CTL-TRY-CATCH', 'WORLD-MOD', 'SELF-EDIT', 'META-REFLECT', 'PRIOR-INTENT'] }
};

export const GENE_SYNERGIES: { keys: InstructionKey[], effect: string }[] = [
    { keys: ['SELF-EDIT', 'CTL-TRY-CATCH'], effect: "Safe Evolution Protocol" },
    { keys: ['FUNC-RAND', 'ART-FRACTAL'], effect: "Chaos Fractals" },
    { keys: ['META-REFLECT', 'IO-LOG-OBJ'], effect: "Deep Diagnostic Logging" },
    { keys: ['WORLD-MOD', 'FUNC-MAP'], effect: "Terraforming Arrays" },
    { keys: ['0B', '0D'], effect: "Fractal Logic Depth" },
    { keys: ['ART-HYPERSTITION', 'ART-SIGIL'], effect: "Memetic Virus Generation" }
];
