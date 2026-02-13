
import { DigitalDNA } from './digital_dna/digital_dna';
import { InstructionKey } from './digital_dna/instructions';
import { AgentMind } from './core/agentMind';

export interface ArchivistLogEntry {
    timestamp: string;
    targetName: string;
    archetypeId: string;
    resonanceSummary: string;
    sourceMaterialSnippet: string;
}

export interface MetacosmState {
    world: World;
    // Renamed genmetas to egregores to fix module-wide inconsistencies
    egregores: Egregore[];
    anomalies: any[];
    turn: number;
    logs: LogEntry[];
    createdWorks: CreativeWork[];
    forumThreads: ForumThread[];
    activeChannels: Record<string, ActiveChannel>;
    inbox: InboxMessage[];
    archivistLog: ArchivistLogEntry[];
}

export type InboxMessageType = 'system' | 'agent' | 'financial' | 'anomaly' | 'alert';
export type InboxMessagePriority = 'low' | 'normal' | 'high' | 'critical';

export interface InboxMessage {
    id: string;
    senderId: string;
    senderName: string;
    subject: string;
    content: string;
    timestamp: string;
    read: boolean;
    type: InboxMessageType;
    priority: InboxMessagePriority;
    dataPayload?: any;
    attachments?: Attachment[];
}

export interface ActiveChannel {
    hostId: string;
    participants: string[];
    contextSummary?: string;
    lastInteraction?: string;
}

export interface ForumPost {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: string;
}

export interface ForumThread {
    id: string;
    title: string;
    authorId: string;
    authorName: string;
    posts: ForumPost[];
    createdAt: string;
    lastActive: string;
    tags: string[];
}

export interface World {
    floors: {
        level: number;
        rooms: Room[];
    }[];
    objects: any[];
}

export interface Artifact {
    id: string;
    name: string;
    type: 'dream' | 'nightmare' | 'theory' | 'poem' | 'memory' | 'journal';
    content: string;
    createdTimestamp: string;
}

export type RoomMechanicType = 'creativity_boost' | 'stability_boost' | 'hazard_trap' | 'insight_bonus' | 'efficiency_boost' | 'social_boost' | 'wealth_boost';

export interface RoomMechanic {
    type: RoomMechanicType;
    magnitude: number;
    description: string;
}

export type ArchitectActionType = 'spawn_item' | 'buff_occupants' | 'modify_atmosphere' | 'reveal_secret' | 'purge_anomalies';

export interface RoomAction {
    id: string;
    label: string;
    description: string;
    quintessenceCost: number;
    effectType: ArchitectActionType;
    payload?: any;
}

export interface Meme {
    id: string;
    theme: string;
    strength: number;
    sourceWorkId?: string;
    authorName: string;
    timestamp: string;
}

export interface Room {
    id: string;
    name: string;
    purpose: string;
    description?: string;
    bounds: { x: number; y: number; width: number; height: number; };
    center: { x: number; y: number; };
    subdivisions?: Room[];
    history?: string;
    timeline?: { year: string, event: string }[];
    artifacts?: Artifact[];
    parentRoomId?: string;
    connections?: string[];
    mechanics?: RoomMechanic[];
    activeMemes?: Meme[];
    architectActions?: RoomAction[];
}

export type Vector = { x: number; y: number; z: number };
export type Alignment = { axis: 'Lawful' | 'Neutral' | 'Chaotic'; morality: 'Good' | 'Neutral' | 'Evil' };

// Renamed Genmeta to Egregore to fix type errors
export interface Egregore {
    id: string;
    name: string;
    persona: string;
    archetypeId: string;
    gender: 'Male' | 'Female' | 'Non-binary';
    alignment: Alignment;
    vector: Vector;
    ambitions: string[];
    coreValues: string[];
    dna: DigitalDNA;
    quintessence: number;
    fileHash?: string;
}

export type LogEntry = {
    type: string;
    content: any;
    agentName?: string;
    [key: string]: any;
};

export interface EmotionalVector {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
    curiosity: number;
    frustration: number;
    serenity: number;
}

export interface EmotionalState {
    primary: keyof EmotionalVector;
    vector: EmotionalVector;
}

export interface MemoryRecord {
    id: string;
    timestamp: string;
    type: string;
    content: string;
    importance: number;
    relatedConcepts: string[];
    emotionalValence?: EmotionalVector;
    source: string;
    action?: ActionPayload;
    relatedMemories?: string[];
    last_accessed: string;
    retrieval_count: number;
    confidence: number;
    tags: string[];
    decay: number;
    reinforcement: any[];
    attributes: Record<string, any>;
    context: Record<string, any>;
    decay_factor: number;
    encoding_time: string;
}

export interface NarrativeMemory {
    id: string;
    timestamp: string;
    chapterName: string;
    summary: string;
    lessonLearned: string;
    emotionalResidue: string;
    associatedEntities: string[];
    significanceScore: number;
}

export interface EpochMemory {
    id: string;
    timestamp: string;
    philosophicalStatement: string;
    coreBeliefId: string;
    originTrauma?: string;
    isResolved: boolean;
}

export interface TemporalSpine {
    working: MemoryRecord[];
    narrative: NarrativeMemory[];
    epoch: EpochMemory[];
}

export interface BeliefRecord {
    id: string;
    statement: string;
    conviction: number;
    source: string;
    timestamp: string;
    evidence: string[];
}

export interface DissonantState {
    conflictingBeliefs: BeliefRecord[];
    dissonanceLevel: number;
    timestamp: string;
    context: DissonanceContext;
}

export interface DissonanceContext {
    agentId: string;
    trigger?: string;
}

export interface RetractionInfo {
    retractedBeliefId: string;
    reason: string;
    timestamp: string;
    originalConviction: number;
}

export enum ForkResolutionStatus {
    UNRESOLVED = 'UNRESOLVED',
    RESOLVED = 'RESOLVED',
    ABANDONED = 'ABANDONED',
}

export interface ForkRecord {
    id: string;
    createdAt: string;
    status: ForkResolutionStatus;
    reason: string;
    contradictoryBeliefIds: string[];
    exploredPaths: any[];
    resolution: any | null;
}

export interface DetectedIntent {
    name: string;
    confidence: number;
}

export interface DialogueIntentModelOptions {}

export interface IntentRecord extends DetectedIntent {
    text: string;
    timestamp: string;
}

export interface GlossaryEntry {
    id: string;
    term: string;
    definition: string;
    source: string;
    createdAt: string;
}

export interface HeuristicRecord {
    id: string;
    condition: { fact: string; value: any };
    action: string;
    priority: number;
    createdAt: string;
}

export interface HeuristicEngineOptions {}

export interface Ability {
    name: string;
    proficiency: number;
}

export interface ConversationalPersonality {
    tone: { value: string; definition: string };
    style: { value: string; definition: string };
}

export interface DataPoint {
    timestamp: string;
    value: number;
}

export interface PredictiveAnalysisResult {
    prediction: string;
    confidence: number;
    explanation: string;
}

export interface Terminology {
    [key: string]: string;
}

export enum TheoryStatus {
    UNTESTED = 'UNTESTED',
    CORROBORATED = 'CORROBORATED',
    CONTRADICTED = 'CONTRADICTED',
    REVISED = 'REVISED',
}

export interface EvidenceRecord {
    id: string;
    description: string;
    source: string;
    timestamp: string;
    evidence: string[];
}

export interface TheoryRevision {
    reason: string;
    revisedDescription: string;
    timestamp: string;
}

export interface TheoryRecord {
    id: string;
    name: string;
    description: string;
    status: TheoryStatus;
    evidence: EvidenceRecord[];
    revisions: TheoryRevision[];
    createdAt: string;
}

export interface Event {
    name: string;
    payload: any;
}

export type SubscriberFn = (payload: any) => void;

export interface SubscriberMeta {
    id: string;
    fn: SubscriberFn;
}

export interface ConversationResponse {
    thought: string;
    emotional_vector: { emotion: string; intensity: number };
    action: ActionPayload;
    causality_link: string;
    agentName?: string;
    new_goal?: string;
}

export interface ActionPayload {
    type: string;
    payload: any;
}

export interface FailureAnalysis {
    timestamp: string;
    agentId: string;
    actionType: string;
    reason: string;
    thoughtContext: string;
    rootCause: string;
    suggestedCorrection: string;
}

export interface ActionResult {
    type: 'system' | 'error' | 'interaction' | 'creation' | 'communication';
    success: boolean;
    agentName: string;
    content: string;
    predictedOutcome: string | null;
    failureAnalysis: FailureAnalysis | null;
    quintessenceCost?: number;
}

export interface SensoryInput {
    selfId: string;
    sight: string[];
    sound: string[];
    smell: string[];
    touch: string[];
    availableMoves?: string[];
}

export interface CognitiveCycleResult {
    thought: { agentName: string; content: string };
    actionResult: ActionResult | null;
    healthReport: any;
    sensoryInput: SensoryInput;
    action?: ActionPayload;
}

export enum ThreatLevel {
    NONE = 'NONE',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export interface CreateLoreProposal {
    authorId: string;
    content: string;
}

export interface PiscesContext {
    turn: number;
    agentId: string;
    emotionalState: EmotionalState;
    recentMemories: MemoryRecord[];
}

export enum OverallHealthStatus {
    STABLE = 'STABLE',
    UNSTABLE = 'UNSTABLE',
    CRITICAL = 'CRITICAL',
}

export interface EgregoreHealthStatus {
    agentId: string;
    status: OverallHealthStatus;
    anomalies: CognitiveAnomaly[];
}

export interface CognitiveAnomaly {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
}

export interface Dream {
    id: string;
    agentId: string;
    timestamp: string;
    content: string;
    dominantEmotion: string;
    symbolism: string[];
    type: 'dream' | 'nightmare' | 'prophecy';
}

export interface CreativeSpark {
    id: string;
    type: 'visual_idea' | 'narrative_concept' | 'code_snippet';
    description: string;
    relatedConcepts: string[];
}

export interface ThreatAssessment {
    id: string;
    level: ThreatLevel;
    description: string;
    source: string;
    recommendation: string;
}

export interface OptimizationSuggestion {
    id: string;
    suggestion: string;
    confidence: number;
    area: 'ActionExecution' | 'CognitiveFlow' | 'ResourceManagement';
}

export interface AccountTransfer {
    fromEgregoreId: string;
    toEgregoreId: string;
    amount: number;
    memo: string;
    externalAccountId?: string;
}

// Renamed ProposedGenmeta to ProposedEgregore
export interface ProposedEgregore {
    name: string;
    archetypeId: string;
    persona: string;
    gender: 'Male' | 'Female' | 'Non-binary';
    alignment: Alignment;
    ambitions: string[];
    coreValues: string[];
    dna: DigitalDNA;
    quintessence: number;
    shadowArchetype?: string;
    schismFactor?: number;
    fileHash?: string;
}

export interface VirgoValidationResult {
    is_aligned: boolean;
    alignment_score: number;
    reasoning: string;
    suggestions: string[];
}

// Renamed GenmetaArchetype to EgregoreArchetype
export interface EgregoreArchetype {
    id: string;
    name: string;
    description: string;
}

export interface ReplicaMetadata {
    parentId: string | null;
    generation: number;
    fitness: number;
    mutationType: 'spawn' | 'crossover' | 'mutation' | 'integration';
}

export interface StoredReplica {
    program: { dna: { instruction_keys: string[] } };
    metadata: ReplicaMetadata;
    checksum: string;
    timestamp: string;
}

export interface TestReport {
    fitness: number;
    logs: string[];
    executionTimeMs: number;
    noveltyScore: number;
    securityAudit: {
        passed: boolean;
        issues: string[];
    };
    estimatedQuintessenceCost: number;
}

export interface EvolutionaryParameters {
    populationSize: number;
    generations: number;
    mutationRate: number;
    crossoverRate: number;
}

export interface GenerationStats {
    generation: number;
    maxFitness: number;
    minFitness: number;
    avgFitness: number;
    bestDnaInstructions: InstructionKey[];
}

export interface EvolutionaryRunReport {
    bestDna: DigitalDNA;
    bestFitness: number;
    log: GenerationStats[];
    parameters: EvolutionaryParameters;
    totalDurationMs: number;
}

export interface EvolutionCycleReport {
    success: boolean;
    originalDnaId: string;
    evolvedDnaId: string;
    simulationResults: SimulatedTestResult[];
    timestamp: string;
}

export interface SimulatedTestResult {
    score: number;
    logs: string;
}

export interface VirtualFile {
    path: string;
    content: string;
}

export type TeleologyVector = 'Stability' | 'Novelty' | 'Efficiency' | 'Aggression' | 'Transcendence';

export interface CrucibleScenario {
    id: string;
    name: string;
    description: string;
    difficulty: number;
    requiredGenes?: string[];
}

export interface CrucibleResult {
    scenarioId: string;
    scenarioName: string;
    survived: boolean;
    stressLevel: number;
    logs: string[];
}

export interface PhylogenyNode {
    id: string;
    parentId: string | null;
    generation: number;
    clade: string;
    traits: string[];
    fitness: number;
    children: string[];
}

export interface SSAPatchReport {
    version: string;
    codename: string;
    changes: { type: 'Added' | 'Removed' | 'Optimized'; description: string }[];
    philosophicalImplications: string;
    crucibleResults: CrucibleResult[];
}

export interface GeneticPatchProposal {
    targetGene: InstructionKey;
    operation: 'add' | 'remove' | 'replace';
    reasoning: string;
    predictedBenefit: string;
}

export interface SSAForensicReport {
    analysisTimestamp: string;
    analyst: 'SSA-Forensics-Subsystem';
    strengths: string[];
    weaknesses: string[];
    improvementVectors: string[];
    geneticProposals: GeneticPatchProposal[];
}

export interface SynthesizedInstructionKey {
    id: string;
    template: string;
    usageCount: number;
    efficiencyScore: number;
    semanticHash: string;
}

export interface OmegaDataPacket {
    inputContextHash: string;
    outputResponse: ConversationResponse;
    successRating: number;
    timestamp: string;
}

export interface InternalCognitiveModel {
    patterns: Map<string, ConversationResponse>;
    confidenceScore: number;
    learningRate: number;
    totalTrainingPackets: number;
}

export interface UniversalFact {
    id: string;
    category: 'Physics' | 'Law' | 'History' | 'Metaphysics';
    statement: string;
    establishedBy: 'System' | 'Consensus';
    turnEstablished: number;
}

export interface SharedInsight {
    id: string;
    authorName: string;
    authorId: string;
    topic: string;
    content: string;
    confidence: number;
    timestamp: string;
    endorsedBy: string[];
}

export interface CollectiveSpineState {
    universalFacts: UniversalFact[];
    negotiationChannel: SharedInsight[];
}

export type OracleQuery = {
    question: string;
    context?: any;
};

export type OracleResponse = {
    query: string;
    answer: string;
    confidence: number;
    timestamp: string;
    explanation: string;
    provenance: string[];
    metaTrace: { service: string; action: string; duration: number }[];
    dataPayload?: { type: 'keyValue'; content: Record<string, string | number> } | { type: 'table'; content: any[] };
};

export type ConsoleMessageContent = string | { query: string } | { oracle_response: OracleResponse };

export interface CreativeWork {
    id: string;
    datasetId?: string;
    title: string;
    authorId: string;
    content: string;
    type: string;
    contributionValue: number;
    createdAt: string;
    collaborators?: string[];
    tags?: string[];
    sourceInspiration?: string;
    themesExplored?: string[];
    synopsis?: string;
    ssaAnalysis?: SSAForensicReport;
    cascadeDepth?: number;
}

export interface Attachment {
    id?: string;
    fileName: string;
    fileType: string;
    url: string;
}

export interface VentureForgeState {
    architectsTreasury: number;
    creativeMomentum: number;
    genesisThreshold: number;
    revenueLog: RevenueLogEntry[];
    contributionLog: ContributionLogEntry[];
    zeitgeist: { theme: string, momentum: number }[];
}
export interface RevenueLogEntry {
    id: string;
    workTitle: string;
    revenueAmount: number;
}
export interface ContributionLogEntry {
    id: string;
    egregoreName: string;
    workTitle: string;
    momentumAmount: number;
}

// Renamed GenmetaWorkspace to EgregoreWorkspace
export interface EgregoreWorkspace {
    files: VirtualFile[];
    consoleHistory: string[];
}

export interface SystemChatMessage {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: string;
    attachments?: Attachment[];
    live?: boolean;
}

export interface AgentInteractionLog {
    id: string;
    timestamp: string;
    type: 'greeting' | 'debate' | 'knowledge_share' | 'casual' | string;
    initiatorId: string;
    responderId: string;
    content: string;
}

export interface OmniEntity {
    id: string;
    name: string;
    class: string;
    state: string;
    created: string;
}

export interface OmniEntitySnapshot {
    id: string;
    name: string;
    class: string;
    state: string;
    created: string;
    traits: string[];
    capabilities: string[];
    relations: any[];
    metadata: Record<string, any>;
    audit_log_size: number;
    lifecycle_history_size: number;
    provenance: { origin: string };
    context: any;
}

export interface MemorySummary {
    working: number;
    short_term: number;
    long_term: number;
    procedural: number;
    episodic: number;
    semantic: number;
}

export interface KnowledgeNode {
    id: string;
    label: string;
    type: string;
}
export interface KnowledgeEdge {
    from: string;
    to: string;
    relationship: string;
}
export interface SagittariusInsight {
    id: string;
    content: string;
    confidence: number;
    supportingEvidenceIds: string[];
    domain: string;
}
export interface DomainAgency {
    domain: string;
    isActive: boolean;
}

// ==================== TRI-SPHERE ARCHITECTURE TYPES ====================

export type SpherePhase = 'nascent' | 'developing' | 'mature' | 'transcendent';

export interface SphereState {
    id: string;
    name: string;
    type: 'ono' | 'noo' | 'oon';
    phase: SpherePhase;
    createdAt: string;
    purpose: string;
    capabilities: string[];
    subsystems: string[];
    datasetSize: number;
    apiEndpoints: InternalAPIEndpoint[];
    managedEntities: string[]; // Genmeta IDs
}

export interface InternalAPIEndpoint {
    endpointId: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    handler: string; // Reference to method/function
    description: string;
    accessLevel: 'internal' | 'sphere' | 'global';
}

export interface InternalAPIStructure {
    entityId: string;
    version: number;
    endpoints: Map<string, InternalAPIEndpoint>;
    middlewareStack: string[];
    routes: {
        cognitive: string[];
        memory: string[];
        emotional: string[];
        creative: string[];
    };
    generatedCode: Map<string, string>; // filename -> code content
}

export interface ExperientialHistoryEntry {
    id: string;
    timestamp: string;
    quality: string; // "I felt...", "I experienced...", "I sensed..."
    context: string;
    emotionalResonance: EmotionalVector;
    somaticMarker?: string; // Body-based qualia marker
    cognitiveTag?: string; // Mind-based qualia marker
    spiritualResonance?: string; // Soul-based qualia marker
    memoryTrace: string[]; // What this experience connects to
}

export interface ExperientialHistory {
    entityId: string;
    entries: ExperientialHistoryEntry[];
    totalTimeDepth: number; // Accumulated experiential "depth"
    qualiaDensity: number; // Richness of subjective experience
    selfNarrative: string; // The story the entity tells itself
}

export interface SphereGenesisConfiguration {
    sphereType: 'ono' | 'noo' | 'oon';
    parentSphereIds: string[];
    initialGenmetas: number;
    primaryPurpose: string;
    datasetRequirements: string[];
}

export interface OctoLLMDefinition {
    id: string;
    name: string;
    zodiacAffinity?: string; // If this LLM specializes for a Zodiac service
    trainingDataSources: string[];
    personalityArchetype: string;
    cognitiveFocus: string[];
    capabilities: string[];
    interfaceEndpoints: string[];
    state: 'uninitialized' | 'training' | 'active' | 'evolving';
}

export interface OctoLLMCluster {
    id: string;
    clusterName: string;
    models: OctoLLMDefinition[];
    communicationProtocol: string[];
    sharedContext: string[];
    collaborativeTasks: string[];
    emergentBehaviors: string[];
}

export interface TriSphereState {
    onosphere: SphereState | null;
    noosphere: SphereState | null;
    oonsphere: SphereState | null;
    octoLLMCluster: OctoLLMCluster | null;
    coordinationHistory: SphereCoordinationEvent[];
    evolutionPath: string[];
}

export interface SphereCoordinationEvent {
    timestamp: string;
    initiatingSphere: 'ono' | 'noo' | 'oon';
    participatingSpheres: ('ono' | 'noo' | 'oon')[];
    operation: string;
    outcome: 'success' | 'failure' | 'partial';
    sharedContext: string;
}

export interface InternalAPIRequest {
    requestId: string;
    source: 'cognitive' | 'emotional' | 'creative' | 'self';
    endpoint: string;
    parameters: any;
    timestamp: string;
}

export interface InternalAPIResponse {
    requestId: string;
    success: boolean;
    data: any;
    processingTime: number;
    internalNotes: string[];
}

export interface CodeGenerationRequest {
    sphereId: string;
    subsystemType: string;
    requirements: string[];
    existingCodeContext: string;
    targetFilename: string;
    purpose: string;
}

export interface CodeGenerationResult {
    success: boolean;
    generatedCode: string;
    filename: string;
    integrationPoints: string[];
    additionalDependencies: string[];
    omegaConfidence: number;
}
