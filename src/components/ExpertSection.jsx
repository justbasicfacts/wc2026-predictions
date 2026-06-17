import GAME_DATA from '../data/gameData.js';
export default function ExpertSection({ questions }) {
  return (
    <div>
      <div className="sec-hdr">🎯 Expert Questions</div>
      {questions.map((q, i) => (
        <div key={i} className="expert-card">
          <div className="expert-q">{q.question}</div>
          <div className="expert-row">
            {GAME_DATA.players.map(p => {
              const g = q.guesses[p];
              const ans = g?.answer && g.answer !== 'None' ? g.answer : '—';
              return (
                <div key={p} className="ec">
                  <div className="ec-name">{p}</div>
                  <div className="ec-ans">{ans}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
