export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export function showGoalNotification(home: string, away: string, hs: number, as_: number): void {
  if (Notification.permission !== 'granted') return;
  const body = `${home} ${hs} – ${as_} ${away}`;
  try {
    const n = new Notification('⚽ GOAL!', {
      body,
      icon: '/wc2026-predictions/icon-192.png',
      badge: '/wc2026-predictions/icon-192.png',
      tag: `goal-${home}-${away}`,   // replaces previous notification for same match
      silent: true,                  // we play our own sound
    });
    setTimeout(() => n.close(), 6000);
  } catch {
    // Notification API unavailable
  }
}
