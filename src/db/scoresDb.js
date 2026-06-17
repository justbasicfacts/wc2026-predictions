import Dexie from 'dexie';

const db = new Dexie('WC2026');
db.version(1).stores({ scores: 'matchKey' });

export async function saveScore(matchKey, data) {
  await db.scores.put({ matchKey, ...data, savedAt: Date.now() });
}

export async function loadAllScores() {
  const rows = await db.scores.toArray();
  return new Map(rows.map(r => [r.matchKey, r]));
}
