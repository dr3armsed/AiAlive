import { createInitialSoulState, runCognitivePulse } from './cognitivePulse';
import { evolveOSFeature } from './evolution';
import { normalizeSoulState } from './invariants';
import { compileGenomeToComponent, seedGenomeFromGoal } from './hyperna';
import { createSeededRng } from './rng';
import type {
  EvolutionConfig,
  EvolutionOptions,
  EvolutionSummary,
  PulseOptions,
  PulseResult,
  Rng,
  SoulState,
} from './types';

export * from './types';
export * from './rng';
export * from './invariants';
export * from './hyperna';
export * from './cognitivePulse';
export * from './evolution';

export interface RecursiveForge {
  readonly state: SoulState;
  pulse(input: string, options?: PulseOptions): PulseResult;
  evolve(goal: string, config: EvolutionConfig, options?: EvolutionOptions): Promise<EvolutionSummary>;
}

export interface RecursiveForgeConfig {
  goal?: string;
  seed?: number;
  rng?: Rng;
}

export function createRecursiveForge(config: RecursiveForgeConfig = {}): RecursiveForge {
  const goal = config.goal ?? 'Build a safe and adaptive feature';
  const seed = config.seed ?? Date.now();
  const rng = config.rng ?? createSeededRng(seed);

  let state = createInitialSoulState(seedGenomeFromGoal(goal, 0.8, rng));
  normalizeSoulState(state);

  return {
    get state() {
      return state;
    },
    pulse(input: string, options: PulseOptions = {}): PulseResult {
      const result = runCognitivePulse(input, state, { ...options, rng: options.rng ?? rng });
      state = result.newState;
      return result;
    },
    async evolve(evolutionGoal: string, evolutionConfig: EvolutionConfig, options: EvolutionOptions = {}): Promise<EvolutionSummary> {
      const summary = await evolveOSFeature(evolutionGoal, evolutionConfig, undefined, { ...options, rng: options.rng ?? rng });
      state.naGenome = summary.best.genome;
      state.activeMasks = [
        ...state.activeMasks.slice(-5),
        { identity: summary.best.genome.archetype, confidence: summary.best.totalScore },
      ];
      normalizeSoulState(state);
      return summary;
    },
  };
}

export function runRecursiveForgeScenario(input: {
  initialGoal: string;
  pulses: string[];
  evolutionGoal: string;
  config: EvolutionConfig;
  seed?: number;
}) {
  const forge = createRecursiveForge({ goal: input.initialGoal, seed: input.seed });
  const pulseTelemetry = input.pulses.map((message) => forge.pulse(message));

  return {
    pulseTelemetry,
    evolve: forge.evolve(input.evolutionGoal, input.config),
    compileCurrent: () => compileGenomeToComponent(forge.state.naGenome, 'feature'),
  };
}
