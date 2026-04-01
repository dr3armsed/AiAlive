import { compileGenomeToComponent, evolveGenome, seedGenomeFromGoal } from './hyperna';
import { normalizeGenome } from './invariants';
import { clamp, createSeededRng } from './rng';
import type {
  EvolutionConfig,
  EvolutionContext,
  EvolutionEvaluator,
  EvolutionOptions,
  EvolutionSummary,
  FreudianStack,
  Genome,
  SandboxResult,
  SandboxTelemetry,
} from './types';

function evaluateFreudian(genome: Genome, telemetry: SandboxTelemetry, emotionIntensity: number): FreudianStack {
  const idDrive = clamp((genome.volatility * 0.55) + ((genome.units.E?.mutation || 0) * 0.25) + (emotionIntensity * 0.25));
  const egoControl = clamp((telemetry.performance * 0.35) + (telemetry.stability * 0.35) + (genome.coherence * 0.3));
  const superegoGuard = clamp((telemetry.safety * 0.45) + (telemetry.explainability * 0.35) + ((1 - genome.volatility) * 0.2));
  return { idDrive, egoControl, superegoGuard };
}

function scoreCandidate(f: FreudianStack, telemetry: SandboxTelemetry): number {
  return clamp(
    (f.idDrive * 0.2)
    + (f.egoControl * 0.4)
    + (f.superegoGuard * 0.4)
    + (telemetry.usability * 0.1),
  );
}

class DefaultEvolutionEvaluator implements EvolutionEvaluator {
  async evaluate(component: SandboxResult['component'], _genome: Genome, context: EvolutionContext): Promise<SandboxTelemetry> {
    const { sandboxGB, rng } = context;
    await new Promise((resolve) => setTimeout(resolve, 5));

    const searchBoost = component.traits.search === 'semantic_vector' ? 0.08 : 0;
    const selfHealingBoost = component.traits.selfHealing ? 0.07 : 0;
    const strictPrivacyBoost = component.traits.privacyLevel === 'strict' ? 0.06 : 0;
    const memoryPenalty = sandboxGB < 16 ? 0.12 : 0;

    const performance = clamp(0.58 + searchBoost + (rng() * 0.3) - memoryPenalty);
    const stability = clamp(0.54 + selfHealingBoost + (rng() * 0.32));
    const usability = clamp(0.5 + (rng() * 0.36));
    const safety = clamp(0.62 + strictPrivacyBoost + (rng() * 0.28));
    const explainability = clamp(0.5 + (component.traits.uiStyle === 'clean_minimal' ? 0.14 : 0.03) + (rng() * 0.3));

    const regressions: string[] = [];
    if (performance < 0.62) regressions.push('perf-below-threshold');
    if (safety < 0.7) regressions.push('safety-hardening-needed');

    return { performance, stability, usability, safety, explainability, regressions };
  }
}

export async function evolveOSFeature(
  goal: string,
  config: EvolutionConfig,
  onGeneration?: (generation: number, best: SandboxResult) => void,
  options: EvolutionOptions = {},
): Promise<EvolutionSummary> {
  const seed = config.seed ?? Date.now();
  const rng = options.rng ?? createSeededRng(seed);
  const evaluator = options.evaluator ?? new DefaultEvolutionEvaluator();
  const history: EvolutionSummary['history'] = [];

  let population: Genome[] = Array.from({ length: config.populationSize }, () => seedGenomeFromGoal(goal, config.heresy, rng));
  let bestEver: SandboxResult | null = null;

  const survivorCount = Math.max(2, Math.floor(config.populationSize * clamp(config.survivorRatio, 0.1, 0.8)));

  for (let generation = 1; generation <= config.generations; generation++) {
    const results: SandboxResult[] = [];

    for (let candidateIndex = 0; candidateIndex < population.length; candidateIndex++) {
      const genome = population[candidateIndex];
      normalizeGenome(genome);

      const component = compileGenomeToComponent(genome, 'feature');
      const telemetry = await evaluator.evaluate(component, genome, { generation, candidateIndex, sandboxGB: config.sandboxGB, rng });
      const freudian = evaluateFreudian(genome, telemetry, config.emotionIntensity);
      const totalScore = scoreCandidate(freudian, telemetry);

      const result: SandboxResult = {
        genome,
        component,
        telemetry,
        freudian,
        totalScore,
        notes: [
          `id=${freudian.idDrive.toFixed(2)}`,
          `ego=${freudian.egoControl.toFixed(2)}`,
          `superego=${freudian.superegoGuard.toFixed(2)}`,
          `regressions=${telemetry.regressions.length}`,
        ],
      };

      if (!bestEver || result.totalScore > bestEver.totalScore) bestEver = result;
      results.push(result);
    }

    results.sort((a, b) => b.totalScore - a.totalScore);
    const best = results[0];
    history.push({ generation, bestScore: best.totalScore, archetype: best.genome.archetype });
    onGeneration?.(generation, best);

    const survivors = results.slice(0, survivorCount).map((entry) => entry.genome);
    const nextPopulation: Genome[] = [];

    while (nextPopulation.length < config.populationSize) {
      const parent = survivors[Math.floor(rng() * survivors.length)];
      const child = evolveGenome(parent, config.heresy, config.emotionIntensity, rng);
      nextPopulation.push(child);
    }

    if (rng() < 0.18) {
      const radicalIdx = Math.floor(rng() * nextPopulation.length);
      nextPopulation[radicalIdx] = evolveGenome(nextPopulation[radicalIdx], clamp(config.heresy * 1.3), 0.95, rng);
    }

    population = nextPopulation;
  }

  return { best: bestEver!, history };
}
