/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const self: ServiceWorkerGlobalScope;

// Handle Periodic Background Sync — fires on Android Chrome when app is closed
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'fetch-scores') {
    event.waitUntil(fetchAndBroadcastScores());
  }
});

async function fetchAndBroadcastScores(): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const yesterday = (() => {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10).replace(/-/g, '');
    })();

    await Promise.all([
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${today}`, { cache: 'no-cache' }),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${yesterday}`, { cache: 'no-cache' }),
    ]);

    // Notify any open windows to re-fetch from DB
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.postMessage({ type: 'SCORES_UPDATED' });
    }
  } catch {
    // Network error — silent fail
  }
}
