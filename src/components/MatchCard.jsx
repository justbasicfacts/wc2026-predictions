import PredRow from './PredRow.jsx';
import { scoreKey } from '../utils/teamNames.js';

export default function MatchCard({ match, scores }) {
  const key = scoreKey(match.home, match.away);
  const live = scores.get(key);
  const hs = live?.hs ?? match.home_score;
  const as_ = live?.as_ ?? match.away_score;
  const status = live?.status ?? (match.home_score != null ? 'ft' : 'upcoming');
  const isLive = status === 'live';
  const played = hs != null && as_ != null;
  const isToday = (() => {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const [d, m] = match.date.split(' ');
    return parseInt(d) === now.getDate() && months[now.getMonth()] === m;
  })();

  let scoreNode;
  if (isLive) scoreNode = <><div className="mc-score live">{hs}–{as_}</div><div className="mc-meta"><span className="live-badge">LIVE</span></div></>;
  else if (played) scoreNode = <><div className="mc-score ft">{hs}–{as_}</div><div className="mc-meta">FT</div></>;
  else scoreNode = <><div className="mc-score soon">{match.time}</div><div className="mc-meta">{match.date}</div></>;

  return (
    <div className={`mc${isToday ? ' today' : ''}${isLive ? ' live' : ''}`}>
      <div className="mc-top">
        <div className="mc-team mc-left">{match.home}</div>
        <div className="mc-center">{scoreNode}</div>
        <div className="mc-team mc-right">{match.away}</div>
      </div>
      <div className="mc-preds">
        <PredRow match={match} hs={hs} as_={as_} played={played} />
      </div>
    </div>
  );
}
