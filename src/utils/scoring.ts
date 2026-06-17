import type { PredClass } from '../types';

export function calcPoints(
  hs: number | null,
  as_: number | null,
  gh: number | null,
  ga: number | null,
): number {
  if (hs == null || as_ == null || gh == null || ga == null) return 0;
  if (gh === hs && ga === as_) return 3;
  return Math.sign(hs - as_) === Math.sign(gh - ga) ? 1 : 0;
}

export function classify(
  hs: number | null,
  as_: number | null,
  gh: number | null,
  ga: number | null,
): PredClass {
  if (gh == null || ga == null) return 'none';
  if (hs == null || as_ == null) return 'pending';
  const p = calcPoints(hs, as_, gh, ga);
  return p === 3 ? 'exact' : p === 1 ? 'tendency' : 'miss';
}
