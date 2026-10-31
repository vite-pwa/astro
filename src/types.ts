import type { VitePWAOptions, VitePWAStrategy } from '@unplugin-pwa/core'
import type { SWType } from '@vite-pwa/workbox-build/types'

export interface AstroExperimentalOptions {
  /**
   * When using `generateSW` strategy, include custom directory and trailing slash handler.
   *
   * @see https://github.com/vite-pwa/astro/issues/23
   *
   * @default false
   */
  directoryAndTrailingSlashHandler?: boolean
}

export type AstroPWAOptions<
  UserStrategy extends VitePWAStrategy,
  T extends SWType,
> = VitePWAOptions<UserStrategy, T> & {
  experimental?: AstroExperimentalOptions
}
