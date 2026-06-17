const ALIASES = {
  'ivory coast': ["ivory coast","cote d'ivoire","côte d'ivoire"],
  'czech republic': ['czech republic','czechia'],
  'south korea': ['south korea','korea republic'],
  'cape verde': ['cape verde','cabo verde'],
  'curaçao': ['curacao','curaçao'],
  'curacao': ['curacao','curaçao'],
  'dr congo': ['dr congo','congo dr','democratic republic of congo'],
  'united states': ['united states','usa','united states of america'],
};
const norm = s => (s || '').toLowerCase().trim();
export const scoreKey = (h, a) => `${norm(h)}|${norm(a)}`;
export function teamsMatch(a, b) {
  const na = norm(a), nb = norm(b);
  if (na === nb) return true;
  const aa = ALIASES[na] || [na], ba = ALIASES[nb] || [nb];
  return aa.some(x => ba.includes(x));
}
