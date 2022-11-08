import { VitePWA, type VitePWAOptions, type VitePluginPWAAPI } from 'vite-plugin-pwa'
import type { AstroConfig, AstroIntegration } from 'astro'
import type { Plugin } from 'vite'
import type { ManifestTransform } from 'workbox-build'

export default function (options: Partial<VitePWAOptions> = {}): AstroIntegration {
  let pwaPlugin: Plugin | undefined
  let trailingSlash: 'never' | 'always' | 'ignore' = 'ignore'
  let useDirectoryFormat = true
  let doBuild = false
  let scope = '/'
  const enableManifestTransform: EnableManifestTransform = () => {
    return { doBuild, useDirectoryFormat, scope, trailingSlash }
  }
  return {
    name: '@vite-pwa/astro-integration',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        updateConfig({ vite: getViteConfiguration(config, options, enableManifestTransform) })
      },
      'astro:config:done': ({ config }) => {
        scope = config.base ?? config.vite.base ?? '/'
        trailingSlash = config.trailingSlash
        useDirectoryFormat = config.build.format === 'directory'
        pwaPlugin = config.vite!.plugins!.flat(Infinity).find(p => p.name === 'vite-plugin-pwa')!
      },
      'astro:build:done': async () => {
        doBuild = true
        await regeneratePWA(pwaPlugin)
      },
    },
  }
}

type EnableManifestTransform = () => {
  doBuild: boolean
  scope: string
  useDirectoryFormat: boolean
  trailingSlash: 'never' | 'always' | 'ignore'
}

function createManifestTransform(enableManifestTransform: EnableManifestTransform): ManifestTransform {
  return async (entries) => {
    const { doBuild, trailingSlash, scope, useDirectoryFormat } = enableManifestTransform()
    if (!doBuild || !useDirectoryFormat)
      return { manifest: entries, warnings: [] }

    // apply transformation only when using directory format
    entries.filter(e => e && e.url.endsWith('.html')).forEach((e) => {
      if (e.url === 'index.html') {
        e.url = scope
      }
      else if (e.url === '404.html') {
        e.url = `${scope}404`
      }
      else {
        const url = e.url.slice(0, e.url.lastIndexOf('/'))
        if (trailingSlash === 'always')
          e.url = `${scope}${url}/`
        else
          e.url = `${scope}${url}`
      }
    })

    return { manifest: entries, warnings: [] }
  }
}

function getViteConfiguration(
  config: AstroConfig,
  options: Partial<VitePWAOptions>,
  enableManifestTransform: EnableManifestTransform,
) {
  // @ts-expect-error TypeScript doesn't handle flattening Vite's plugin type properly
  const plugin = config.vite?.plugins?.flat(Infinity).find(p => p.name === 'vite-plugin-pwa')
  if (plugin)
    throw new Error('Remove the vite-plugin-pwa plugin from Vite Plugins entry in Astro config file, configure it via @vite-pwa/astro integration')

  const {
    strategies = 'generateSW',
    registerType = 'prompt',
    injectRegister,
    workbox = {},
    injectManifest = {},
    ...rest
  } = options

  if (strategies === 'generateSW') {
    const useWorkbox = { ...workbox }
    const newOptions: Partial<VitePWAOptions> = {
      ...rest,
      strategies,
      registerType,
      injectRegister,
    }

    if (!useWorkbox.navigateFallback)
      useWorkbox.navigateFallback = config.base ?? config.vite?.base ?? '/'

    newOptions.workbox = useWorkbox

    newOptions.workbox.manifestTransforms = newOptions.workbox.manifestTransforms ?? []
    newOptions.workbox.manifestTransforms.push(createManifestTransform(enableManifestTransform))

    return {
      plugins: [VitePWA(newOptions)],
    }
  }

  options.injectManifest = options.injectManifest ?? {}
  options.injectManifest.manifestTransforms = injectManifest.manifestTransforms ?? []
  options.injectManifest.manifestTransforms.push(createManifestTransform(enableManifestTransform))

  return {
    plugins: [VitePWA(options)],
  }
}

async function regeneratePWA(pwaPlugin: Plugin | undefined) {
  const api: VitePluginPWAAPI | undefined = pwaPlugin?.api
  if (api && !api.disabled) {
    // regenerate the sw: there is no need to generate the webmanifest again
    await api.generateSW()
  }
}
