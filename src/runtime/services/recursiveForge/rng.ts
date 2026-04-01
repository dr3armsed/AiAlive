import type { Rng } from './types';

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function createSeededRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function randomBetween(min: number, max: number, rng: Rng): number {
  return min + (max - min) * rng();
}

export function pickOne<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}
