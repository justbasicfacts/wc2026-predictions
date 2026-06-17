/**
 * Plays a synthesized goal horn using the Web Audio API.
 * No audio files required.
 */
export function playGoalSound(): void {
  try {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.4, ctx.currentTime);
    master.connect(ctx.destination);

    // Three ascending horn blasts: classic stadium goal horn pattern
    const blasts = [
      { freq: 440, start: 0,   dur: 0.35 },
      { freq: 554, start: 0.4, dur: 0.35 },
      { freq: 659, start: 0.8, dur: 0.6  },
    ];

    for (const b of blasts) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(b.freq, ctx.currentTime + b.start);
      // slight vibrato at the end of the last blast
      if (b.start === 0.8) {
        osc.frequency.setValueAtTime(b.freq, ctx.currentTime + b.start + 0.3);
        osc.frequency.linearRampToValueAtTime(b.freq * 1.03, ctx.currentTime + b.start + b.dur);
      }

      env.gain.setValueAtTime(0, ctx.currentTime + b.start);
      env.gain.linearRampToValueAtTime(1, ctx.currentTime + b.start + 0.02);
      env.gain.setValueAtTime(1, ctx.currentTime + b.start + b.dur - 0.05);
      env.gain.linearRampToValueAtTime(0, ctx.currentTime + b.start + b.dur);

      osc.connect(env);
      env.connect(master);
      osc.start(ctx.currentTime + b.start);
      osc.stop(ctx.currentTime + b.start + b.dur);
    }

    // Auto-close context after sound finishes
    setTimeout(() => void ctx.close(), 2000);
  } catch {
    // Audio not supported — silent fail
  }
}
