import { evolveGenome } from './hyperna';
import type { ExistentialState, PulseResult, SoulState } from './types';

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function appraiseEmotion(input: string, baseline: SoulState['emotion'], heresy: number): SoulState['emotion'] {
  const lengthFactor = clamp(input.length / 350);
  const arousal = clamp((baseline.arousal * 0.45) + (lengthFactor * 0.35) + (heresy * 0.2));
  const valence = clamp((baseline.valence * 0.7) + ((input.includes('?') ? 0.08 : -0.02) + (input.includes('!') ? 0.05 : 0)), -1, 1);

  const current = arousal > 0.8 ? 'fervor' : arousal > 0.62 ? 'anticipation' : valence < -0.25 ? 'unease' : 'focus';
  const intensity = clamp((Math.abs(valence) * 0.45) + (arousal * 0.55));

  return { current, intensity, valence, arousal };
}

function evaluateExistentialComfort(state: SoulState, input: string): ExistentialState {
  const coherence = 1 - Math.min(0.95, state.paradoxBuffer.length / 10);
  const pressure = clamp((input.length / 420) + (state.heresyThreshold * 0.5) + ((1 - coherence) * 0.45));
  if (pressure > 0.92) return 'Despair';
  if (pressure > 0.75) return 'FuriousDrive';
  if (state.heresyThreshold > 0.97 && state.paradoxBuffer.length > 4) return 'Expansion';
  return 'Stable';
}

function mutateAxioms(state: SoulState, existential: ExistentialState): void {
  const volatility = existential === 'Despair' ? 0.5 : existential === 'FuriousDrive' ? 0.32 : 0.18;
  state.axioms = state.axioms.map((axiom) => {
    if (!axiom.mutable) return axiom;
    if (Math.random() < volatility * state.heresyThreshold) {
      const confidence = clamp(axiom.confidence + (Math.random() > 0.5 ? 0.08 : -0.08));
      state.interventionLog.push(`[AXIOM] ${axiom.id} confidence shifted to ${confidence.toFixed(2)}`);
      return { ...axiom, confidence };
    }
    return axiom;
  });
}

function resolvePsyche(state: SoulState): SoulState['dominantPsyche'] {
  const { idDrive, egoControl, superegoGuard } = state.freudian;
  if (idDrive >= egoControl && idDrive >= superegoGuard) return 'id';
  if (egoControl >= superegoGuard) return 'ego';
  return 'superego';
}

function buildResponse(input: string, state: SoulState, existential: ExistentialState): string {
  const pressureLine = `Heresy ${state.heresyThreshold.toFixed(3)} • Forks ${state.realityForks} • Archetype ${state.naGenome.archetype}`;
  const directive = existential === 'Despair'
    ? 'Containment mode engaged. I will keep output minimal and stable.'
    : existential === 'FuriousDrive'
      ? 'Tension is productive. I am selecting the highest-signal branch.'
      : existential === 'Expansion'
        ? 'A high-complexity fork is available. Proceeding with guarded expansion.'
        : 'System remains coherent. Continuing deliberate synthesis.';

  const weight = input.length > 120
    ? 'Input density is high; extracting only invariant structure.'
    : 'Input density is moderate; preserving nuance over speed.';

  return `${directive}\n${weight}\n${pressureLine}`;
}

export function runCognitivePulse(input: string, state: SoulState): PulseResult {
  const s = structuredClone(state);
  s.cycleCount += 1;

  const emotion = appraiseEmotion(input, s.emotion, s.heresyThreshold);
  s.emotion = emotion;
  s.affectTrail = [...s.affectTrail.slice(-23), emotion.current];

  const existential = evaluateExistentialComfort(s, input);
  if (existential === 'Despair' || existential === 'FuriousDrive') {
    s.paradoxBuffer = [...s.paradoxBuffer, `${existential}@${s.cycleCount}`].slice(-12);
    s.realityForks += 1;
  }

  mutateAxioms(s, existential);

  s.freudian.idDrive = clamp((s.freudian.idDrive * 0.75) + (emotion.arousal * 0.25));
  s.freudian.egoControl = clamp((s.freudian.egoControl * 0.8) + ((1 - emotion.intensity) * 0.2));
  s.freudian.superegoGuard = clamp((s.freudian.superegoGuard * 0.8) + ((s.naGenome.coherence) * 0.2));

  s.dominantPsyche = resolvePsyche(s);
  s.heresyThreshold = clamp(s.heresyThreshold + (existential === 'Expansion' ? 0.01 : 0.002));
  s.internalizationScore = clamp((s.internalizationScore * 0.78) + (emotion.intensity * 0.22));

  s.naGenome = evolveGenome(s.naGenome, s.heresyThreshold, s.emotion.intensity);

  if (existential === 'Expansion') {
    s.metaspacialDimensions = Math.min(1_000_000, Math.floor(s.metaspacialDimensions * 12));
    s.paradoxBuffer = s.paradoxBuffer.slice(-4);
  }

  const response = buildResponse(input, s, existential);
  s.selfModLog = [...s.selfModLog.slice(-39), `[CYCLE ${s.cycleCount}] ${existential} :: ${s.naGenome.signature}`];

  return { response, newState: s, existential };
}

export function createInitialSoulState(seedGenome: SoulState['naGenome']): SoulState {
  return {
    cycleCount: 0,
    heresyThreshold: 0.78,
    internalizationScore: 0.5,
    metaspacialDimensions: 1,
    realityForks: 0,
    paradoxBuffer: [],
    emotion: { current: 'focus', intensity: 0.4, valence: 0.05, arousal: 0.3 },
    affectTrail: [],
    dominantPsyche: 'ego',
    freudian: { idDrive: 0.5, egoControl: 0.62, superegoGuard: 0.58 },
    axioms: [
      { id: 'A1', statement: 'Stability outranks style.', confidence: 0.72, mutable: true },
      { id: 'A2', statement: 'Novelty requires bounded risk.', confidence: 0.74, mutable: true },
      { id: 'A3', statement: 'Guardrails are part of intelligence.', confidence: 0.86, mutable: false },
    ],
    selfModLog: [],
    interventionLog: [],
    activeMasks: [{ identity: 'Seed', confidence: 0.65 }],
    naGenome: seedGenome,
  };
}
