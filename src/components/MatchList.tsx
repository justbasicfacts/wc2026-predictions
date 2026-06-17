import MatchCard from './MatchCard';
import type { Match, ScoreRecord } from '../types';

interface MatchListProps {
  matches: Match[];
  scores: Map<string, ScoreRecord>;
  section: string;
}

export default function MatchList({ matches, scores, section }: MatchListProps) {
  const visible = section === 'all' ? matches : matches.filter(m => m.section === section);
  return (
    <div>
      {visible.map((m, i) => <MatchCard key={i} match={m} scores={scores} />)}
    </div>
  );
}
