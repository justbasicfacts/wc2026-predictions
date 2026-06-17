import { useState, useEffect } from 'react';
import { Box, Button, Text, Group, CloseButton } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  const install = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setPrompt(null);
    else setDismissed(true);
  };

  return (
    <Box
      px="sm"
      py={10}
      style={{
        background: 'linear-gradient(90deg, #0c2040, #172540)',
        borderBottom: '1px solid var(--mantine-color-blue-8)',
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <Text fz={20}>⚽</Text>
          <Box>
            <Text fz={13} fw={600} lh={1.3}>Install WC 2026</Text>
            <Text fz={11} c="dimmed">Add to home screen for quick access</Text>
          </Box>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Button
            size="xs"
            leftSection={<IconDownload size={13} />}
            onClick={install}
          >
            Install
          </Button>
          <CloseButton size="sm" c="dimmed" onClick={() => setDismissed(true)} />
        </Group>
      </Group>
    </Box>
  );
}
