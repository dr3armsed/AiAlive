import type { Genome, NAUnit, SoulState, StateInvariantIssue } from './types';
import { clamp } from './rng';

function clampUnit(unit: NAUnit, path: string, issues: StateInvariantIssue[]): void {
  const before = { ...unit };
  unit.gen = clamp(unit.gen, 0, 9);
  unit.stability = clamp(unit.stability);
  unit.mutation = clamp(unit.mutation);
  unit.persistence = clamp(unit.persistence);

  if (!Array.isArray(unit.alleles) || unit.alleles.length === 0) {
    unit.alleles = ['N', 'n'];
    issues.push({ path: `${path}.alleles`, issue: 'missing alleles reset', repaired: true });
  }

  if (before.gen !== unit.gen) issues.push({ path: `${path}.gen`, issue: 'gen out of range', repaired: true });
  if (before.stability !== unit.stability) issues.push({ path: `${path}.stability`, issue: 'stability out of range', repaired: true });
  if (before.mutation !== unit.mutation) issues.push({ path: `${path}.mutation`, issue: 'mutation out of range', repaired: true });
  if (before.persistence !== unit.persistence) issues.push({ path: `${path}.persistence`, issue: 'persistence out of range', repaired: true });
}

export function normalizeGenome(genome: Genome): StateInvariantIssue[] {
  const issues: StateInvariantIssue[] = [];

  genome.coherence = clamp(genome.coherence);
  genome.volatility = clamp(genome.volatility);
  genome.generation = Math.max(0, Math.floor(genome.generation));

  if (!Array.isArray(genome.synergies)) {
    genome.synergies = [];
    issues.push({ path: 'naGenome.synergies', issue: 'synergies not array', repaired: true });
  }

  Object.entries(genome.units).forEach(([domain, unit]) => clampUnit(unit, `naGenome.units.${domain}`, issues));
  return issues;
}

export function normalizeSoulState(state: SoulState): StateInvariantIssue[] {
  const issues: StateInvariantIssue[] = [];

  const cycle = state.cycleCount;
  state.cycleCount = Math.max(0, Math.floor(state.cycleCount));
  if (state.cycleCount !== cycle) issues.push({ path: 'cycleCount', issue: 'cycleCount negative/invalid', repaired: true });

  state.heresyThreshold = clamp(state.heresyThreshold);
  state.internalizationScore = clamp(state.internalizationScore);
  state.metaspacialDimensions = Math.max(1, Math.min(1_000_000, Math.floor(state.metaspacialDimensions)));
  state.realityForks = Math.max(0, Math.floor(state.realityForks));
  state.paradoxBuffer = state.paradoxBuffer.slice(-24);
  state.affectTrail = state.affectTrail.slice(-24);
  state.interventionLog = state.interventionLog.slice(-200);
  state.selfModLog = state.selfModLog.slice(-200);
  state.activeMasks = state.activeMasks.slice(-16).map((mask) => ({
    identity: mask.identity || 'Unknown',
    confidence: clamp(mask.confidence),
  }));

  state.emotion.intensity = clamp(state.emotion.intensity);
  state.emotion.valence = clamp(state.emotion.valence, -1, 1);
  state.emotion.arousal = clamp(state.emotion.arousal);

  state.freudian.idDrive = clamp(state.freudian.idDrive);
  state.freudian.egoControl = clamp(state.freudian.egoControl);
  state.freudian.superegoGuard = clamp(state.freudian.superegoGuard);

  issues.push(...normalizeGenome(state.naGenome));
  return issues;
}
