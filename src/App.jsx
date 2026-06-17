import { useState, useMemo } from 'react';
import { useScores } from './hooks/useScores.js';
import Header from './components/Header.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import TodaySection from './components/TodaySection.jsx';
import SectionTabs from './components/SectionTabs.jsx';
import MatchList from './components/MatchList.jsx';
import ExpertSection from './components/ExpertSection.jsx';
import GAME_DATA from './data/gameData.js';
import { calcPoints } from './utils/scoring.js';
import { scoreKey } from './utils/teamNames.js';

function calcStandings(scores) {
  const totals = Object.fromEntries(GAME_DATA.players.map(p => [p, 0]));
  GAME_DATA.matches.forEach(m => {
    const key = scoreKey(m.home, m.away);
    const live = scores.get(key);
    const hs = live?.hs ?? m.home_score;
    const as_ = live?.as_ ?? m.away_score;
    if (hs == null || as_ == null) return;
    GAME_DATA.players.forEach(p => {
      const g = m.guesses[p];
      if (g?.home != null) totals[p] += calcPoints(hs, as_, g.home, g.away);
    });
  });
  GAME_DATA.expert_questions.forEach(q => {
    GAME_DATA.players.forEach(p => { totals[p] += q.guesses[p]?.points || 0; });
  });
  return Object.entries(totals).map(([name, pts]) => ({ name, pts })).sort((a, b) => b.pts - a.pts);
}

const ALL_SECTIONS = ['all', ...new Set(GAME_DATA.matches.map(m => m.section))];

export default function App() {
  const { scores, info } = useScores();
  const [section, setSection] = useState('all');
  const standings = useMemo(() => calcStandings(scores), [scores]);
  return (
    <div className="app">
      <Header info={info} />
      <div className="container">
        <TodaySection matches={GAME_DATA.matches} scores={scores} />
        <Leaderboard standings={standings} />
        <div className="sec-hdr">📋 All Matches</div>
        <div className="legend">
          <span className="li"><span className="dot" style={{background:'var(--green)'}}/> Exact (3pts)</span>
          <span className="li"><span className="dot" style={{background:'var(--yellow)'}}/> Tendency (1pt)</span>
          <span className="li"><span className="dot" style={{background:'var(--red)'}}/> Miss</span>
          <span className="li"><span className="dot" style={{background:'var(--muted)'}}/> No guess</span>
        </div>
        <SectionTabs sections={ALL_SECTIONS} active={section} onChange={setSection} />
        <MatchList matches={GAME_DATA.matches} scores={scores} section={section} />
        <ExpertSection questions={GAME_DATA.expert_questions} />
      </div>
    </div>
  );
}
