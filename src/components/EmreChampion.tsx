import { useEffect, useRef, useState } from 'react';
import { Box, Text, Button, Stack } from '@mantine/core';
// Importing from src/assets/ lets Vite hash the filename on every build, so
// any new photo automatically invalidates the browser + service-worker cache
// (no manual version bump needed).
import emreChampionPhoto from '../assets/emre-champion.jpg';

/** localStorage key. Deleting this key from browser storage re-shows the modal. */
const DISMISS_KEY = 'emre-champion-dismissed';

/** YouTube video id for Queen — "We Are the Champions" (official audio). */
const YT_ID = '04854XqcfCY';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; vrot: number;
  size: number; color: string;
  shape: 'rect' | 'circle';
}

const COLORS = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#facc15'];

function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const spawnBurst = () => {
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20,
          vx: (Math.random() - 0.5) * 4,
          vy: 2 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.3,
          size: 6 + Math.random() * 8,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: Math.random() < 0.6 ? 'rect' : 'circle',
        });
      }
    };
    spawnBurst();
    const spawnTimer = setInterval(spawnBurst, 900);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.rot += p.vrot;
        if (p.y > canvas.height + 40) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(spawnTimer);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10001,
      }}
    />
  );
}

export default function EmreChampion() {
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem(DISMISS_KEY) !== '1'; }
    catch { return true; }
  });
  // Whether the hidden YouTube iframe is mounted (mounted → attempts to autoplay).
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    if (!open) return;
    // Lock scroll while modal is up.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const close = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setMusicOn(false);
    setOpen(false);
  };

  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #030712 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      }}
    >
      <ConfettiCanvas />

      <Stack
        align="center"
        gap="lg"
        style={{
          position: 'relative',
          zIndex: 10002,
          maxWidth: 640,
          width: '100%',
        }}
      >
        <Box style={{ width: '100%', textAlign: 'center' }}>
          <Text
            fw={900}
            style={{
              // "CONGRATULATIONS" has 15 characters — scale to fit narrow
              // screens without clipping. Cap around 44px on wide screens.
              fontSize: 'clamp(20px, 5.4vw, 44px)',
              letterSpacing: 1,
              lineHeight: 1.05,
              background: 'linear-gradient(90deg,#f59e0b,#ef4444,#22c55e,#3b82f6,#a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(245,158,11,.35)',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            🏆 CONGRATULATIONS 🏆
          </Text>
          <Text
            fw={900}
            style={{
              fontSize: 'clamp(28px, 9vw, 64px)',
              letterSpacing: 3,
              lineHeight: 1.05,
              marginTop: 4,
              background: 'linear-gradient(90deg,#f59e0b,#ef4444,#22c55e,#3b82f6,#a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(245,158,11,.35)',
            }}
          >
            EMRE
          </Text>
        </Box>

        <Box
          style={{
            border: '4px solid #f59e0b',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(245,158,11,.5)',
            background: '#000',
            maxWidth: '100%',
          }}
        >
          <img
            src={emreChampionPhoto}
            alt="Emre the champion"
            onError={(e) => {
              // If the file is missing, hide the img and show a fallback badge.
              const el = e.currentTarget;
              el.style.display = 'none';
              const fallback = el.parentElement?.querySelector('[data-fallback]') as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
            style={{ display: 'block', width: '100%', maxWidth: 480, height: 'auto' }}
          />
          <Box
            data-fallback
            style={{
              display: 'none',
              width: 480,
              height: 480,
              maxWidth: '80vw',
              maxHeight: '60vh',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 120,
            }}
          >
            🥒
          </Box>
        </Box>

        <Text fw={700} c="yellow.4" ta="center" fz="lg">
          🎉 Mathematical champion of the Beylikdüzü League 🎉
        </Text>

        <Button
          size="lg"
          color="yellow"
          radius="xl"
          onClick={close}
          style={{ fontWeight: 800, letterSpacing: 1 }}
        >
          🎈 Close celebration
        </Button>

        <Text fz={10} c="dimmed" ta="center" style={{ maxWidth: 420 }}>
          You'll only see this once. To watch it again, clear this site's local
          storage (DevTools → Application → Local Storage → delete{' '}
          <code>emre-champion-dismissed</code>).
        </Text>
      </Stack>

      {musicOn && (
        // Hidden YouTube iframe: autoplay carries the audio track. Some browsers
        // block autoplay-with-sound without a prior user gesture; on those, the
        // page will remain silent but everything else still works.
        <iframe
          title="we-are-the-champions"
          src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
          allow="autoplay; encrypted-media"
          style={{
            position: 'fixed',
            width: 1,
            height: 1,
            border: 0,
            opacity: 0,
            pointerEvents: 'none',
            left: -9999,
            top: -9999,
          }}
        />
      )}
    </Box>
  );
}
