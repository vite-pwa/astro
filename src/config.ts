import type { VitePWAStrategy } from '@unplugin-pwa/core'
import type { ExternalPWAOptions } from '@unplugin-pwa/vite/config/types'
import type { SWType } from '@vite-pwa/workbox-build/types'
import type { AstroPWAOptions } from './types.ts'

export type AstroExternalPWAOptions<
  UserStrategy extends VitePWAStrategy,
  T extends SWType,
> = ExternalPWAOptions<UserStrategy, T, AstroPWAOptions<UserStrategy, T>>

export function definePwaConfig<
  UserStrategy extends VitePWAStrategy,
  T extends SWType,
>(
  config: Partial<AstroPWAOptions<UserStrategy, T>>,
): Partial<AstroExternalPWAOptions<UserStrategy, T>> {
  return config
}
