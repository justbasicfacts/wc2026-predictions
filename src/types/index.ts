export interface Guess {
  home: number | null;
  away: number | null;
  points?: number;
}

export interface Match {
  section: string;
  date: string;
  time: string;
  home: string;
  away: string;
  home_score: number | null;
  away_score: number | null;
  guesses: Record<string, Guess>;
}

export interface ExpertGuess {
  answer: string | null;
  points: number;
}

export interface ExpertQuestion {
  question: string;
  guesses: Record<string, ExpertGuess>;
}

export interface RankingEntry {
  place: number;
  name: string;
  points: number;
}

export interface GameData {
  players: string[];
  ranking: RankingEntry[];
  matches: Match[];
  expert_questions: ExpertQuestion[];
}

export interface MatchOdds {
  homeML: string | null;
  drawML: string | null;
  awayML: string | null;
}

export interface ScoreRecord {
  matchKey: string;
  hs: number;
  as_: number;
  status: 'live' | 'ft';
  clock: string | null;
  savedAt: number;
}

export interface ScoreInfo {
  loading: boolean;
  lastUpdated: Date | null;
  count: number;
  espnOk: boolean | null;
}

export interface Standing {
  name: string;
  pts: number;
}

export type ScoreStatus = 'live' | 'ft' | 'upcoming';
export type PredClass = 'exact' | 'tendency' | 'miss' | 'pending' | 'none';

/** Per-match live/finished stats collected from ESPN scoreboard `details` array. */
export interface MatchStats {
  reds: number;
  scorers: string[];
}

/** Aggregate tournament-wide stats used to display ongoing expert-question results. */
export interface ExpertStats {
  totalGoals: number;
  totalReds: number;
  /** Ranked leaders (top first). Empty when ESPN hasn't returned scorer plays yet. */
  topScorers: Array<{ name: string; goals: number }>;
  /** Number of matches that have already produced a final or live score. */
  matchesCounted: number;
}
