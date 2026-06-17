const MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣'];
const RANKS = ['r1','r2','r3','',''];
export default function Leaderboard({ standings }) {
  return (
    <div>
      <div className="sec-hdr">🏆 Standings</div>
      <div className="lb-grid">
        {standings.map((s, i) => (
          <div key={s.name} className={`lb-card ${RANKS[i] || ''}`}>
            <div className="lb-medal">{MEDALS[i] || '🎮'}</div>
            <div className="lb-name">{s.name}</div>
            <div className="lb-pts">{s.pts}</div>
            <div className="lb-sub">pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
