import { Badge, Box, Card, Text } from '@mantine/core';
import type { Match, ScoreRecord, MatchOdds } from '../types';

import PredRow from './PredRow';
import { scoreKey } from '../utils/teamNames';
import { flag } from '../utils/flags';

interface MatchCardProps {
  match: Match;
  scores: Record<string, ScoreRecord>;
  odds: Record<string, MatchOdds>;
}

function isTodayMatch(dateStr: string): boolean {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [d, m] = dateStr.split(' ');
  return parseInt(d) === now.getDate() && months[now.getMonth()] === m;
}

export default function MatchCard({ match, scores, odds }: MatchCardProps) {
  const key = scoreKey(match.home, match.away);
  const live = scores[key];
  const matchOdds = odds[key];
  const hs = live?.hs ?? match.home_score;
  const as_ = live?.as_ ?? match.away_score;
  const status = live?.status ?? (match.home_score != null ? 'ft' : 'upcoming');
  const isLive = status === 'live';
  const played = hs != null && as_ != null;
  const isToday = isTodayMatch(match.date);

  const borderColor = isLive
    ? 'var(--mantine-color-red-6)'
    : isToday
    ? 'var(--mantine-color-blue-6)'
    : 'var(--mantine-color-dark-4)';

  return (
    <Card mb="xs" p={0} style={{ border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
      {/* Score row */}
      <Box px={10} py={8} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Box ta="right" style={{ flex: 1 }}>
          <Text fz={18} lh={1}>{flag(match.home)}</Text>
          <Text fw={600} fz="sm" lh={1.2}>{match.home}</Text>
        </Box>
        <Box ta="center" style={{ minWidth: 72, flexShrink: 0 }}>
          {isLive ? (
            <>
              <Text fw={900} fz="lg" c="red.5" style={{ letterSpacing: 2 }}>{hs}–{as_}</Text>
              <Badge color="red" size="xs" variant="filled" style={{ animation: 'pulse 1s infinite' }}>
                LIVE {live?.clock ?? ''}
              </Badge>
            </>
          ) : played ? (
            <>
              <Text fw={900} fz="lg" style={{ letterSpacing: 2 }}>{hs}–{as_}</Text>
              <Text fz={10} c="dimmed">FT</Text>
            </>
          ) : (
            <>
              <Text fw={600} fz="xs" c="dimmed">{match.time}</Text>
              <Text fz={10} c="dimmed">{match.date}</Text>
            </>
          )}
        </Box>
        <Box ta="left" style={{ flex: 1 }}>
          <Text fz={18} lh={1}>{flag(match.away)}</Text>
          <Text fw={600} fz="sm" lh={1.2}>{match.away}</Text>
        </Box>
      </Box>

      {/* Predictions */}
      <Box px={8} pt={4} pb={6} style={{ borderTop: '1px solid rgba(255,255,255,.05)', background: 'rgba(0,0,0,.18)' }}>
        <Text fz={8} tt="uppercase" c="dimmed" mb={4} style={{ letterSpacing: 1 }}>Predictions</Text>
        <PredRow match={match} hs={hs ?? null} as_={as_ ?? null} played={played} />
        {matchOdds && (matchOdds.homeML || matchOdds.drawML || matchOdds.awayML) && (
          <Box mt={4} style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <Text fz={9} c="dimmed" style={{ opacity: 0.5, marginRight: 2 }}>ML</Text>
            {matchOdds.homeML && <Text fz={9} fw={600} c="blue.4">{match.home.split(' ')[0]} {matchOdds.homeML}</Text>}
            {matchOdds.drawML && <Text fz={9} fw={600} c="dimmed">D {matchOdds.drawML}</Text>}
            {matchOdds.awayML && <Text fz={9} fw={600} c="blue.4">{match.away.split(' ')[0]} {matchOdds.awayML}</Text>}
          </Box>
        )}
      </Box>
    </Card>
  );
}
