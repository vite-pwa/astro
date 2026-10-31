import type { VitePWAStrategy } from '@unplugin-pwa/core'
import type { SWType } from '@vite-pwa/workbox-build/types'
import type { AstroIntegration } from 'astro'
import type { AstroPWAOptions } from './types.ts'
import { createAstroPWAContext } from './create-context.ts'

export function AstroPWAIntegration<
  UserStrategy extends VitePWAStrategy,
  T extends SWType,
>(options: Partial<AstroPWAOptions<UserStrategy, T>> = {}): AstroIntegration {
  const ctx = createAstroPWAContext(options)

  return {
    name: '@vite-pwa/astro-integration',
    hooks: {
      'astro:config:setup': async ({
        command,
        config,
        updateConfig,
      }) => {
        ctx.astro.config = config
        switch (command) {
          case 'dev':
            ctx.astro.devEnvironment = true
            ctx.astro.doBuild = false
            break
          case 'preview':
          case 'sync':
            ctx.astro.config = config
            ctx.astro.devEnvironment = false
            ctx.astro.previewOrSync = true
            return
          case 'build':
            ctx.astro.config = config
            ctx.astro.devEnvironment = false
            ctx.astro.doBuild = true
            break
        }

        ctx.astro.scope = config.base ?? config.vite.base ?? '/'
        ctx.astro.trailingSlash = config.trailingSlash
        ctx.astro.useDirectoryFormat = config.build.format === 'directory'

        updateConfig({
          vite: {
            plugins: await import('./create-plugins.ts').then(({
              createPlugins,
            }) => createPlugins(ctx)),
          },
        })
      },
      'astro:build:done': async () => {
        if (!ctx.astro.doBuild) {
          return
        }

        const pwaAssetsGenerator = await ctx.pwaAssetsGenerator
        if (pwaAssetsGenerator) {
          await pwaAssetsGenerator.generate()
        }

        if (!ctx.resolvedOptions.disable) {
          await ctx.runBuild()
        }
      },
    },
  }
}
