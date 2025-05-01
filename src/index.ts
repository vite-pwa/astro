import type { AstroConfig, AstroIntegration } from 'astro'
import type { Plugin } from 'vite'
import type { VitePluginPWAAPI, VitePWAOptions } from 'vite-plugin-pwa'
import type { ManifestTransform } from 'workbox-build'
import { fileURLToPath } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

interface EnableManifestTransform {
  preview: boolean
  doBuild: boolean
  scope: string
  useDirectoryFormat: boolean
  trailingSlash: 'never' | 'always' | 'ignore'
}

export interface PwaOptions extends Partial<VitePWAOptions> {
  experimental?: {
    /**
     * When using `generateSW` strategy, include custom directory and trailing slash handler.
     *
     * @see https://github.com/vite-pwa/astro/issues/23
     *
     * @default false
     */
    directoryAndTrailingSlashHandler?: boolean
  }
}

export default function (options: PwaOptions = {}): AstroIntegration {
  let pwaPlugin: Plugin | undefined
  const ctx: EnableManifestTransform = {
    preview: false,
    doBuild: false,
    scope: '/',
    trailingSlash: 'ignore',
    useDirectoryFormat: true,
  }

  const enableManifestTransform = (): EnableManifestTransform => {
    return ctx
  }
  return {
    name: '@vite-pwa/astro-integration',
    hooks: {
      'astro:config:setup': ({ command, config, updateConfig }) => {
        if (command === 'preview') {
          ctx.preview = true
          return
        }

        ctx.scope = config.base ?? config.vite.base ?? '/'
        ctx.trailingSlash = config.trailingSlash
        ctx.useDirectoryFormat = config.build.format === 'directory'

        let plugins = getViteConfiguration(
          config,
          options,
          ctx.useDirectoryFormat,
          enableManifestTransform,
        )

        if (command === 'build')
          plugins = plugins.filter(p => 'name' in p && p.name !== 'vite-plugin-pwa:dev-sw')
        else
          plugins = plugins.filter(p => 'name' in p && p.name !== 'vite-plugin-pwa:build')

        updateConfig({
          vite: {
            // @ts-expect-error TS2322: Type Plugin<any>[] is not assignable to type DeepPartial<PluginOption[] | undefined
            plugins,
          },
        })
      },
      'astro:config:done': ({ config }) => {
        if (ctx.preview)
          return

        pwaPlugin = config.vite!.plugins!.flat(Number.POSITIVE_INFINITY).find(p => p.name === 'vite-plugin-pwa')!
      },
      'astro:build:done': async () => {
        if (ctx.preview)
          return

        ctx.doBuild = true
        await regeneratePWA(pwaPlugin)
      },
    },
  }
}

function createManifestTransform(enableManifestTransform: () => EnableManifestTransform): ManifestTransform {
  return async (entries) => {
    const { doBuild, trailingSlash, scope, useDirectoryFormat } = enableManifestTransform()
    if (!doBuild)
      return { manifest: entries, warnings: [] }

    // apply transformation only when build enabled
    entries.filter(e => e && e.url.endsWith('.html')).forEach((e) => {
      const url = e.url.startsWith('/') ? e.url.slice(1) : e.url
      if (url === 'index.html') {
        e.url = scope
      }
      else {
        const parts = url.split('/')
        parts[parts.length - 1] = parts[parts.length - 1].replace(/\.html$/, '')
        e.url = useDirectoryFormat
          ? parts.length > 1 ? parts.slice(0, parts.length - 1).join('/') : parts[0]
          : parts.join('/')

        if (trailingSlash === 'always')
          e.url += '/'
      }
    })

    return { manifest: entries, warnings: [] }
  }
}

function createExperimentalManifestTransform(enableManifestTransform: () => EnableManifestTransform): ManifestTransform {
  return async (entries) => {
    const { doBuild, trailingSlash, scope, useDirectoryFormat } = enableManifestTransform()
    if (!doBuild)
      return { manifest: entries, warnings: [] }

    const additionalEntries: Parameters<ManifestTransform>[0] = []

    // apply transformation only when build enabled
    entries.filter(e => e && e.url.endsWith('.html')).forEach((e) => {
      const url = e.url.startsWith('/') ? e.url.slice(1) : e.url
      if (url === 'index.html') {
        additionalEntries.push({
          revision: e.revision,
          url: scope,
          size: e.size,
        })
      }
      else if (url === '404.html') {
        e.url = `404${trailingSlash === 'always' ? '/' : ''}`
      }
      else {
        const parts = url.split('/')
        parts[parts.length - 1] = parts[parts.length - 1].replace(/\.html$/, '')
        let newUrl = useDirectoryFormat
          ? parts.length > 1 ? parts.slice(0, parts.length - 1).join('/') : parts[0]
          : parts.join('/')

        if (trailingSlash === 'always')
          newUrl += '/'

        additionalEntries.push({
          revision: e.revision,
          url: newUrl,
          size: e.size,
        })
      }
    })

    if (additionalEntries.length)
      entries.push(...additionalEntries)

    return { manifest: entries, warnings: [] }
  }
}

function getViteConfiguration(
  config: AstroConfig,
  options: PwaOptions,
  directoryFormat: boolean,
  enableManifestTransform: () => EnableManifestTransform,
) {
  // @ts-expect-error TS2589: Type instantiation is excessively deep and possibly infinite.
  const plugin = config.vite?.plugins?.flat(Number.POSITIVE_INFINITY).find(p => p.name === 'vite-plugin-pwa')
  if (plugin)
    throw new Error('Remove the vite-plugin-pwa plugin from Vite Plugins entry in Astro config file, configure it via @vite-pwa/astro integration')

  // icons are there when `astro:build:done` hook is called
  options.includeManifestIcons = false

  const {
    strategies = 'generateSW',
    registerType = 'prompt',
    injectRegister,
    workbox = {},
    ...rest
  } = options

  let assets = config.build.assets ?? '_astro/'
  if (assets[0] === '/')
    assets = assets.slice(1)
  if (assets[assets.length - 1] !== '/')
    assets += '/'

  const adapter = config.adapter?.name

  if (adapter)
    options.outDir = fileURLToPath(config.build.client)

  if (options.pwaAssets) {
    options.pwaAssets.integration = {
      baseUrl: config.base ?? config.vite.base ?? '/',
      publicDir: fileURLToPath(config.publicDir),
      outDir: fileURLToPath(config.adapter?.name ? config.build.client : config.outDir),
    }
  }

  if (strategies === 'generateSW') {
    const useWorkbox = { ...workbox }
    const newOptions: Partial<VitePWAOptions> = {
      ...rest,
      strategies,
      registerType,
      injectRegister,
    }

    if (adapter)
      useWorkbox.globDirectory = fileURLToPath(config.build.client)

    // the user may want to disable offline support
    if (!('navigateFallback' in useWorkbox))
      useWorkbox.navigateFallback = config.base ?? config.vite?.base ?? '/'

    if (directoryFormat)
      useWorkbox.directoryIndex = 'index.html'

    newOptions.workbox = useWorkbox
    // Astro4/ Vite5 support: allow override dontCacheBustURLsMatching
    if (!('dontCacheBustURLsMatching' in newOptions.workbox))
      newOptions.workbox.dontCacheBustURLsMatching = new RegExp(assets)

    if (!newOptions.workbox.manifestTransforms) {
      newOptions.workbox.manifestTransforms = newOptions.workbox.manifestTransforms ?? []
      newOptions.workbox.manifestTransforms.push(
        options.experimental?.directoryAndTrailingSlashHandler === true
          ? createExperimentalManifestTransform(enableManifestTransform)
          : createManifestTransform(enableManifestTransform),
      )
    }

    return VitePWA(newOptions)
  }

  options.injectManifest = options.injectManifest ?? {}

  if (adapter)
    options.injectManifest.globDirectory = fileURLToPath(config.build.client)

  // Astro4/ Vite5 support: allow override dontCacheBustURLsMatching
  if (!('dontCacheBustURLsMatching' in options.injectManifest))
    options.injectManifest.dontCacheBustURLsMatching = new RegExp(assets)

  if (!options.injectManifest.manifestTransforms) {
    options.injectManifest.manifestTransforms = options.injectManifest.manifestTransforms ?? []
    options.injectManifest.manifestTransforms.push(
      options.experimental?.directoryAndTrailingSlashHandler === true
        ? createExperimentalManifestTransform(enableManifestTransform)
        : createManifestTransform(enableManifestTransform),
    )
  }

  return VitePWA(options)
}

async function regeneratePWA(pwaPlugin: Plugin | undefined) {
  const api: VitePluginPWAAPI | undefined = pwaPlugin?.api
  if (api && !api.disabled) {
    // regenerate the sw: there is no need to generate the webmanifest again
    await api.generateSW()
  }
}
