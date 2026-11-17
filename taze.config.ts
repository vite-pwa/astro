import { defineConfig } from 'taze'

export default defineConfig({
  recursive: true,
  write: true,
  includeLocked: true,
  maturityPeriod: 7,
  peer: false,
  mode: 'minor',
  retry: 2,
  exclude: [
    'taze',
    'node',
    // unpin rolldown once Vite 8.4 released
    // we need both, Vite and Rolldown:
    // using Vite 8.3 with Rolldown 1.3 can cause Vite apps to generated wrong builds
    'rolldown',
  ],
  githubActions: {
    style: 'sha',
  },
  depFields: {
    packageManager: false,
  },
})
