import { useState, useEffect, useRef } from 'react';
import { saveScore, loadAllScores } from '../db/scoresDb.js';
import { scoreKey, teamsMatch } from '../utils/teamNames.js';
import GAME_DATA from '../data/gameData.js';

const TOURNAMENT_START = new Date('2026-06-11');
const REFRESH_MS = 5 * 60 * 1000;

function getDates(full) {
  if (!full) {
    return [-1, 0, 1].map(o => {
      const d = new Date(); d.setDate(d.getDate() + o);
      return d.toISOString().slice(0, 10).replace(/-/g, '');
    });
  }
  const dates = [], end = new Date();
  end.setDate(end.getDate() + 1);
  for (let d = new Date(TOURNAMENT_START); d <= end; d.setDate(d.getDate() + 1))
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
  return dates;
}

async function fetchDate(dateStr) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`;
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) return [];
  const data = await r.json();
  const out = [];
  for (const ev of data.events || []) {
    const comp = ev.competitions?.[0]; if (!comp) continue;
    const hC = comp.competitors?.find(c => c.homeAway === 'home');
    const aC = comp.competitors?.find(c => c.homeAway === 'away');
    if (!hC || !aC) continue;
    const hName = hC.team?.displayName || hC.team?.name || '';
    const aName = aC.team?.displayName || aC.team?.name || '';
    const hScore = parseInt(hC.score) || 0;
    const aScore = parseInt(aC.score) || 0;
    const sn = comp.status?.type?.name || '';
    const isLive = sn.toLowerCase().includes('in') && !sn.toLowerCase().includes('final');
    const isFt = sn.toLowerCase().includes('final') || sn.toLowerCase().includes('full');
    if (!isLive && !isFt) continue;
    for (const m of GAME_DATA.matches) {
      let hs, as_;
      if (teamsMatch(m.home, hName) && teamsMatch(m.away, aName)) { hs = hScore; as_ = aScore; }
      else if (teamsMatch(m.home, aName) && teamsMatch(m.away, hName)) { hs = aScore; as_ = hScore; }
      else continue;
      out.push({ key: scoreKey(m.home, m.away), hs, as_, status: isLive ? 'live' : 'ft', clock: isLive ? comp.status?.displayClock : null });
    }
  }
  return out;
}

export function useScores() {
  const [scores, setScores] = useState(new Map());
  const [info, setInfo] = useState({ loading: true, lastUpdated: null, count: 0, espnOk: null });
  const fullDone = useRef(false);

  async function runFetch(full) {
    const dates = getDates(full);
    const results = (await Promise.allSettled(dates.map(fetchDate)))
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    let espnOk = results.length > 0;
    // Save non-stale results to DB
    for (const r of results) {
      const existing = (await loadAllScores()).get(r.key);
      if (existing?.status === 'ft' && r.status === 'live') continue;
      await saveScore(r.key, { hs: r.hs, as_: r.as_, status: r.status, clock: r.clock });
    }
    const all = await loadAllScores();
    setScores(new Map(all));
    setInfo({ loading: false, lastUpdated: new Date(), count: all.size, espnOk });
    fullDone.current = true;
  }

  useEffect(() => {
    loadAllScores().then(cached => {
      setScores(new Map(cached));
      setInfo(i => ({ ...i, count: cached.size }));
    });
    runFetch(true);
    const t = setInterval(() => runFetch(false), REFRESH_MS);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return { scores, info };
}
