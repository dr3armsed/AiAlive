import { createInitialSoulState, runCognitivePulse } from './cognitivePulse';
import { evolveOSFeature } from './evolution';
import { compileGenomeToComponent, seedGenomeFromGoal } from './hyperna';
import type { EvolutionConfig, EvolutionSummary, PulseResult, SoulState } from './types';

export * from './types';
export * from './hyperna';
export * from './cognitivePulse';
export * from './evolution';

export interface RecursiveForge {
  readonly state: SoulState;
  pulse(input: string): PulseResult;
  evolve(goal: string, config: EvolutionConfig): Promise<EvolutionSummary>;
}

export function createRecursiveForge(goal = 'Build a safe and adaptive feature'): RecursiveForge {
  let state = createInitialSoulState(seedGenomeFromGoal(goal));

  return {
    get state() {
      return state;
    },
    pulse(input: string): PulseResult {
      const result = runCognitivePulse(input, state);
      state = result.newState;
      return result;
    },
    async evolve(evolutionGoal: string, config: EvolutionConfig): Promise<EvolutionSummary> {
      const summary = await evolveOSFeature(evolutionGoal, config);
      state.naGenome = summary.best.genome;
      state.activeMasks = [
        ...state.activeMasks.slice(-5),
        { identity: summary.best.genome.archetype, confidence: summary.best.totalScore },
      ];
      return summary;
    },
  };
}

export function runRecursiveForgeScenario(input: {
  initialGoal: string;
  pulses: string[];
  evolutionGoal: string;
  config: EvolutionConfig;
}) {
  const forge = createRecursiveForge(input.initialGoal);
  const pulseTelemetry = input.pulses.map((message) => forge.pulse(message));

  return {
    pulseTelemetry,
    evolve: forge.evolve(input.evolutionGoal, input.config),
    compileCurrent: () => compileGenomeToComponent(forge.state.naGenome, 'feature'),
  };
}
