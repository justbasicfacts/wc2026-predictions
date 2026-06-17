import Dexie, { type Table } from 'dexie';
import type { ScoreRecord } from '../types';

class WC2026DB extends Dexie {
  scores!: Table<ScoreRecord, string>;

  constructor() {
    super('WC2026');
    this.version(1).stores({ scores: 'matchKey' });
  }
}

const db = new WC2026DB();

export async function saveScore(matchKey: string, data: Omit<ScoreRecord, 'matchKey' | 'savedAt'>): Promise<void> {
  await db.scores.put({ matchKey, ...data, savedAt: Date.now() });
}

export async function loadAllScores(): Promise<Map<string, ScoreRecord>> {
  const rows = await db.scores.toArray();
  return new Map(rows.map(r => [r.matchKey, r]));
}
