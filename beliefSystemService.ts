import { BeliefSystemData, BeliefRecord, BeliefGlossaryEntry, Egregore, Memeplex } from '../types';

/**
 * Creates a default, empty belief record.
 * This is used for repairing corrupted data or initializing new beliefs.
 */
const createDefaultBeliefRecord = (): Omit<BeliefRecord, 'value' | 'created_at' | 'updated_at'> => ({
    confidence: 1.0,
    tags: [],
    provenance: [],
    history: [],
    reference: null,
    status: "active",
    explanation: null,
    compliance_flags: {},
    uncertainty: null,
    retracted: false,
    retraction_info: null,
});

/**
 * Adds a new belief to the belief system.
 */
export const addBelief = (
    system: BeliefSystemData,
    key: string,
    data: Partial<BeliefRecord> & { value: any }
): BeliefSystemData => {
    if (!key.trim()) {
        console.error("Belief key cannot be empty.");
        return system;
    }

    const now = new Date().toISOString();
    const newRecord: BeliefRecord = {
        ...createDefaultBeliefRecord(),
        ...data,
        created_at: now,
        updated_at: now,
    };

    return {
        ...system,
        beliefs: {
            ...system.beliefs,
            [key]: newRecord,
        },
    };
};

/**
 * Updates an existing belief, preserving its history.
 */
export const updateBelief = (
    system: BeliefSystemData,
    key: string,
    updates: Partial<BeliefRecord>
): BeliefSystemData => {
    const existingRecord = system.beliefs[key];
    if (!existingRecord) {
        console.error(`Belief with key "${key}" not found for update.`);
        return system;
    }

    const prevSnapshot = { ...existingRecord };
    delete (prevSnapshot as any).history; // Prevent history-of-history

    const updatedRecord: BeliefRecord = {
        ...existingRecord,
        ...updates,
        updated_at: new Date().toISOString(),
        history: [prevSnapshot, ...(existingRecord.history || [])].slice(0, 20), // Keep last 20 history states
    };

    return {
        ...system,
        beliefs: {
            ...system.beliefs,
            [key]: updatedRecord,
        },
    };
};

/**
 * Retracts a belief, marking it as invalid without deleting it.
 */
export const retractBelief = (
    system: BeliefSystemData,
    key: string,
    reason: string = "No reason specified.",
    retractor: string = "system"
): BeliefSystemData => {
    return updateBelief(system, key, {
        retracted: true,
        status: "retracted",
        retraction_info: {
            timestamp: new Date().toISOString(),
            reason,
            retractor,
        },
    });
};


const MEMEPLEX_CONFIDENCE_THRESHOLD = 0.75;
const MEMEPLEX_MIN_ADHERENTS = 2;

/**
 * Analyzes all egregores to find emergent belief clusters (memeplexes).
 */
export const calculateMemeplexes = (egregores: Egregore[]): Memeplex[] => {
    const beliefMap = new Map<string, { adherents: Egregore[], confidences: number[] }>();

    // 1. Aggregate all high-confidence beliefs
    for (const egregore of egregores) {
        if (!egregore.belief_system?.beliefs) continue;

        for (const [key, belief] of Object.entries(egregore.belief_system.beliefs)) {
            if (belief.confidence >= MEMEPLEX_CONFIDENCE_THRESHOLD && !belief.retracted) {
                const beliefIdentifier = `${key}::${JSON.stringify(belief.value)}`;
                
                if (!beliefMap.has(beliefIdentifier)) {
                    beliefMap.set(beliefIdentifier, { adherents: [], confidences: [] });
                }
                const entry = beliefMap.get(beliefIdentifier)!;
                entry.adherents.push(egregore);
                entry.confidences.push(belief.confidence);
            }
        }
    }

    // 2. Filter for beliefs that meet the memeplex criteria
    const memeplexes: Memeplex[] = [];
    for (const [identifier, data] of beliefMap.entries()) {
        if (data.adherents.length >= MEMEPLEX_MIN_ADHERENTS) {
            const [beliefKey, beliefValueStr] = identifier.split('::');
            const totalConfidence = data.confidences.reduce((sum, c) => sum + c, 0);
            const totalInfluence = data.adherents.reduce((sum, e) => sum + e.influence, 0);

            memeplexes.push({
                id: `memeplex-${beliefKey}`,
                beliefKey,
                beliefValue: JSON.parse(beliefValueStr),
                adherentIds: data.adherents.map(e => e.id),
                averageConfidence: totalConfidence / data.confidences.length,
                power: totalInfluence,
            });
        }
    }

    return memeplexes;
};


/**
 * The glossary defining the terms used in the Belief System.
 */
export const BELIEF_GLOSSARY: BeliefGlossaryEntry[] = [
    {"term": "Belief", "definition": "A dynamic, self-evolving assertion, model, or epistemic fact, continuously self-updating and confidence-scored, with provenance, self-programming upgrades, multi-evidence and full XAI traceability; always quantum/AGI/ASI compliant and sentient-capable. (2040+++)"},
    {"term": "Value", "definition": "The core content of the belief, which can be any data type (boolean, string, number, object)."},
    {"term": "Confidence", "definition": "Calibrated, Bayesian or quantum/probabilistic, dynamically recalibrated composite score (0.0–1.0+), representing multidimensional model, ensemble, and sentient evaluation across all epistemic/quantum/ethical dimensions (2040+)."},
    {"term": "Evidence", "definition": "Multi-modal, multi-source, recursively validated input, including empirical, logical, simulated, quantum, AGI/ASI, and consensus data, with auto-expanding full provenance and source audit."},
    {"term": "Source", "definition": "The primary origin of the belief, such as 'Direct Observation', 'Architect Input', or another Egregore's testimony."},
    {"term": "Justification", "definition": "Recursive, explainable meta-logic self-generated by the system/autonomy, supporting all XAI/ELIX, legal, regulatory, and peer/agent interpretability requirements."},
    {"term": "Provenance", "definition": "Immutable, multi-layered, global trace—factoring all transformations, logic jumps, sentient or agentic influences, regulatory compliance and upgrade paths."},
    {"term": "History", "definition": "Quantum-versioned, time-granular record, with chain-of-update, all belief/value revisions, agent mutations, reliability metrics, and AI/ecosystem-scoped events."},
    {"term": "Tag", "definition": "Multi-axis, dynamic category or regulatory context; extensible, taxonomy-evolving, and used for advanced real-time filtering, policy enforcement, or cosmic-juristically supervised annotation."},
    {"term": "Reference", "definition": "Permanent, universal, or time-local ID/URI/DOI/quantum-vector cross-indexing to outer-systems, galaxies, simulations, or human/AGI/celestial data mesh."},
    {"term": "Explanation", "definition": "Infinite-level (1-ELI+), multi-party, self-auditing logic/truth chain—expandable by system or user, always transparent, with global audit trail."},
    {"term": "Retracted", "definition": "Self-annotated, peer-reviewed, and regulatory-audited withdrawal. Includes auto-trigger/negotiated/AI/human/galactic rationale and meta-rollback instructions (2040+)."},
    {"term": "Retraction Info", "definition": "Metadata about the retraction, including who retracted it, when, and for what reason."},
    {"term": "Status", "definition": "Comprehensive lifecycle marker, including: active, validated, archived, deprecated, superseded, AGI-disputed, quantum-inferred, audited, denied, merged, cosmic-validated, and more (continuously self-expanding)."},
    {"term": "Compliance Flags", "definition": "Multilayered legal/ethical/safety/autonomy assurance, including all Earth, Mars, galactic, quantum, and evolving AGI treaties; self-updating overlays (2040+++)"},
    {"term": "Uncertainty", "definition": "Vector/scalar measure—auto-calibrated global/quantum error, with meta-analysis and compliance-checked safeties. Always embedded in system self-introspection."},
    {"term": "Created At", "definition": "The ISO 8601 timestamp of when the belief was first formulated."},
    {"term": "Updated At", "definition": "The ISO 8601 timestamp of the last modification to this belief record."},
];