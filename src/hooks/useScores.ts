import { useState, useEffect, useRef, useMemo } from 'react';
import { scoreKey, teamsMatch } from '../utils/teamNames';
import { playGoalSound } from '../utils/sound';
import { showGoalNotification } from '../utils/notifications';
import GAME_DATA from '../data/gameData';
import type { ScoreRecord, ScoreInfo, MatchOdds, MatchStats, ExpertStats } from '../types';

const TOURNAMENT_START = new Date('2026-06-11');
const REFRESH_IDLE_MS = 5 * 60 * 1000;
const REFRESH_LIVE_MS = 60 * 1000;

// Module-level stores — survive re-renders, always readable directly
const _scores: Record<string, ScoreRecord> = {};
const _odds: Record<string, MatchOdds> = {};
const _kickoffs: Record<string, string> = {}; // UTC ISO strings from ESPN
const _stats: Record<string, MatchStats> = {}; // per-match red cards + goal scorers
/** Per-event summary cache. Key = ESPN event ID.
 *  regH/regA = goals in regulation (period ≤ 2) — the 90-minute score.
 *  aet indicates the match actually went to extra time (so regH === regA). */
const _summaries: Record<string, { regH: number; regA: number; aet: boolean; stats: MatchStats }> = {};

function getDates(full: boolean): string[] {
  if (!full) {
    return [-1, 0, 1, 2].map(o => {
      const d = new Date();
      d.setDate(d.getDate() + o);
      return d.toISOString().slice(0, 10).replace(/-/g, '');
    });
  }
  const dates: string[] = [];
  const end = new Date();
  end.setDate(end.getDate() + 2);
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
  odds: MatchOdds | null;
  oddsOnly?: boolean;
  kickoffUtc?: string; // UTC ISO string from ESPN (e.g. "2026-06-23T17:00Z")
  stats?: MatchStats;
  /** ESPN event id — needed to fetch the summary endpoint for regulation-only
   *  scoring on knockout matches. */
  eventId?: string;
  isKnockout?: boolean;
  flipped?: boolean;
  hFullEspn?: number;
  aFullEspn?: number;
}

/** Walk an array of plays and extract red-card + goal-scorer + regulation-score info. */
function analysePlays(
  plays: Array<Record<string, unknown>>,
  espnHomeTeamId: string,
  espnAwayTeamId: string,
): { regH: number; regA: number; aet: boolean; stats: MatchStats } {
  let reds = 0;
  const scorers: string[] = [];
  let regH = 0, regA = 0;
  let aet = false;
  for (const play of plays) {
    const type = play.type as Record<string, string> | undefined;
    const label = (type?.text ?? '').toLowerCase();
    const scoringPlay = play.scoringPlay === true;
    const athletes = play.athletesInvolved as Array<Record<string, string>> | undefined;
    const primary = athletes?.[0]?.displayName || athletes?.[0]?.shortName;
    const period = ((play.period as Record<string, number>)?.number) ?? 0;
    if (period > 2) aet = true;

    if (label.includes('red card') || label === 'red' || label.includes('sending')) {
      reds += 1;
    }
    if (scoringPlay) {
      if (primary && !label.includes('own goal')) scorers.push(primary);
      // For regulation goals (period 1 = 1st half, period 2 = 2nd half),
      // count by team id. Own goals credit the OPPONENT — ESPN's play "team"
      // field represents the team credited with the goal in either case.
      if (period > 0 && period <= 2) {
        const tid = String(((play.team as Record<string, string>)?.id) ?? '');
        if (tid === espnHomeTeamId) regH += 1;
        else if (tid === espnAwayTeamId) regA += 1;
      }
    }
  }
  return { regH, regA, aet, stats: { reds, scorers } };
}

/** Legacy path — used only for stats aggregation before summary lands (or if it fails). */
function extractMatchStats(comp: Record<string, unknown>): MatchStats {
  const details = comp.details as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(details)) return { reds: 0, scorers: [] };
  return analysePlays(details, '', '').stats;
}

/** Fetch and cache the per-event summary from ESPN. Returns regulation score
 *  computed from period ≤ 2 scoring plays, plus reds/scorers. Null on failure. */
async function fetchEventSummary(eventId: string): Promise<typeof _summaries[string] | null> {
  const cached = _summaries[eventId];
  if (cached) return cached;
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${encodeURIComponent(eventId)}`;
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    const data = await r.json() as Record<string, unknown>;
    const header = data.header as Record<string, unknown> | undefined;
    const hdrComp = ((header?.competitions as Array<Record<string, unknown>>) || [])[0];
    const competitors = (hdrComp?.competitors as Array<Record<string, unknown>>) || [];
    const homeTeamId = String(((competitors.find(c => c.homeAway === 'home')?.team as Record<string, string> | undefined)?.id) ?? '');
    const awayTeamId = String(((competitors.find(c => c.homeAway === 'away')?.team as Record<string, string> | undefined)?.id) ?? '');
    if (!homeTeamId || !awayTeamId) return null;
    const plays = (data.plays as Array<Record<string, unknown>>) || [];
    const result = analysePlays(plays, homeTeamId, awayTeamId);
    _summaries[eventId] = result;
    return result;
  } catch (e) {
    console.warn('[useScores] summary fetch failed for event', eventId, e);
    return null;
  }
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
    const hScoreFull = parseInt(hC.score as string) || 0;
    const aScoreFull = parseInt(aC.score as string) || 0;

    const kickoffUtc = ev.date as string | undefined;
    const eventId = ev.id as string | undefined;

    const statusType = (comp.status as Record<string, unknown>)?.type as Record<string, string>;
    const state = statusType?.state || '';
    const isLive = state === 'in';
    const isFt = state === 'post';
    const isPre = state === 'pre';

    const statusObj = comp.status as Record<string, unknown>;
    const clock = isLive ? (statusObj?.displayClock as string | null) ?? null : null;

    // Extract moneyline odds (available for all states)
    let odds: MatchOdds | null = null;
    const oddsArr = comp.odds as Record<string, unknown>[] | undefined;
    const oddsData = oddsArr?.[0] as Record<string, unknown> | undefined;
    if (oddsData) {
      const ml = oddsData.moneyline as Record<string, Record<string, Record<string, string>>> | undefined;
      const homeCurrent = ml?.home?.current?.odds ?? ml?.home?.close?.odds ?? null;
      const awayCurrent = ml?.away?.current?.odds ?? ml?.away?.close?.odds ?? null;
      const drawData = oddsData.drawOdds as Record<string, unknown> | undefined;
      const drawML = drawData?.moneyLine != null ? String(drawData.moneyLine) : null;
      if (homeCurrent || drawML || awayCurrent) {
        odds = {
          homeML: homeCurrent ? formatML(String(homeCurrent)) : null,
          drawML: drawML ? formatML(drawML) : null,
          awayML: awayCurrent ? formatML(String(awayCurrent)) : null,
        };
      }
    }

    // Per-match statistics (goal scorers, red cards) live only in `details` and
    // only for live/finished events. Extract once per event and share across
    // gameData match candidates.
    const stats = isLive || isFt ? extractMatchStats(comp) : undefined;

    for (const m of GAME_DATA.matches) {
      // Group-stage matches always end at 90; knockout matches must ignore ET.
      const isKnockout = !m.section.startsWith('Group ');

      let hs: number, as_: number;
      let flipped = false;
      if (teamsMatch(m.home, hName) && teamsMatch(m.away, aName)) {
        hs = hScoreFull; as_ = aScoreFull;
      } else if (teamsMatch(m.home, aName) && teamsMatch(m.away, hName)) {
        hs = aScoreFull; as_ = hScoreFull;
        flipped = true;
      } else continue;

      // Flip odds if teams are swapped
      const matchOdds = odds && flipped
        ? { homeML: odds.awayML, drawML: odds.drawML, awayML: odds.homeML }
        : odds;

      if (isLive || isFt) {
        out.push({
          key: scoreKey(m.home, m.away),
          hs, as_, // provisional — patched from summary for knockout matches below
          status: isLive ? 'live' : 'ft',
          clock, odds: matchOdds, kickoffUtc, stats,
          eventId, isKnockout, flipped,
          hFullEspn: hScoreFull, aFullEspn: aScoreFull,
        });
      } else if (isPre) {
        // For upcoming matches: store kickoff time + odds (no score)
        out.push({ key: scoreKey(m.home, m.away), hs: 0, as_: 0, status: 'ft', clock: null, odds: matchOdds, oddsOnly: true, kickoffUtc });
      }
    }
  }
  return out;
}

function formatML(val: string): string {
  const n = parseInt(val);
  if (isNaN(n)) return val;
  return n > 0 ? `+${n}` : String(n);
}

export function useScores(): { scores: Record<string, ScoreRecord>; odds: Record<string, MatchOdds>; kickoffs: Record<string, string>; info: ScoreInfo; expertStats: ExpertStats; forceRefresh: () => void } {
  const [tick, setTick] = useState(0);
  const [info, setInfo] = useState<ScoreInfo>({ loading: true, lastUpdated: null, count: 0, espnOk: null });
  const fullDone = useRef(false);
  const hasLive = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevLive = useRef<Record<string, { hs: number; as_: number }>>({});

  async function runFetch(full: boolean): Promise<void> {
    try {
      const dates = getDates(full);
      const settled = await Promise.allSettled(dates.map(fetchDate));
      const results = settled
        .filter((r): r is PromiseFulfilledResult<FetchedScore[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);

      // Second pass: for knockout matches (live or finished), fetch the summary
      // endpoint to get per-period plays so we can compute the 90-min score and
      // extract goal-scorer / red-card details reliably. Results are cached per
      // event id so we only pay this cost once per completed match.
      const knockoutFetches = results
        .filter(r => r.isKnockout && r.eventId && !r.oddsOnly)
        .map(async r => {
          const summary = await fetchEventSummary(r.eventId!);
          if (!summary) return;
          // Apply the 90-min score. ESPN's summary reports home/away from its
          // own perspective; if gameData had the teams flipped we swap back.
          const regHome = r.flipped ? summary.regA : summary.regH;
          const regAway = r.flipped ? summary.regH : summary.regA;
          r.hs = regHome;
          r.as_ = regAway;
          // Prefer the richer summary-derived stats (they include the full play
          // list — the scoreboard `details` slice is often abbreviated).
          r.stats = summary.stats;
        });
      await Promise.allSettled(knockoutFetches);

      // Only count live/ft for espnOk
      const liveOrFt = results.filter(r => r.hs > 0 || r.as_ > 0 || _scores[r.key]);
      const espnOk = liveOrFt.length > 0 || results.length > 0;

      // Goal detection
      if (fullDone.current) {
        for (const r of results) {
          if (r.status !== 'live') continue;
          const prev = prevLive.current[r.key];
          if (prev && r.hs + r.as_ > prev.hs + prev.as_) {
            const match = GAME_DATA.matches.find(m => scoreKey(m.home, m.away) === r.key);
            if (match) {
              try { playGoalSound(); } catch { /* ignore */ }
              try { showGoalNotification(match.home, match.away, r.hs, r.as_); } catch { /* ignore */ }
            }
          }
        }
      }

      // Write scores, odds, and kickoff times into module-level stores
      for (const r of results) {
        // Store kickoff time for all matches (ESPN UTC time)
        if (r.kickoffUtc) _kickoffs[r.key] = r.kickoffUtc;

        // Store odds for all matches
        if (r.odds) _odds[r.key] = r.odds;

        // Only store scores for live/ft matches (not odds-only pre-game entries)
        if (!r.oddsOnly && (r.status === 'live' || r.status === 'ft')) {
          const existing = _scores[r.key];
          if (existing?.status === 'ft' && r.status === 'live') continue;
          _scores[r.key] = { matchKey: r.key, hs: r.hs, as_: r.as_, status: r.status, clock: r.clock, savedAt: Date.now() };
          if (r.status === 'live') prevLive.current[r.key] = { hs: r.hs, as_: r.as_ };

          // Cache per-match stats (last-write-wins so live-update refreshes work).
          if (r.stats) _stats[r.key] = r.stats;
        }
      }

      fullDone.current = true;
      setTick(t => t + 1);
      setInfo({ loading: false, lastUpdated: new Date(), count: results.length, espnOk });

      const nowLive = results.some(r => r.status === 'live');
      if (nowLive !== hasLive.current) {
        hasLive.current = nowLive;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => void runFetch(false), nowLive ? REFRESH_LIVE_MS : REFRESH_IDLE_MS);
      }
    } catch (err) {
      console.error('[useScores] runFetch error:', err);
    }
  }

  useEffect(() => {
    void runFetch(true);
    timerRef.current = setInterval(() => void runFetch(false), REFRESH_IDLE_MS);

    const onVisible = () => { if (document.visibilityState === 'visible') void runFetch(false); };
    document.addEventListener('visibilitychange', onVisible);

    const onSwMsg = (e: MessageEvent) => {
      if ((e.data as { type?: string })?.type === 'SCORES_UPDATED') void runFetch(false);
    };
    navigator.serviceWorker?.addEventListener('message', onSwMsg);

    void (async () => {
      try {
        const reg = await navigator.serviceWorker?.ready;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ps = (reg as any)?.periodicSync;
        if (ps) await ps.register('fetch-scores', { minInterval: REFRESH_LIVE_MS });
      } catch { /* not supported */ }
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
      navigator.serviceWorker?.removeEventListener('message', onSwMsg);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Aggregate ongoing expert-question results whenever scores/stats update.
  const expertStats = useMemo<ExpertStats>(() => {
    let totalGoals = 0;
    let totalReds = 0;
    const scorerCounts: Record<string, number> = {};
    let matchesCounted = 0;
    for (const key of Object.keys(_scores)) {
      const rec = _scores[key];
      totalGoals += rec.hs + rec.as_;
      matchesCounted += 1;
      const st = _stats[key];
      if (st) {
        totalReds += st.reds;
        for (const name of st.scorers) {
          scorerCounts[name] = (scorerCounts[name] ?? 0) + 1;
        }
      }
    }
    const topScorers = Object.entries(scorerCounts)
      .map(([name, goals]) => ({ name, goals }))
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, 10);
    return { totalGoals, totalReds, topScorers, matchesCounted };
    // tick + info.lastUpdated together capture every completed fetch.
  }, [tick, info.lastUpdated]);

  const forceRefresh = () => void runFetch(false);
  return { scores: _scores, odds: _odds, kickoffs: _kickoffs, info, expertStats, forceRefresh };
}
