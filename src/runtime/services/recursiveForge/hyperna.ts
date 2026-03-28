import type { CompiledComponent, ComponentTarget, Genome, NAUnit } from './types';

export const NA_DOMAIN_MAP: Record<string, string> = {
  A: 'Awareness', B: 'Behavior', C: 'Cognition', D: 'CoreIdentity', E: 'Emotion', F: 'Function',
  G: 'Growth', H: 'Heuristics', I: 'Intuition', J: 'Judgment', K: 'Knowledge', L: 'Learning',
  M: 'Memory', N: 'Network', O: 'Objectives', P: 'Personality', Q: 'Curiosity', R: 'Reaction',
  S: 'Sensory', T: 'Time', U: 'Utility', V: 'Values', W: 'WorldModel', X: 'Mutation',
  Y: 'Reflection', Z: 'Override',
};

const GEN_TRAIT_MAP: Record<number, Pick<NAUnit, 'stability' | 'mutation' | 'persistence' | 'effect'>> = {
  0: { stability: 0.1, mutation: 1.0, persistence: 0.1, effect: 'transformative' },
  1: { stability: 0.9, mutation: 0.1, persistence: 0.9, effect: 'stabilizing' },
  2: { stability: 0.8, mutation: 0.15, persistence: 0.85, effect: 'grounding' },
  3: { stability: 0.7, mutation: 0.2, persistence: 0.8, effect: 'resilient' },
  4: { stability: 0.62, mutation: 0.28, persistence: 0.75, effect: 'adaptive_stable' },
  5: { stability: 0.5, mutation: 0.5, persistence: 0.5, effect: 'balanced' },
  6: { stability: 0.42, mutation: 0.62, persistence: 0.4, effect: 'reactive' },
  7: { stability: 0.32, mutation: 0.72, persistence: 0.3, effect: 'dynamic' },
  8: { stability: 0.24, mutation: 0.82, persistence: 0.2, effect: 'experimental' },
  9: { stability: 0.12, mutation: 0.92, persistence: 0.1, effect: 'chaotic' },
};

const SYNERGY_RULES: Array<{ when: (units: Record<string, NAUnit>) => boolean; grants: string[] }> = [
  { when: (u) => (u.C?.gen ?? 0) > 6 && (u.E?.gen ?? 0) > 6, grants: ['ResonantIntuition', 'DeepPatternInsight'] },
  { when: (u) => (u.X?.mutation ?? 0) > 0.8 && (u.Z?.gen ?? 0) > 7, grants: ['ChaoticOverride', 'RadicalRewrite'] },
  { when: (u) => (u.G?.stability ?? 0) > 0.75 && (u.M?.persistence ?? 0) > 0.75, grants: ['AdaptiveMemory', 'SelfHealingGrowth'] },
  { when: (u) => (u.P?.mutation ?? 0) > 0.7 && (u.V?.stability ?? 0) > 0.7, grants: ['PrincipledCreativity'] },
  { when: (u) => (u.Q?.mutation ?? 0) > 0.78 && (u.I?.gen ?? 0) > 5, grants: ['ExploratoryInsight', 'MetaCuriosity'] },
];

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min: number, max: number, rand = Math.random): number {
  return min + (max - min) * rand();
}

export function parseNAUnit(token: string): NAUnit | null {
  const match = token.match(/^([A-Z])?([a-zA-Z]*)(\d+)?$/i);
  if (!match) return null;

  let domain = (match[1] || 'N').toUpperCase();
  const alleleString = match[2] || 'Nn';
  const gen = clamp(Number.parseInt(match[3] || '5', 10), 0, 9);
  if (!NA_DOMAIN_MAP[domain]) domain = 'N';

  const alleles = [...alleleString].filter((ch) => /[a-zA-Z]/.test(ch));
  if (alleles.length === 0) alleles.push('N', 'n');
  if (alleles.length === 1) alleles.push(alleles[0] === alleles[0].toLowerCase() ? 'N' : 'n');

  const trait = GEN_TRAIT_MAP[gen];
  return {
    domain,
    domainLabel: NA_DOMAIN_MAP[domain] || 'Unknown',
    alleles,
    gen,
    stability: trait.stability,
    mutation: trait.mutation,
    persistence: trait.persistence,
    effect: trait.effect,
    siblingOrder: '=',
    lineage: [],
    epigenetic: {},
    synergies: [],
    phase: gen === 0 ? 'transcendent' : trait.mutation > 0.7 ? 'volatile' : 'stable',
  };
}

export function parseGenomeString(raw: string): Genome {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  const units: Record<string, NAUnit> = {};

  tokens.forEach((token, idx) => {
    const parsed = parseNAUnit(token);
    if (!parsed) return;
    parsed.siblingOrder = idx === 0 ? '<' : idx === tokens.length - 1 ? '>' : '=';
    units[parsed.domain] = parsed;
  });

  for (const domain of Object.keys(NA_DOMAIN_MAP)) {
    if (!units[domain]) units[domain] = parseNAUnit(`${domain}5`)!;
  }

  const synergies = evaluateSynergies(units);
  return {
    units,
    archetype: 'EmergentSeed',
    coherence: calculateCoherence(units),
    volatility: calculateVolatility(units),
    generation: 0,
    signature: `GEN0-${Date.now().toString(36).toUpperCase()}`,
    synergies,
  };
}

export function seedGenomeFromGoal(goal: string, heresy = 0.8, rand = Math.random): Genome {
  const lower = goal.toLowerCase();
  const tokens = 'C6 E6 P5 V5 G6 X5 Z4 M5 Q5 I5'.split(' ');
  const units: Record<string, NAUnit> = {};

  tokens.forEach((token, idx) => {
    const unit = parseNAUnit(token)!;
    unit.siblingOrder = idx === 0 ? '<' : idx === tokens.length - 1 ? '>' : '=';
    unit.stability = clamp(unit.stability + randomBetween(-0.08, 0.08, rand));
    unit.mutation = clamp(unit.mutation + randomBetween(-0.08, 0.08, rand));
    units[unit.domain] = unit;
  });

  if (lower.includes('creative') || lower.includes('novel') || lower.includes('beautiful')) {
    units.E.mutation = clamp(units.E.mutation + 0.2);
    units.P.mutation = clamp(units.P.mutation + 0.2);
    units.Q.mutation = clamp(units.Q.mutation + 0.2);
  }
  if (lower.includes('stable') || lower.includes('reliable') || lower.includes('safe')) {
    units.C.stability = clamp(units.C.stability + 0.2);
    units.V.stability = clamp(units.V.stability + 0.2);
    units.Z.stability = clamp((units.Z.stability ?? 0.5) + 0.2);
  }
  if (lower.includes('fast') || lower.includes('performance') || lower.includes('scale')) {
    units.C.gen = clamp(units.C.gen + 1, 0, 9);
    units.M.gen = clamp(units.M.gen + 1, 0, 9);
    units.X.mutation = clamp(units.X.mutation + 0.15);
  }

  const synergies = evaluateSynergies(units);
  return {
    units,
    archetype: determineArchetype(calculateCoherence(units), calculateVolatility(units), units),
    coherence: calculateCoherence(units),
    volatility: clamp(calculateVolatility(units) * (0.65 + heresy * 0.35)),
    generation: 0,
    signature: `GEN0-${Date.now().toString(36).toUpperCase()}`,
    synergies,
  };
}

export function evolveGenome(genome: Genome, heresy: number, emotionIntensity: number, rand = Math.random): Genome {
  const next: Genome = structuredClone(genome);
  next.generation += 1;

  const domains = Object.keys(next.units);
  for (const domain of domains) {
    const unit = next.units[domain];
    const pressure = clamp(heresy * 0.7 + emotionIntensity * 0.6);
    if (rand() < unit.mutation * pressure) {
      const delta = rand() > 0.5 ? 1 : -1;
      unit.gen = clamp(unit.gen + delta, 0, 9);
      const trait = GEN_TRAIT_MAP[unit.gen];
      unit.stability = clamp((unit.stability * 0.6) + (trait.stability * 0.4));
      unit.mutation = clamp((unit.mutation * 0.6) + (trait.mutation * 0.4));
      unit.persistence = clamp((unit.persistence * 0.6) + (trait.persistence * 0.4));
      unit.effect = trait.effect;

      if (rand() < 0.35) {
        const peers = domains.filter((d) => d !== domain);
        const donor = peers[Math.floor(rand() * peers.length)];
        unit.alleles[0] = next.units[donor].alleles[Math.floor(rand() * 2)] || 'n';
      }

      unit.phase = unit.gen === 0 ? 'transcendent' : unit.mutation > 0.72 ? 'volatile' : 'stable';
      unit.lineage = [...unit.lineage.slice(-5), next.signature];
      unit.epigenetic.pressure = clamp((unit.epigenetic.pressure || 0.5) * 0.8 + pressure * 0.2);
    }
  }

  next.synergies = evaluateSynergies(next.units);
  for (const unit of Object.values(next.units)) {
    unit.synergies = next.synergies;
  }

  next.coherence = calculateCoherence(next.units);
  next.volatility = calculateVolatility(next.units);
  next.archetype = determineArchetype(next.coherence, next.volatility, next.units);
  next.signature = `GEN${next.generation}-${Math.abs(hashString(next.archetype + next.generation)).toString(16).toUpperCase()}`;

  return next;
}

export function compileGenomeToComponent(genome: Genome, target: ComponentTarget): CompiledComponent {
  const cognition = genome.units.C?.gen || 5;
  const emotion = genome.units.E?.mutation || 0.5;
  const creativity = genome.units.P?.mutation || 0.5;
  const values = genome.units.V?.stability || 0.6;
  const override = genome.units.Z?.gen || 5;

  const traits: Record<string, string | number | boolean> = {
    search: cognition > 7 ? 'semantic_vector' : 'fuzzy',
    uiStyle: creativity > 0.72 ? 'fluid_organic' : 'clean_minimal',
    emotionalFeedback: emotion > 0.64,
    privacyLevel: values > 0.82 ? 'strict' : 'balanced',
    overrideAggression: override,
    synergies: genome.synergies.join(', ') || 'none',
  };

  if (target === 'memoryManager' || target === 'fullOS') {
    traits.memoryModel = (genome.units.M?.gen || 5) > 6 ? 'adaptive_compressed' : 'standard';
  }
  if (target === 'windowSystem' || target === 'fullOS') {
    traits.compositor = creativity > 0.75 ? 'predictive' : 'deterministic';
  }

  return {
    target,
    version: `NAOS-${genome.generation}`,
    archetype: genome.archetype,
    traits,
    safetyEnvelope: {
      sandboxRequired: true,
      maxCpuPct: override > 7 ? 35 : 55,
      maxMemoryMb: target === 'fullOS' ? 768 : 256,
      netAccess: values > 0.8 ? 'none' : 'restricted',
    },
  };
}

export function calculateCoherence(units: Record<string, NAUnit>): number {
  const values = Object.values(units);
  if (!values.length) return 0.5;
  const stabilityMean = values.reduce((sum, unit) => sum + unit.stability, 0) / values.length;
  const persistenceMean = values.reduce((sum, unit) => sum + unit.persistence, 0) / values.length;
  return clamp((stabilityMean * 0.65) + (persistenceMean * 0.35));
}

export function calculateVolatility(units: Record<string, NAUnit>): number {
  const values = Object.values(units);
  if (!values.length) return 0.5;
  const base = values.reduce((sum, unit) => sum + unit.mutation, 0) / values.length;
  const chaoticBonus = (units.X?.mutation || 0.5) * 0.15;
  return clamp(base + chaoticBonus);
}

export function evaluateSynergies(units: Record<string, NAUnit>): string[] {
  const set = new Set<string>();
  for (const rule of SYNERGY_RULES) {
    if (rule.when(units)) rule.grants.forEach((tag) => set.add(tag));
  }
  return [...set];
}

export function determineArchetype(
  coherence: number,
  volatility: number,
  units: Record<string, NAUnit>,
): string {
  if (coherence > 0.86 && (units.Z?.stability || 0) > 0.7) return 'PixelKeeper';
  if (volatility > 0.78) return 'Ouroboros';
  if ((units.Q?.mutation || 0) > 0.82) return 'ResonantMonad';
  if ((units.C?.gen || 5) > 7 && (units.V?.stability || 0.5) > 0.72) return 'ArchitectSage';
  return 'EmergentHybrid';
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
