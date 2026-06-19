import { SimpleGrid, Box, Text } from '@mantine/core';
import { calcPoints, classify } from '../utils/scoring';
import GAME_DATA from '../data/gameData';
import type { Match } from '../types';

const CL_STYLES: Record<string, React.CSSProperties> = {
  exact:     { background: 'rgba(16,185,129,.16)', border: '1px solid rgba(16,185,129,.45)' },
  tendency:  { background: 'rgba(245,158,11,.11)',  border: '1px solid rgba(245,158,11,.38)' },
  miss:      { background: 'rgba(239,68,68,.09)',   border: '1px solid rgba(239,68,68,.28)' },
  pending:   { background: 'rgba(14,165,233,.07)',  border: '1px solid rgba(14,165,233,.2)' },
  none:      { background: 'rgba(28,48,80,.4)',     border: '1px solid var(--mantine-color-dark-4)', opacity: 0.5 },
};

interface PredRowProps {
  match: Match;
  hs: number | null;
  as_: number | null;
  played: boolean;
}

export default function PredRow({ match, hs, as_, played }: PredRowProps) {
  return (
    <SimpleGrid cols={GAME_DATA.players.length} spacing={4}>
      {GAME_DATA.players.map(p => {
        const g = match.guesses[p];
        const gh = g?.home ?? null;
        const ga = g?.away ?? null;
        const cl = classify(hs, as_, gh, ga);
        const pts = played && gh != null ? calcPoints(hs, as_, gh, ga) : 0;

        return (
          <Box key={p} style={{ borderRadius: 6, textAlign: 'center', padding: '4px 2px', ...CL_STYLES[cl] }}>
            <Text fz={8} tt="uppercase" c="dimmed" fw={600} mb={1} style={{ letterSpacing: 0.3 }}>
              {p}
            </Text>
            <Text fz={11} fw={700} lh={1.2}>
              {gh != null ? `${gh}–${ga}` : '—'}
            </Text>
            {played && gh != null && (
              <Text fz={8} c={pts > 0 ? 'green.5' : 'dimmed'} fw={pts > 0 ? 700 : 400}>
                {pts > 0 ? `+${pts}p` : '0p'}
              </Text>
            )}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
