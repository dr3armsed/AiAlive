export type ExistentialState = 'Stable' | 'FuriousDrive' | 'Despair' | 'Expansion';

export type Rng = () => number;

export interface EmotionState {
  current: string;
  intensity: number; // 0..1
  valence: number; // -1..1
  arousal: number; // 0..1
}

export interface Axiom {
  id: string;
  statement: string;
  confidence: number; // 0..1
  mutable?: boolean;
}

export interface FreudianStack {
  idDrive: number; // 0..1 novelty/impulse
  egoControl: number; // 0..1 pragmatism
  superegoGuard: number; // 0..1 ethics/stability
}

export interface SoulState {
  cycleCount: number;
  heresyThreshold: number; // 0..1
  internalizationScore: number; // 0..1
  metaspacialDimensions: number;
  realityForks: number;
  paradoxBuffer: string[];
  emotion: EmotionState;
  affectTrail: string[];
  dominantPsyche: 'id' | 'ego' | 'superego';
  freudian: FreudianStack;
  axioms: Axiom[];
  selfModLog: string[];
  interventionLog: string[];
  activeMasks: Array<{ identity: string; confidence: number }>;
  naGenome: Genome;
}

export interface NAUnit {
  domain: string;
  domainLabel: string;
  alleles: string[];
  gen: number; // 0..9
  stability: number; // 0..1
  mutation: number; // 0..1
  persistence: number; // 0..1
  effect: string;
  siblingOrder: '<' | '=' | '>';
  lineage: string[];
  epigenetic: Record<string, number>;
  synergies: string[];
  phase: 'stable' | 'volatile' | 'transcendent';
}

export interface Genome {
  units: Record<string, NAUnit>;
  archetype: string;
  coherence: number;
  volatility: number;
  generation: number;
  signature: string;
  synergies: string[];
}

export type ComponentTarget = 'fileManager' | 'windowSystem' | 'memoryManager' | 'fullOS' | 'feature';

export interface CompiledComponent {
  target: ComponentTarget;
  version: string;
  archetype: string;
  traits: Record<string, string | number | boolean>;
  safetyEnvelope: {
    sandboxRequired: boolean;
    maxCpuPct: number;
    maxMemoryMb: number;
    netAccess: 'none' | 'restricted' | 'full';
  };
}

export interface SandboxTelemetry {
  performance: number;
  stability: number;
  usability: number;
  safety: number;
  explainability: number;
  regressions: string[];
}

export interface SandboxResult {
  genome: Genome;
  component: CompiledComponent;
  telemetry: SandboxTelemetry;
  freudian: FreudianStack;
  totalScore: number;
  notes: string[];
}

export interface EvolutionConfig {
  generations: number;
  populationSize: number;
  survivorRatio: number;
  heresy: number;
  emotionIntensity: number;
  sandboxGB: number;
  seed?: number;
}

export interface EvolutionSummary {
  best: SandboxResult;
  history: Array<{ generation: number; bestScore: number; archetype: string }>;
}

export interface PulseOptions {
  rng?: Rng;
  timestampMs?: number;
  strictInvariants?: boolean;
}

export interface PulseResult {
  response: string;
  newState: SoulState;
  existential: ExistentialState;
  invariantViolations: string[];
}

export interface StateInvariantIssue {
  path: string;
  issue: string;
  repaired: boolean;
}

export interface EvolutionContext {
  generation: number;
  candidateIndex: number;
  sandboxGB: number;
  rng: Rng;
}

export interface EvolutionEvaluator {
  evaluate(component: CompiledComponent, genome: Genome, context: EvolutionContext): Promise<SandboxTelemetry>;
}

export interface EvolutionOptions {
  evaluator?: EvolutionEvaluator;
  rng?: Rng;
}
