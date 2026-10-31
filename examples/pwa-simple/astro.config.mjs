import { AstroPWAIntegration } from '@vite-pwa/astro'
import { DevTools } from '@vitejs/devtools'
import { defineConfig } from 'astro/config'
import Inspect from 'vite-plugin-inspect'

// https://astro.build/config
export default defineConfig({
  vite: {
    logLevel: 'info',
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
    server: {
      fs: {
        // Allow serving files from hoisted root node_modules
        allow: ['../..'],
      },
    },
    plugins: [DevTools(), Inspect()],
  },
  integrations: [
    AstroPWAIntegration({
      mode: 'development',
      base: '/',
      scope: '/',
      includeAssets: ['favicon.svg'],
      registerType: 'autoUpdate',
      swType: 'classic-and-module',
      manifest: {
        name: 'Astro PWA',
        short_name: 'Astro PWA',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      generateSW: {
        navigateFallback: '/',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        inspector: 'vite-devtools',
        navigateFallbackAllowlist: [/^\/$/],
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
    }),
  ],
})
