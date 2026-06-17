import { scoreKey } from '../utils/teamNames.js';
import PredRow from './PredRow.jsx';

function isToday(dateStr) {
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [d, m] = dateStr.split(' ');
  return parseInt(d) === now.getDate() && months[now.getMonth()] === m;
}

export default function TodaySection({ matches, scores }) {
  const todayMatches = matches.filter(m => isToday(m.date));
  return (
    <div>
      <div className="sec-hdr">📅 Today's Matches</div>
      {todayMatches.length === 0
        ? <div className="today-empty">No matches today 📆</div>
        : todayMatches.map((match, i) => {
          const key = scoreKey(match.home, match.away);
          const live = scores.get(key);
          const hs = live?.hs ?? match.home_score;
          const as_ = live?.as_ ?? match.away_score;
          const status = live?.status ?? (match.home_score != null ? 'ft' : 'upcoming');
          const isLive = status === 'live';
          const played = hs != null && as_ != null;
          let scoreNode;
          if (isLive) scoreNode = <><div className="tc-score live">{hs} – {as_}</div><div><span className="live-badge">LIVE {live?.clock || ''}</span></div></>;
          else if (played) scoreNode = <><div className="tc-score ft">{hs} – {as_}</div><div className="tc-status">FT</div></>;
          else scoreNode = <><div className="tc-score soon">{match.time}</div><div className="tc-status">Upcoming</div></>;
          return (
            <div key={i} className="today-card">
              <div className="tc-teams">
                <div className="tc-name tc-left">{match.home}</div>
                <div className="tc-center">{scoreNode}</div>
                <div className="tc-name tc-right">{match.away}</div>
              </div>
              <div className="tc-preds">
                <div className="tc-preds-lbl">Predictions</div>
                <PredRow match={match} hs={hs} as_={as_} played={played} />
              </div>
            </div>
          );
        })
      }
    </div>
  );
}
