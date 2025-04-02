import node from '@astrojs/node'
import AstroPWA from '@vite-pwa/astro'
import { defineConfig } from 'astro/config'

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
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    AstroPWA({
      mode: 'development',
      base: '/',
      scope: '/',
      includeAssets: ['favicon.svg'],
      registerType: 'autoUpdate',
      manifest: {
        name: 'Astro PWA',
        short_name: 'Astro PWA',
        theme_color: '#ffffff',
      },
      pwaAssets: {
        config: true,
      },
      workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
        navigateFallbackAllowlist: [/^\/$/],
        runtimeCaching: [{
          urlPattern: ({ url, sameOrigin, request }) => sameOrigin && request.mode === 'navigate' && !url.pathname.match(/^\/$/),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'offline-ssr-pages-cache',
            /* check the options in the workbox-build docs */
            matchOptions: {
              ignoreVary: true,
              ignoreSearch: true,
            },
            plugins: [{
              cachedResponseWillBeUsed: async (params) => {
                // When handlerDidError is invoked, then we can prevent redirecting if there is an entry in the cache.
                // To check the behavior, navigate to a product page, then disable the network and refresh the page.
                params.state ??= {}
                params.state.dontRedirect = params.cachedResponse
                console.log(`[SW] cachedResponseWillBeUsed ${params.request.url}, ${params.state ? JSON.stringify(params.state) : ''}`)
              },
              // This callback will be called when the fetch call fails.
              // Beware of the logic, will be also invoked if the server is down.
              handlerDidError: async ({ request, state, error }) => {
                if (state?.dontRedirect)
                  return state.dontRedirect

                console.log(`[SW] handlerDidError ${request.url}, ${state ? JSON.stringify(state) : ''}`)
                return error && 'name' in error && error.name === 'no-response'
                  ? Response.redirect(
                      state.dontRedirect.url,
                      404,
                    )
                  : undefined
              },
            }],
          },
        }],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/$/],
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
    }),
  ],
})
