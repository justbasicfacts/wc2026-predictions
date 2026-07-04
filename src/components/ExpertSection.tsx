import { Card, SimpleGrid, Box, Text, Stack, Group, Badge } from '@mantine/core';
import GAME_DATA from '../data/gameData';
import type { ExpertQuestion, ExpertStats } from '../types';

interface ExpertSectionProps {
  questions: ExpertQuestion[];
  stats?: ExpertStats;
}

/** Classify a question and return the current live value string, or null if
 * we don't have a running answer for this question yet. */
function liveValueFor(question: string, stats: ExpertStats | undefined): string | null {
  if (!stats || stats.matchesCounted === 0) return null;
  const q = question.toLowerCase();
  if (q.includes('how many goals')) {
    return `${stats.totalGoals} goals · ${stats.matchesCounted} match${stats.matchesCounted === 1 ? '' : 'es'}`;
  }
  if (q.includes('sending-off') || q.includes('sending off') || q.includes('red card')) {
    return `${stats.totalReds} so far`;
  }
  if (q.includes('most goals') || q.includes('top scorer')) {
    const top = stats.topScorers[0];
    if (!top) return null;
    const tied = stats.topScorers.filter(s => s.goals === top.goals);
    if (tied.length > 1) return `${top.goals} — ${tied.map(t => t.name).join(', ')}`;
    return `${top.name} — ${top.goals}`;
  }
  return null;
}

export default function ExpertSection({ questions, stats }: ExpertSectionProps) {
  return (
    <Box mt="md">
      <Text
        fz={11} fw={700} tt="uppercase" c="dimmed" mb="xs"
        style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 2 }}
      >
        🎯 Expert Questions
        <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-dark-4)' }} />
      </Text>
      <Stack gap="xs">
        {questions.map((q, i) => {
          const live = liveValueFor(q.question, stats);
          return (
            <Card key={i} p="md">
              <Group justify="space-between" align="flex-start" gap="xs" mb="sm" wrap="nowrap">
                <Text fw={600} fz="sm" style={{ flex: 1 }}>{q.question}</Text>
                {live && (
                  <Badge
                    color="teal"
                    variant="light"
                    size="sm"
                    radius="sm"
                    styles={{ label: { textTransform: 'none', fontWeight: 600 } }}
                  >
                    Live: {live}
                  </Badge>
                )}
              </Group>
              <SimpleGrid cols={{ base: 2, xs: GAME_DATA.players.length }} spacing="xs">
                {GAME_DATA.players.map(p => {
                  const g = q.guesses[p];
                  const ans = g?.answer && g.answer !== 'None' ? g.answer : '—';
                  const hasPoints = (g?.points ?? 0) > 0;
                  return (
                    <Box
                      key={p}
                      p={8}
                      style={{
                        borderRadius: 8,
                        textAlign: 'center',
                        background: hasPoints
                          ? 'rgba(16,185,129,.12)'
                          : 'var(--mantine-color-dark-6)',
                        border: `1px solid ${hasPoints ? 'rgba(16,185,129,.4)' : 'var(--mantine-color-dark-4)'}`,
                      }}
                    >
                      <Text fz={9} tt="uppercase" c="dimmed" fw={600} mb={4} style={{ letterSpacing: 0.4 }}>
                        {p}
                      </Text>
                      <Text fz={13} fw={600} style={{ wordBreak: 'break-word' }}>
                        {ans}
                      </Text>
                      {hasPoints && (
                        <Text fz={9} c="green.5" fw={700} mt={2}>+{g.points}p</Text>
                      )}
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
