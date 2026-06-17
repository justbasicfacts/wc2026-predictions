import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'WC 2026 · Beylikdüzü Predictions',
        short_name: 'WC 2026',
        description: 'FIFA World Cup 2026 prediction game – Beylikdüzü Edition',
        theme_color: '#0c2040',
        background_color: '#080f1c',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/wc2026-predictions/',
        start_url: '/wc2026-predictions/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/site\.api\.espn\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'espn-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
  base: '/wc2026-predictions/',
});
