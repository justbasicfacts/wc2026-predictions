import { SimpleGrid, Card, Text, Stack, Box } from '@mantine/core';
import type { Standing } from '../types';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
const BORDER_COLORS = [
  'var(--mantine-color-yellow-5)',
  'var(--mantine-color-gray-5)',
  '#cd7c2e',
  'var(--mantine-color-dark-4)',
  'var(--mantine-color-dark-4)',
];

interface LeaderboardProps {
  standings: Standing[];
}

export default function Leaderboard({ standings }: LeaderboardProps) {
  return (
    <Box mb="md">
      <Text
        fz={11} fw={700} tt="uppercase" c="dimmed" mb="xs"
        style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 2 }}
      >
        🏆 Standings
        <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-dark-4)' }} />
      </Text>
      <SimpleGrid cols={{ base: 2, xs: 3, sm: 5 }} spacing="xs">
        {standings.map((s, i) => (
          <Card
            key={s.name}
            p="sm"
            style={{ border: `1px solid ${BORDER_COLORS[i] ?? BORDER_COLORS[4]}`, textAlign: 'center' }}
          >
            <Stack gap={2} align="center">
              <Text fz={24}>{MEDALS[i] ?? '🎮'}</Text>
              <Text fw={700} fz="sm">{s.name}</Text>
              <Text fw={900} fz={28} c="blue.4" lh={1}>{s.pts}</Text>
              <Text fz={10} tt="uppercase" c="dimmed">pts</Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
