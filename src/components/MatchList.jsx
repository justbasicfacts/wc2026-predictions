import MatchCard from './MatchCard.jsx';
export default function MatchList({ matches, scores, section }) {
  const visible = section === 'all' ? matches : matches.filter(m => m.section === section);
  return (
    <div>
      {visible.map((m, i) => <MatchCard key={i} match={m} scores={scores} />)}
    </div>
  );
}
