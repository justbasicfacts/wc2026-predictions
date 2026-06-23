import { useState } from 'react';
import { Card, Text, Badge, Box, Stack, UnstyledButton } from '@mantine/core';
import { scoreKey } from '../utils/teamNames';
import { flag } from '../utils/flags';
import { isMatchToday, isMatchRecent, isMatchUpcoming, parseMatchUTC, formatLocalTime, formatLocalDate } from '../utils/matchTime';
import PredRow from './PredRow';
import type { Match, ScoreRecord, MatchOdds } from '../types';

function sortByUTC(a: Match, b: Match): number {
  return parseMatchUTC(a.date, a.time ?? '12:00').getTime() -
         parseMatchUTC(b.date, b.time ?? '12:00').getTime();
}

interface MatchRowProps {
  match: Match;
  scores: Record<string, ScoreRecord>;
  odds: Record<string, MatchOdds>;
  highlight?: 'today' | 'recent' | 'upcoming';
}

function MatchRow({ match, scores, odds, highlight = 'today' }: MatchRowProps) {
  const key = scoreKey(match.home, match.away);
  const live = scores[key];
  const matchOdds = odds[key];
  const hs = live?.hs ?? match.home_score;
  const as_ = live?.as_ ?? match.away_score;
  const status = live?.status ?? (match.home_score != null ? 'ft' : 'upcoming');
  const isLive = status === 'live';
  const played = hs != null && as_ != null;

  const borderColor = isLive
    ? 'var(--mantine-color-red-6)'
    : highlight === 'today'
    ? 'var(--mantine-color-blue-7)'
    : 'var(--mantine-color-dark-4)';

  const bg = isLive
    ? 'linear-gradient(135deg, #2a0a0a 0%, #3d1010 100%)'
    : highlight === 'today'
    ? 'linear-gradient(135deg, var(--mantine-color-dark-7) 0%, #152a45 100%)'
    : 'var(--mantine-color-dark-8)';

  return (
    <Card p={0} style={{ border: `solid 1px ${borderColor}`, background: bg, overflow: 'hidden' }}>
      <Box px="md" py={14} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Box ta="right" style={{ flex: 1 }}>
          <Text fz={22} lh={1}>{flag(match.home)}</Text>
          <Text fw={700} fz="sm" lh={1.3}>{match.home}</Text>
        </Box>
        <Box ta="center" style={{ minWidth: 90, flexShrink: 0 }}>
          {isLive ? (
            <>
              <Text fw={900} fz={24} c="red.5" style={{ letterSpacing: 3 }}>{hs}–{as_}</Text>
              <Badge color="red" size="xs" variant="filled">LIVE {live?.clock ?? ''}</Badge>
            </>
          ) : played ? (
            <>
              <Text fw={900} fz={24} style={{ letterSpacing: 3 }}>{hs}–{as_}</Text>
              <Text fz={10} c="dimmed">FT</Text>
            </>
          ) : (
            <>
              <Text fw={600} fz="sm" c="dimmed">{formatLocalTime(match.date, match.time ?? '')}</Text>
              <Text fz={10} c="dimmed">Local time</Text>
            </>
          )}
        </Box>
        <Box ta="left" style={{ flex: 1 }}>
          <Text fz={22} lh={1}>{flag(match.away)}</Text>
          <Text fw={700} fz="sm" lh={1.3}>{match.away}</Text>
        </Box>
      </Box>

      <Box px="md" pb={10} style={{ borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(0,0,0,.25)' }}>
        <Text fz={10} tt="uppercase" c="dimmed" mb={6} style={{ letterSpacing: 1 }}>Predictions</Text>
        <PredRow match={match} hs={hs ?? null} as_={as_ ?? null} played={played} />
        {matchOdds && (matchOdds.homeML || matchOdds.drawML || matchOdds.awayML) && (
          <Box mt={6} style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            <Text fz={10} c="dimmed" style={{ opacity: 0.5, marginRight: 2 }}>ML</Text>
            {matchOdds.homeML && <Text fz={10} fw={600} c="blue.3">{match.home.split(' ')[0]} {matchOdds.homeML}</Text>}
            {matchOdds.drawML && <Text fz={10} fw={600} c="dimmed">D {matchOdds.drawML}</Text>}
            {matchOdds.awayML && <Text fz={10} fw={600} c="blue.3">{match.away.split(' ')[0]} {matchOdds.awayML}</Text>}
          </Box>
        )}
      </Box>
    </Card>
  );
}

interface TodaySectionProps {
  matches: Match[];
  scores: Record<string, ScoreRecord>;
  odds: Record<string, MatchOdds>;
}

export default function TodaySection({ matches, scores, odds }: TodaySectionProps) {
  const [showRecent, setShowRecent] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const todayMatches = matches.filter(m => isMatchToday(m.date, m.time ?? '')).sort(sortByUTC);
  const recentMatches = matches.filter(m => isMatchRecent(m.date, m.time ?? '')).sort((a, b) =>
    sortByUTC(b, a) // most recent first
  );
  const upcomingMatches = matches.filter(m => isMatchUpcoming(m.date, m.time ?? '')).sort(sortByUTC);

  // Group upcoming by LOCAL date
  const upcomingByDate = upcomingMatches.reduce<Record<string, Match[]>>((acc, m) => {
    const localDate = formatLocalDate(m.date, m.time ?? '');
    if (!acc[localDate]) acc[localDate] = [];
    acc[localDate].push(m);
    return acc;
  }, {});

  return (
    <Box mb="md">
      <Text
        fz={11} fw={700} tt="uppercase" c="dimmed" mb="xs"
        style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 2 }}
      >
        📅 Today&apos;s Matches
        <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-dark-4)' }} />
        {recentMatches.length > 0 && (
          <UnstyledButton
            onClick={() => setShowRecent(v => !v)}
            style={{ fontSize: 10, color: 'var(--mantine-color-blue-4)', whiteSpace: 'nowrap' }}
          >
            {showRecent ? '▲ Hide recent' : `▼ Recent (${recentMatches.length})`}
          </UnstyledButton>
        )}
      </Text>

      {showRecent && recentMatches.length > 0 && (
        <Box mb="sm">
          <Text fz={10} tt="uppercase" c="dimmed" mb={6} style={{ letterSpacing: 1 }}>🕐 Recent Results</Text>
          <Stack gap="xs">
            {recentMatches.map((match, i) => (
              <MatchRow key={`recent-${i}`} match={match} scores={scores} odds={odds} highlight="recent" />
            ))}
          </Stack>
        </Box>
      )}

      {todayMatches.length === 0 ? (
        <Card style={{ textAlign: 'center' }} c="dimmed" fz="sm" py="md">
          No matches today 📆
        </Card>
      ) : (
        <Stack gap="xs">
          {todayMatches.map((match, i) => (
            <MatchRow key={`today-${i}`} match={match} scores={scores} odds={odds} highlight="today" />
          ))}
        </Stack>
      )}

      {upcomingMatches.length > 0 && (
        <Box mt="sm">
          <UnstyledButton
            onClick={() => setShowUpcoming(v => !v)}
            style={{ width: '100%' }}
          >
            <Text
              fz={11} fw={700} tt="uppercase" c="dimmed"
              style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 2 }}
            >
              🗓 Upcoming
              <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-dark-4)' }} />
              <Text fz={10} c="blue.4" style={{ letterSpacing: 0 }}>
                {showUpcoming ? '▲ Hide' : `▼ Show (${upcomingMatches.length})`}
              </Text>
            </Text>
          </UnstyledButton>

          {showUpcoming && (
            <Stack gap="xs" mt="xs">
              {Object.entries(upcomingByDate).map(([date, dayMatches]) => (
                <Box key={date}>
                  <Text fz={10} tt="uppercase" c="dimmed" mb={4} mt={6} style={{ letterSpacing: 1 }}>
                    📅 {date}
                  </Text>
                  <Stack gap="xs">
                    {dayMatches.map((match, i) => (
                      <MatchRow key={`upcoming-${date}-${i}`} match={match} scores={scores} odds={odds} highlight="upcoming" />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}
