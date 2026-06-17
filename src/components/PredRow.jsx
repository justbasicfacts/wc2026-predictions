import { calcPoints, classify } from '../utils/scoring.js';
import GAME_DATA from '../data/gameData.js';

export default function PredRow({ match, hs, as_, played }) {
  return (
    <div className="pred-row">
      {GAME_DATA.players.map(p => {
        const g = match.guesses[p];
        const gh = g?.home ?? null, ga = g?.away ?? null;
        const cl = classify(hs, as_, gh, ga);
        const pts = played && gh != null ? calcPoints(hs, as_, gh, ga) : 0;
        return (
          <div key={p} className={`pred ${cl}`}>
            <div className="pred-name">{p}</div>
            <div className="pred-score">{gh != null ? `${gh}–${ga}` : '—'}</div>
            {played && gh != null && (
              <div className={`pred-pts${pts > 0 ? ' pos' : ''}`}>{pts > 0 ? `+${pts}p` : '0p'}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
