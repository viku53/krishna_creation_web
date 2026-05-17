import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const TWO_MONTHS_SECONDS = 2 * 30 * 24 * 60 * 60 // 5 184 000 s

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Don't show an install prompt — this is purely for caching
      manifest: false,
      workbox: {
        // ── Cache strategy for static photo / video assets ────────────────
        runtimeCaching: [
          {
            // All /photos/** images served from the site
            urlPattern: /\/photos\/.+\.(webp|jpg|jpeg|png)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kc-photos-cache',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: TWO_MONTHS_SECONDS,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Drive thumbnail images (used in Videos grid)
            urlPattern: /^https:\/\/drive\.google\.com\/thumbnail/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kc-drive-thumbs-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: TWO_MONTHS_SECONDS,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Drive lh3 photo URLs (used in Photos GD section)
            urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/d\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kc-drive-photos-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: TWO_MONTHS_SECONDS,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // All /videos/** local video files
            urlPattern: /\/videos\/.+\.(mp4|webm|mov)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kc-videos-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: TWO_MONTHS_SECONDS,
              },
              cacheableResponse: { statuses: [0, 200] },
              // Videos can be large — use rangeRequests plugin
              rangeRequests: true,
            },
          },
          {
            // App shell — HTML, JS, CSS (network-first to get updates)
            urlPattern: /\.(js|css|html)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'kc-app-shell',
              expiration: { maxAgeSeconds: 7 * 24 * 60 * 60 }, // 1 week
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Pre-cache the app shell automatically
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
