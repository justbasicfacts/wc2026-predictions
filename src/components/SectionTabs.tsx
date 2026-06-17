import { useRef } from 'react';
import { UnstyledButton, Box } from '@mantine/core';

interface SectionTabsProps {
  sections: string[];
  active: string;
  onChange: (value: string) => void;
}

export default function SectionTabs({ sections, active, onChange }: SectionTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={scrollRef}
      mb="sm"
      style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {sections.map(s => {
        const isActive = s === active;
        return (
          <UnstyledButton
            key={s}
            onClick={() => onChange(s)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${isActive ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)'}`,
              background: isActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dark-7)',
              color: isActive ? '#fff' : 'var(--mantine-color-dimmed)',
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {s === 'all' ? 'All' : s}
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
