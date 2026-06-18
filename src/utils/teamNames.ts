const ALIASES: Record<string, string[]> = {
  'ivory coast': ["ivory coast", "cote d'ivoire", "côte d'ivoire"],
  'czech republic': ['czech republic', 'czechia'],
  'south korea': ['south korea', 'korea republic'],
  'cape verde': ['cape verde', 'cabo verde'],
  'curaçao': ['curacao', 'curaçao'],
  'curacao': ['curacao', 'curaçao'],
  'dr congo': ['dr congo', 'congo dr', 'democratic republic of congo', 'democratic republic of the congo', 'congo', 'drc'],
  'united states': ['united states', 'usa', 'united states of america'],
  'bosnia and herzegovina': ['bosnia and herzegovina', 'bosnia-herzegovina', 'bosnia & herzegovina'],
};

const norm = (s: string): string => (s || '').toLowerCase().trim();

export const scoreKey = (h: string, a: string): string => `${norm(h)}|${norm(a)}`;

export function teamsMatch(a: string, b: string): boolean {
  const na = norm(a), nb = norm(b);
  if (na === nb) return true;
  const aa = ALIASES[na] ?? [na];
  const ba = ALIASES[nb] ?? [nb];
  return aa.some(x => ba.includes(x));
}
