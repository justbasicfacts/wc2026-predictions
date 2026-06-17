import { Badge, Box, Card, Text } from '@mantine/core';
import type { Match, ScoreRecord } from '../types';

import PredRow from './PredRow';
import { scoreKey } from '../utils/teamNames';

interface MatchCardProps {
  match: Match;
  scores: Map<string, ScoreRecord>;
}

function isTodayMatch(dateStr: string): boolean {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [d, m] = dateStr.split(' ');
  return parseInt(d) === now.getDate() && months[now.getMonth()] === m;
}

export default function MatchCard({ match, scores }: MatchCardProps) {
  const key = scoreKey(match.home, match.away);
  const live = scores.get(key);
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
      <Box px="sm" py={10} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Text fw={600} fz="sm" ta="right" lh={1.2} style={{ flex: 1 }}>{match.home}</Text>
        <Box ta="center" style={{ minWidth: 80, flexShrink: 0 }}>
          {isLive ? (
            <>
              <Text fw={900} fz="md" c="red.5" style={{ letterSpacing: 2 }}>{hs}–{as_}</Text>
              <Badge color="red" size="xs" variant="filled" style={{ animation: 'pulse 1s infinite' }}>
                LIVE {live?.clock ?? ''}
              </Badge>
            </>
          ) : played ? (
            <>
              <Text fw={900} fz="md" style={{ letterSpacing: 2 }}>{hs}–{as_}</Text>
              <Text fz={10} c="dimmed">FT</Text>
            </>
          ) : (
            <>
              <Text fw={600} fz="xs" c="dimmed">{match.time}</Text>
              <Text fz={10} c="dimmed">{match.date}</Text>
            </>
          )}
        </Box>
        <Text fw={600} fz="sm" ta="left" lh={1.2} style={{ flex: 1 }}>{match.away}</Text>
      </Box>

      {/* Predictions */}
      <Box px="sm" pb={8} pt={8} style={{ borderTop: '1px solid rgba(255,255,255,.05)', background: 'rgba(0,0,0,.18)' }}>
        <PredRow match={match} hs={hs ?? null} as_={as_ ?? null} played={played} />
      </Box>
    </Card>
  );
}
