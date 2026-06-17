import { useState, useEffect, useRef } from 'react';
import { saveScore, loadAllScores } from '../db/scoresDb';
import { scoreKey, teamsMatch } from '../utils/teamNames';
import { playGoalSound } from '../utils/sound';
import { showGoalNotification } from '../utils/notifications';
import GAME_DATA from '../data/gameData';
import type { ScoreRecord, ScoreInfo } from '../types';

const TOURNAMENT_START = new Date('2026-06-11');
const REFRESH_IDLE_MS = 5 * 60 * 1000;
const REFRESH_LIVE_MS = 60 * 1000;

function getDates(full: boolean): string[] {
  if (!full) {
    return [-1, 0, 1].map(o => {
      const d = new Date();
      d.setDate(d.getDate() + o);
      return d.toISOString().slice(0, 10).replace(/-/g, '');
    });
  }
  const dates: string[] = [];
  const end = new Date();
  end.setDate(end.getDate() + 1);
  for (let d = new Date(TOURNAMENT_START); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
  }
  return dates;
}

interface FetchedScore {
  key: string;
  hs: number;
  as_: number;
  status: 'live' | 'ft';
  clock: string | null;
}

async function fetchDate(dateStr: string): Promise<FetchedScore[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`;
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) return [];
  const data = await r.json() as { events?: unknown[] };
  const out: FetchedScore[] = [];

  for (const ev of (data.events ?? []) as Record<string, unknown>[]) {
    const comp = (ev.competitions as Record<string, unknown>[])?.[0];
    if (!comp) continue;
    const competitors = comp.competitors as Record<string, unknown>[];
    const hC = competitors?.find(c => c.homeAway === 'home');
    const aC = competitors?.find(c => c.homeAway === 'away');
    if (!hC || !aC) continue;

    const hTeam = hC.team as Record<string, string>;
    const aTeam = aC.team as Record<string, string>;
    const hName = hTeam?.displayName || hTeam?.name || '';
    const aName = aTeam?.displayName || aTeam?.name || '';
    const hScore = parseInt(hC.score as string) || 0;
    const aScore = parseInt(aC.score as string) || 0;

    const statusType = (comp.status as Record<string, unknown>)?.type as Record<string, string>;
    const sn = statusType?.name || '';
    const isLive = sn.toLowerCase().includes('in') && !sn.toLowerCase().includes('final');
    const isFt = sn.toLowerCase().includes('final') || sn.toLowerCase().includes('full');
    if (!isLive && !isFt) continue;

    const statusObj = comp.status as Record<string, unknown>;
    const clock = isLive ? (statusObj?.displayClock as string | null) ?? null : null;

    for (const m of GAME_DATA.matches) {
      let hs: number, as_: number;
      if (teamsMatch(m.home, hName) && teamsMatch(m.away, aName)) {
        hs = hScore; as_ = aScore;
      } else if (teamsMatch(m.home, aName) && teamsMatch(m.away, hName)) {
        hs = aScore; as_ = hScore;
      } else continue;

      out.push({ key: scoreKey(m.home, m.away), hs, as_, status: isLive ? 'live' : 'ft', clock });
    }
  }
  return out;
}

export function useScores(): { scores: Map<string, ScoreRecord>; info: ScoreInfo; forceRefresh: () => void } {
  const [scores, setScores] = useState<Map<string, ScoreRecord>>(new Map());
  const [info, setInfo] = useState<ScoreInfo>({ loading: true, lastUpdated: null, count: 0, espnOk: null });
  const fullDone = useRef(false);
  const hasLive = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track previous live scores to detect goals
  const prevLive = useRef<Map<string, { hs: number; as_: number }>>(new Map());

  async function runFetch(full: boolean): Promise<void> {
    const dates = getDates(full);
    const settled = await Promise.allSettled(dates.map(fetchDate));
    const results = settled
      .filter((r): r is PromiseFulfilledResult<FetchedScore[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    const espnOk = results.length > 0;
    const cached = await loadAllScores();

    // Detect goals in live matches (skip on initial full history load)
    if (fullDone.current) {
      for (const r of results) {
        if (r.status !== 'live') continue;
        const prev = prevLive.current.get(r.key);
        if (!prev) continue; // first time seeing this live match — no baseline yet
        const prevTotal = prev.hs + prev.as_;
        const newTotal = r.hs + r.as_;
        if (newTotal > prevTotal) {
          const match = GAME_DATA.matches.find(
            m => scoreKey(m.home, m.away) === r.key,
          );
          if (match) {
            playGoalSound();
            showGoalNotification(match.home, match.away, r.hs, r.as_);
          }
        }
      }
    }

    // Update previous live scores baseline
    for (const r of results) {
      if (r.status === 'live') {
        prevLive.current.set(r.key, { hs: r.hs, as_: r.as_ });
      }
    }

    for (const r of results) {
      const existing = cached.get(r.key);
      if (existing?.status === 'ft' && r.status === 'live') continue;
      await saveScore(r.key, { hs: r.hs, as_: r.as_, status: r.status, clock: r.clock });
    }
    const all = await loadAllScores();
    setScores(new Map(all));
    setInfo({ loading: false, lastUpdated: new Date(), count: all.size, espnOk });
    fullDone.current = true;

    // Switch polling speed based on whether any match is live
    const nowLive = results.some(r => r.status === 'live');
    if (nowLive !== hasLive.current) {
      hasLive.current = nowLive;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => void runFetch(false), nowLive ? REFRESH_LIVE_MS : REFRESH_IDLE_MS);
    }
  }

  useEffect(() => {
    void loadAllScores().then(cached => {
      setScores(new Map(cached));
      setInfo(i => ({ ...i, count: cached.size }));
    });
    void runFetch(true);

    // Poll every 5 min while idle, 60s when live — timer managed dynamically in runFetch
    timerRef.current = setInterval(() => void runFetch(false), REFRESH_IDLE_MS);

    // Refresh immediately when user returns to the app (tab/PWA focus)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void runFetch(false);
    };
    document.addEventListener('visibilitychange', onVisible);

    // Listen for service worker message after background sync
    const onSwMessage = (e: MessageEvent) => {
      if ((e.data as { type?: string })?.type === 'SCORES_UPDATED') void runFetch(false);
    };
    navigator.serviceWorker?.addEventListener('message', onSwMessage);

    // Periodic Background Sync — Android Chrome only
    // Lets the service worker fetch scores even when the app is closed
    void (async () => {
      try {
        const reg = await navigator.serviceWorker?.ready;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ps = (reg as any)?.periodicSync;
        if (ps) {
          await ps.register('fetch-scores', { minInterval: REFRESH_LIVE_MS });
        }
      } catch {
        // Periodic Background Sync not supported or permission denied — silent fail
      }
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
      navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const forceRefresh = () => void runFetch(false);

  return { scores, info, forceRefresh };
}
