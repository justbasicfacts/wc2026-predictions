import { Card, Text, Badge, Box, Stack } from '@mantine/core';
import { scoreKey } from '../utils/teamNames';
import PredRow from './PredRow';
import type { Match, ScoreRecord } from '../types';

function isToday(dateStr: string): boolean {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [d, m] = dateStr.split(' ');
  return parseInt(d) === now.getDate() && months[now.getMonth()] === m;
}

interface TodaySectionProps {
  matches: Match[];
  scores: Record<string, ScoreRecord>;
}

export default function TodaySection({ matches, scores }: TodaySectionProps) {
  const todayMatches = matches.filter(m => isToday(m.date));

  return (
    <Box mb="md">
      <Text
        fz={11} fw={700} tt="uppercase" c="dimmed" mb="xs"
        style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 2 }}
      >
        📅 Today&apos;s Matches
        <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-dark-4)' }} />
      </Text>

      {todayMatches.length === 0 ? (
        <Card style={{ textAlign: 'center' }} c="dimmed" fz="sm" py="md">
          No matches today 📆
        </Card>
      ) : (
        <Stack gap="xs">
          {todayMatches.map((match, i) => {
            const key = scoreKey(match.home, match.away);
            const live = scores[key];
            const hs = live?.hs ?? match.home_score;
            const as_ = live?.as_ ?? match.away_score;
            const status = live?.status ?? (match.home_score != null ? 'ft' : 'upcoming');
            const isLive = status === 'live';
            const played = hs != null && as_ != null;

            return (
              <Card
                key={i}
                p={0}
                style={{
                  border: 'solid 1px var(--mantine-color-blue-7)',
                  background: 'linear-gradient(135deg, var(--mantine-color-dark-7) 0%, #152a45 100%)',
                  overflow: 'hidden',
                }}
              >
                <Box px="md" py={14} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text fw={700} fz="md" ta="right" lh={1.3} style={{ flex: 1 }}>{match.home}</Text>
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
                        <Text fw={600} fz="sm" c="dimmed">{match.time}</Text>
                        <Text fz={10} c="dimmed">Upcoming</Text>
                      </>
                    )}
                  </Box>
                  <Text fw={700} fz="md" ta="left" lh={1.3} style={{ flex: 1 }}>{match.away}</Text>
                </Box>

                <Box
                  px="md"
                  pb={10}
                  style={{ borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(0,0,0,.25)' }}
                >
                  <Text fz={10} tt="uppercase" c="dimmed" mb={6} style={{ letterSpacing: 1 }}>Predictions</Text>
                  <PredRow match={match} hs={hs ?? null} as_={as_ ?? null} played={played} />
                </Box>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
