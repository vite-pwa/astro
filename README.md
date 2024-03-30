<p align='center'>
<img src='./hero.png' alt="@vite-pwa/astro - Zero-config PWA Integration for Astro"><br>
Zero-config PWA Integration for Astro
</p>

<p align='center'>
<a href='https://www.npmjs.com/package/@vite-pwa/astro' target="__blank">
<img src='https://img.shields.io/npm/v/@vite-pwa/astro?color=33A6B8&label=' alt="NPM version">
</a>
<a href="https://www.npmjs.com/package/@vite-pwa/astro" target="__blank">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@vite-pwa/astro?color=476582&label=">
</a>
<a href="https://vite-pwa-org.netlify.app/frameworks/astro" target="__blank">
    <img src="https://img.shields.io/static/v1?label=&message=docs%20%26%20guides&color=2e859c" alt="Docs & Guides">
</a>
<br>
<a href="https://github.com/vite-pwa/astro" target="__blank">
<img alt="GitHub stars" src="https://img.shields.io/github/stars/vite-pwa/astro?style=social">
</a>
</p>

<br>

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>


## 🚀 Features

- 📖 [**Documentation & guides**](https://vite-pwa-org.netlify.app/)
- 👌 **Zero-Config**: sensible built-in default configs for common use cases
- 🔩 **Extensible**: expose the full ability to customize the behavior of the plugin
- 🦾 **Type Strong**: written in [TypeScript](https://www.typescriptlang.org/)
- 🔌 **Offline Support**: generate service worker with offline support (via Workbox)
- ⚡ **Fully tree shakable**: auto inject Web App Manifest
- 💬 **Prompt for new content**: built-in support for Vanilla JavaScript, Vue 3, React, Svelte, SolidJS and Preact
- ⚙️ **Stale-while-revalidate**: automatic reload when new content is available
- ✨ **Static assets handling**: configure static assets for offline support
- 🐞 **Development Support**: debug your custom service worker logic as you develop your application
- 🛠️ **Versatile**: integration with meta frameworks: [îles](https://github.com/ElMassimo/iles), [SvelteKit](https://github.com/sveltejs/kit), [VitePress](https://github.com/vuejs/vitepress), [Astro](https://github.com/withastro/astro), [Nuxt 3](https://github.com/nuxt/nuxt) and [Remix](https://github.com/remix-run/remix)
- 💥 **PWA Assets Generator**: generate all the PWA assets from a single command and a single source image
- 🚀 **PWA Assets Integration**: serving, generating and injecting PWA Assets on the fly in your application


## 📦 Install

> From v0.2.0, `@vite-pwa/astro` requires **Vite 5** and **Astro 4.0.0 or above**.

> Using any version older than v0.2.0 requires Vite 3.1.0+.

```bash
npm i @vite-pwa/astro -D 

# yarn 
yarn add @vite-pwa/astro -D

# pnpm 
pnpm add @vite-pwa/astro -D
```

## 🦄 Usage

Add `@vite-pwa/astro` integration to `astro.config.mjs` and configure it:

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import AstroPWA from '@vite-pwa/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [AstroPWA()]
})
```
Read the [📖 documentation](https://vite-pwa-org.netlify.app/frameworks/astro) for a complete guide on how to configure and use
this plugin.

## ⚡️ Examples

You need to stop the dev server once started and then run `npm run build && npm run preview` to see the PWA in action.
<table>
<thead>
<tr>
<th>Example</th>
<th>Source</th>
<th>Playground</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Auto Update PWA</code></td>
<td><a href="https://github.com/vite-pwa/astro/tree/main/examples/pwa-simple">GitHub</a></td>
<td>
<a href="https://stackblitz.com/fork/github/vite-pwa/astro/tree/main/examples/pwa-simple" target="_blank" rel="noopener noreferrer">
  <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt="Open in StackBlitz" width="162" height="32">
</a>
</td>
</tr>
<tr>
<td><code>Prompt for Update PWA</code></td>
<td><a href="https://github.com/vite-pwa/astro/tree/main/examples/pwa-prompt">GitHub</a></td>
<td>
<a href="https://stackblitz.com/fork/github/vite-pwa/astro/tree/main/examples/pwa-prompt" target="_blank" rel="noopener noreferrer">
  <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt="Open in StackBlitz" width="162" height="32">
</a>
</td>    
</tr>
</tbody>
</table>

## 👀 Full config

Check out the following links for more details:

- [Web app manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox)


## 📄 License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Anthony Fu](https://github.com/antfu)
