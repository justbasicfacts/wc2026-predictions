import MatchCard from './MatchCard';
import type { Match, ScoreRecord, MatchOdds } from '../types';

interface MatchListProps {
  matches: Match[];
  scores: Record<string, ScoreRecord>;
  odds: Record<string, MatchOdds>;
  section: string;
}

export default function MatchList({ matches, scores, odds, section }: MatchListProps) {
  const visible = section === 'all' ? matches : matches.filter(m => m.section === section);
  return (
    <div>
      {visible.map((m, i) => <MatchCard key={i} match={m} scores={scores} odds={odds} />)}
    </div>
  );
}
