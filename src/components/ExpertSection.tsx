import { Card, SimpleGrid, Box, Text, Stack } from '@mantine/core';
import GAME_DATA from '../data/gameData';
import type { ExpertQuestion } from '../types';

interface ExpertSectionProps {
  questions: ExpertQuestion[];
}

export default function ExpertSection({ questions }: ExpertSectionProps) {
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
        {questions.map((q, i) => (
          <Card key={i} p="md">
            <Text fw={600} fz="sm" mb="sm">{q.question}</Text>
            <SimpleGrid cols={{ base: 2, xs: 3, sm: 5 }} spacing="xs">
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
        ))}
      </Stack>
    </Box>
  );
}
