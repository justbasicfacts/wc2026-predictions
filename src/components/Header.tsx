import { useState } from 'react';
import { Box, Group, Text, ThemeIcon, Title, ActionIcon, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconBallFootball, IconBell, IconBellOff, IconCircleCheck, IconLoader, IconTestPipe } from '@tabler/icons-react';
import { requestNotificationPermission, showGoalNotification } from '../utils/notifications';
import { playGoalSound } from '../utils/sound';
import type { ScoreInfo } from '../types';

interface HeaderProps {
  info: ScoreInfo;
  onRefresh: () => void;
}

export default function Header({ info, onRefresh }: HeaderProps) {
  const statusColor = info.loading ? 'yellow' : info.espnOk === false ? 'red' : 'green';
  const StatusIcon = info.loading ? IconLoader : info.espnOk === false ? IconAlertCircle : IconCircleCheck;

  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  );

  const handleNotifToggle = async () => {
    if (notifPerm === 'granted') return;
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
    if (perm === 'granted') playGoalSound();
  };

  const notifGranted = notifPerm === 'granted';
  const notifDenied = notifPerm === 'denied';

  const updatedTime = info.lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const statusMsg = info.loading
    ? 'Fetching scores…'
    : `${updatedTime} · ${info.count} cached`;

  return (
    <Box
      style={{
        background: 'linear-gradient(160deg, #060f1e 0%, #0c2040 60%, #060f1e 100%)',
        borderBottom: '2px solid var(--mantine-color-blue-6)',
        padding: '12px 14px',
        position: 'relative',
      }}
    >
      {/* İmamoğlu badge — absolute top-right */}
      <Box style={{ position: 'absolute', top: 10, right: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Box style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e11d48', boxShadow: '0 0 8px rgba(225,29,72,0.5)' }}>
          <img
            src="https://cdn.britannica.com/06/270806-050-3357F627/Istanbul-mayor-Ekrem-Imamoglu-speaks-to-supporters-at-a-political-campaign-rally-in-the-Maltepe-district-for-Istanbul-Turkey-May-6-2023.jpg?w=300"
            alt="Ekrem İmamoğlu"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        <Text fw={700} ta="center" style={{ color: '#fda4af', fontSize: 8, lineHeight: 1.3, width: 46, wordBreak: 'break-word' }}>
          #free imamoğlu
        </Text>
      </Box>

      {/* Title area — pad right to avoid badge */}
      <Box style={{ paddingRight: 58 }}>
        <Group gap={6} align="center" mb={2}>
          <IconBallFootball size={18} color="var(--mantine-color-blue-4)" />
          <Title order={1} fz={{ base: 'sm', sm: 'xl' }} fw={800} style={{ lineHeight: 1.2 }}>
            WC 2026 ·{' '}
            <Text span c="blue.4" inherit>Beylikdüzü</Text>{' '}
            Predictions
          </Title>
        </Group>

        <Text c="dimmed" fz={11} mb={6}>
          USA · Canada · Mexico · June–July 2026
        </Text>

        {/* Status row */}
        <Group gap={6} align="center" wrap="nowrap">
          <ThemeIcon size={13} radius="xl" color={statusColor} variant="filled" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={onRefresh}>
            <StatusIcon size={9} />
          </ThemeIcon>
          <Text fz={10} c="dimmed" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {statusMsg}
          </Text>

          {/* Test button — localhost only */}
          {notifGranted && window.location.hostname === 'localhost' && (
            <Tooltip label="Test goal notification" position="bottom" withArrow>
              <ActionIcon size="xs" variant="subtle" color="yellow"
                onClick={() => { playGoalSound(); showGoalNotification('Turkey', 'Brazil', 1, 0); }}
              >
                <IconTestPipe size={11} />
              </ActionIcon>
            </Tooltip>
          )}

          {/* Bell toggle */}
          {'Notification' in window && (
            <Tooltip
              label={notifGranted ? 'Goal alerts on' : notifDenied ? 'Blocked in browser settings' : 'Enable goal alerts'}
              position="bottom" withArrow
            >
              <ActionIcon
                size="xs"
                variant={notifGranted ? 'filled' : 'subtle'}
                color={notifGranted ? 'green' : notifDenied ? 'red' : 'gray'}
                onClick={handleNotifToggle}
                disabled={notifDenied}
              >
                {notifGranted ? <IconBell size={11} /> : <IconBellOff size={11} />}
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Box>
    </Box>
  );
}
