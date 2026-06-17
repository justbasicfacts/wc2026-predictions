export function calcPoints(hs, as_, gh, ga) {
  if (hs == null || as_ == null || gh == null || ga == null) return 0;
  if (gh === hs && ga === as_) return 3;
  return Math.sign(hs - as_) === Math.sign(gh - ga) ? 1 : 0;
}

export function classify(hs, as_, gh, ga) {
  if (gh == null || ga == null) return 'none';
  if (hs == null || as_ == null) return 'pending';
  const p = calcPoints(hs, as_, gh, ga);
  return p === 3 ? 'exact' : p === 1 ? 'tendency' : 'miss';
}
