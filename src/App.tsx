import { useState, useMemo } from 'react';
import { Box, Group, Text } from '@mantine/core';
import { useScores } from './hooks/useScores';
import Header from './components/Header';
import InstallBanner from './components/InstallBanner';
import Leaderboard from './components/Leaderboard';
import TodaySection from './components/TodaySection';
import SectionTabs from './components/SectionTabs';
import MatchList from './components/MatchList';
import ExpertSection from './components/ExpertSection';
import GAME_DATA from './data/gameData';
import { calcPoints } from './utils/scoring';
import { scoreKey } from './utils/teamNames';
import type { Standing } from './types';

function calcStandings(scores: Record<string, { hs: number; as_: number }>): Standing[] {
  const totals = Object.fromEntries(GAME_DATA.players.map(p => [p, 0]));

  for (const m of GAME_DATA.matches) {
    const key = scoreKey(m.home, m.away);
    const live = scores[key];
    const hs = live?.hs ?? m.home_score;
    const as_ = live?.as_ ?? m.away_score;
    if (hs == null || as_ == null) continue;
    for (const p of GAME_DATA.players) {
      const g = m.guesses[p];
      if (g?.home != null) totals[p] = (totals[p] ?? 0) + calcPoints(hs, as_, g.home, g.away);
    }
  }

  for (const q of GAME_DATA.expert_questions) {
    for (const p of GAME_DATA.players) {
      totals[p] = (totals[p] ?? 0) + (q.guesses[p]?.points ?? 0);
    }
  }

  return Object.entries(totals)
    .map(([name, pts]) => ({ name, pts }))
    .sort((a, b) => b.pts - a.pts);
}

const ALL_SECTIONS = ['all', ...new Set(GAME_DATA.matches.map(m => m.section))];

const LEGEND = [
  { label: 'Exact (3pts)',    color: 'rgba(16,185,129,.7)' },
  { label: 'Tendency (1pt)', color: 'rgba(245,158,11,.7)' },
  { label: 'Miss',           color: 'rgba(239,68,68,.7)' },
  { label: 'No guess',       color: 'var(--mantine-color-dark-4)' },
];

export default function App() {
  const { scores, odds, info, forceRefresh } = useScores();
  const [section, setSection] = useState('all');
  // info.lastUpdated changes every fetch; scores is a stable object ref so alone won't trigger useMemo
  const standings = useMemo(() => calcStandings(scores), [scores, info.lastUpdated]);

  return (
    <Box maw={720} mx="auto">
      <InstallBanner />
      <Header info={info} onRefresh={forceRefresh} />
      <Box p="sm" pb={60}>
        <TodaySection matches={GAME_DATA.matches} scores={scores} odds={odds} />
        <Leaderboard standings={standings} />

        <Text fz={11} fw={700} tt="uppercase" c="dimmed" mt="md" mb="xs"
          style={{ display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 2 }}>
          📋 All Matches
          <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-dark-4)' }} />
        </Text>

        {/* Legend */}
        <Group gap="sm" mb="sm" px="xs" py={8}
          style={{
            background: 'var(--mantine-color-dark-7)',
            borderRadius: 8,
            border: '1px solid var(--mantine-color-dark-4)',
            flexWrap: 'wrap',
          }}
        >
          {LEGEND.map(l => (
            <Group key={l.label} gap={5} align="center">
              <Box w={8} h={8} style={{ borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <Text fz={11} c="dimmed">{l.label}</Text>
            </Group>
          ))}
        </Group>

        <SectionTabs sections={ALL_SECTIONS} active={section} onChange={setSection} />
        <MatchList matches={GAME_DATA.matches} scores={scores} odds={odds} section={section} />
        <ExpertSection questions={GAME_DATA.expert_questions} />
      </Box>
    </Box>
  );
}
