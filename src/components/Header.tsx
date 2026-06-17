import { Box, Group, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertCircle, IconBallFootball, IconCircleCheck, IconLoader } from '@tabler/icons-react';

import type { ScoreInfo } from '../types';

interface HeaderProps {
  info: ScoreInfo;
}

export default function Header({ info }: HeaderProps) {
  const statusColor = info.loading ? 'yellow' : info.espnOk === false ? 'red' : 'green';
  const statusMsg = info.loading
    ? 'Fetching scores…'
    : `Updated ${info.lastUpdated?.toLocaleTimeString()} · ${info.count} scores cached · auto-refresh 5 min`;

  const StatusIcon = info.loading ? IconLoader : info.espnOk === false ? IconAlertCircle : IconCircleCheck;

  return (
    <Box
      style={{
        background: 'linear-gradient(160deg, #060f1e 0%, #0c2040 60%, #060f1e 100%)',
        borderBottom: '2px solid var(--mantine-color-blue-6)',
        padding: '16px',
        position: 'relative',
      }}
    >
      {/* İmamoğlu support badge */}
      <Box
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #e11d48',
            boxShadow: '0 0 10px rgba(225,29,72,0.5)',
            flexShrink: 0,
          }}
        >
          <img
            src="https://cdn.britannica.com/06/270806-050-3357F627/Istanbul-mayor-Ekrem-Imamoglu-speaks-to-supporters-at-a-political-campaign-rally-in-the-Maltepe-district-for-Istanbul-Turkey-May-6-2023.jpg?w=300"
            alt="Ekrem İmamoğlu"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <Text
          fw={700}
          ta="center"
          style={{
            color: '#fda4af',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            lineHeight: 1.3,
            fontSize: 9,
            width: 52,
            wordBreak: 'break-word',
          }}
        >
          #free
          <br />
          imamoğlu
        </Text>
      </Box>

      {/* Title — leave room for badge on right */}
      <Box pr={80}>
        <Group gap="xs" align="center" mb={4}>
          <IconBallFootball size={22} color="var(--mantine-color-blue-4)" />
          <Title order={1} fz={{ base: 'md', sm: 'xl' }} fw={800}>
            WC 2026 ·{' '}
            <Text span c="blue.4" inherit>
              Beylikdüzü
            </Text>{' '}
            Predictions
          </Title>
        </Group>
        <Text c="dimmed" fz="xs" mb={8}>
          USA · Canada · Mexico · June–July 2026
        </Text>
        <Group gap={6} align="center">
          <ThemeIcon size={14} radius="xl" color={statusColor} variant="filled">
            <StatusIcon size={10} />
          </ThemeIcon>
          <Text fz={11} c="dimmed">
            {statusMsg}
          </Text>
        </Group>
      </Box>
    </Box>
  );
}
