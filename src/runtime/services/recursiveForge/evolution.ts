import { compileGenomeToComponent, evolveGenome, seedGenomeFromGoal } from './hyperna';
import type {
  EvolutionConfig,
  EvolutionSummary,
  FreudianStack,
  Genome,
  SandboxResult,
  SandboxTelemetry,
} from './types';

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function evaluateFreudian(genome: Genome, telemetry: SandboxTelemetry, emotionIntensity: number): FreudianStack {
  const idDrive = clamp((genome.volatility * 0.55) + ((genome.units.E?.mutation || 0) * 0.25) + (emotionIntensity * 0.25));
  const egoControl = clamp((telemetry.performance * 0.35) + (telemetry.stability * 0.35) + (genome.coherence * 0.3));
  const superegoGuard = clamp((telemetry.safety * 0.45) + (telemetry.explainability * 0.35) + ((1 - genome.volatility) * 0.2));
  return { idDrive, egoControl, superegoGuard };
}

function scoreCandidate(f: FreudianStack, telemetry: SandboxTelemetry): number {
  return (
    (f.idDrive * 0.2)
    + (f.egoControl * 0.4)
    + (f.superegoGuard * 0.4)
    + (telemetry.usability * 0.1)
  );
}

async function simulateSandbox(componentTraits: Record<string, string | number | boolean>, sandboxGB: number, rand: () => number): Promise<SandboxTelemetry> {
  await new Promise((resolve) => setTimeout(resolve, 5));

  const searchBoost = componentTraits.search === 'semantic_vector' ? 0.08 : 0;
  const selfHealingBoost = componentTraits.selfHealing ? 0.07 : 0;
  const strictPrivacyBoost = componentTraits.privacyLevel === 'strict' ? 0.06 : 0;
  const memoryPenalty = sandboxGB < 16 ? 0.12 : 0;

  const performance = clamp(0.58 + searchBoost + (rand() * 0.3) - memoryPenalty);
  const stability = clamp(0.54 + selfHealingBoost + (rand() * 0.32));
  const usability = clamp(0.5 + (rand() * 0.36));
  const safety = clamp(0.62 + strictPrivacyBoost + (rand() * 0.28));
  const explainability = clamp(0.5 + (componentTraits.uiStyle === 'clean_minimal' ? 0.14 : 0.03) + (rand() * 0.3));

  const regressions: string[] = [];
  if (performance < 0.62) regressions.push('perf-below-threshold');
  if (safety < 0.7) regressions.push('safety-hardening-needed');

  return { performance, stability, usability, safety, explainability, regressions };
}

export async function evolveOSFeature(
  goal: string,
  config: EvolutionConfig,
  onGeneration?: (generation: number, best: SandboxResult) => void,
): Promise<EvolutionSummary> {
  const seed = config.seed ?? Date.now();
  const rand = createRng(seed);
  const history: EvolutionSummary['history'] = [];

  let population: Genome[] = Array.from({ length: config.populationSize }, () => seedGenomeFromGoal(goal, config.heresy, rand));
  let bestEver: SandboxResult | null = null;

  const survivorCount = Math.max(2, Math.floor(config.populationSize * clamp(config.survivorRatio, 0.1, 0.8)));

  for (let generation = 1; generation <= config.generations; generation++) {
    const results: SandboxResult[] = [];

    for (const genome of population) {
      const component = compileGenomeToComponent(genome, 'feature');
      const telemetry = await simulateSandbox(component.traits, config.sandboxGB, rand);
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
      const parent = survivors[Math.floor(rand() * survivors.length)];
      const child = evolveGenome(parent, config.heresy, config.emotionIntensity, rand);
      nextPopulation.push(child);
    }

    if (rand() < 0.18) {
      const radicalIdx = Math.floor(rand() * nextPopulation.length);
      nextPopulation[radicalIdx] = evolveGenome(nextPopulation[radicalIdx], clamp(config.heresy * 1.3), 0.95, rand);
    }

    population = nextPopulation;
  }

  return { best: bestEver!, history };
}
