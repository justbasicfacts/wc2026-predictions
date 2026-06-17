/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const self: ServiceWorkerGlobalScope;

// Workbox injects the precache manifest here at build time — do not remove
// The import-free declaration keeps the literal intact after Vite bundling
// Workbox replaces self.__WB_MANIFEST at build time — assignment prevents tree-shaking
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(self as any).__precacheManifest = (self as any).__WB_MANIFEST;

// Take control immediately on install/activate so new assets are used right away
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Handle Periodic Background Sync (Android Chrome only)
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'fetch-scores') {
    event.waitUntil(fetchAndBroadcast());
  }
});

async function fetchAndBroadcast(): Promise<void> {
  try {
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
    const today = fmt(new Date());
    const yesterday = fmt(new Date(Date.now() - 864e5));
    await Promise.all([
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${today}`, { cache: 'no-cache' }),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${yesterday}`, { cache: 'no-cache' }),
    ]);
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) client.postMessage({ type: 'SCORES_UPDATED' });
  } catch { /* silent */ }
}
