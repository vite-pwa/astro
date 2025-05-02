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
        // fix workbox build error when using v7.3.0: missing `;` errors when building the service worker from the template
        runtimeCaching: [{
          urlPattern: ({ url, sameOrigin, request }) => sameOrigin && request.mode === 'navigate' && !url.pathname.match(/^\/$/),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'offline-ssr-pages-cache',
            /* check the options in the workbox-build docs */
            matchOptions: {
              ignoreVary: true,
              // eslint-disable-next-line style/comma-dangle
              ignoreSearch: true
            },
            cacheableResponse: {
              // eslint-disable-next-line style/comma-dangle
              statuses: [200]
            },
            expiration: {
              // eslint-disable-next-line style/comma-dangle
              maxEntries: 100
            },
            plugins: [{
              cachedResponseWillBeUsed: async (params) => {
                // When handlerDidError is invoked, then we can prevent redirecting if there is an entry in the cache.
                // To check the behavior, navigate to a product page, then disable the network and refresh the page.
                // eslint-disable-next-line style/semi
                params.state ??= {};
                // eslint-disable-next-line style/semi
                params.state.dontRedirect = params.cachedResponse;
                // eslint-disable-next-line style/semi
                console.log(`[SW] cachedResponseWillBeUsed ${params.request.url}, ${params.state ? JSON.stringify(params.state) : ''}`);
              },
              // This callback will be called when the fetch call fails.
              // Beware of the logic, will be also invoked if the server is down.
              handlerDidError: async ({ request, state, error }) => {
                if (state?.dontRedirect) {
                  // eslint-disable-next-line style/semi
                  return state.dontRedirect;
                }

                // eslint-disable-next-line style/semi
                console.log(`[SW] handlerDidError ${request.url}, ${state ? JSON.stringify(state) : ''}`);
                return error && 'name' in error && error.name === 'no-response'
                  ? Response.redirect(
                      state.dontRedirect.url,
                      404,
                    )
                  // eslint-disable-next-line style/semi
                  : undefined;
              // eslint-disable-next-line style/comma-dangle
              }
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
