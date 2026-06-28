import { fileURLToPath } from 'node:url'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

import react from '@astrojs/react';
import vue from '@astrojs/vue';
import svelte from '@astrojs/svelte';

// GitHub Pages project site: https://veyrajs.github.io/Veyrajs/
// If you deploy to a user/org site (repo renamed to veyrajs.github.io) or a custom domain,
// set `base: '/'` and update `site`.
export default defineConfig({
  site: 'https://veyrajs.github.io',
  base: '/Veyrajs',
  // No-op image service so we don't need sharp's native binary (pnpm 10 blocks its postinstall).
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  integrations: [starlight({
    title: 'Veyrajs',
    description: 'A framework-agnostic, TypeScript-first 2D canvas engine.',
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Veyrajs/Veyrajs' }],
    sidebar: [
      {
        label: 'Start Here',
        items: [
          { label: 'Introduction', slug: 'guides/introduction' },
          { label: 'Installation', slug: 'guides/installation' },
          { label: 'Getting Started', slug: 'guides/getting-started' },
          { label: 'Design Philosophy', slug: 'guides/design-philosophy' },
        ],
      },
      { label: 'Core Concepts', items: [{ autogenerate: { directory: 'concepts' } }] },
      { label: 'Framework Adapters', items: [{ autogenerate: { directory: 'adapters' } }] },
      { label: 'API Reference', items: [{ autogenerate: { directory: 'api' } }] },
      { label: 'Recipes', items: [{ autogenerate: { directory: 'recipes' } }] },
      { label: 'Advanced', items: [{ autogenerate: { directory: 'advanced' } }] },
      { label: 'Demos', items: [{ autogenerate: { directory: 'demos' } }] },
      { label: 'Troubleshooting', items: [{ autogenerate: { directory: 'troubleshooting' } }] },
    ],
    // fonts.css first so its @font-face / @import rules load before custom.css uses them.
    customCss: ['./src/styles/fonts.css', './src/styles/custom.css'],
  }), react(), vue(), svelte()],
  vite: {
    resolve: {
      alias: {
        // Demos consume the engine + adapters straight from source — always in sync, instant HMR.
        '@veyrajs/core': fileURLToPath(
          new URL('../../packages/core/src/index.ts', import.meta.url),
        ),
        '@veyrajs/react': fileURLToPath(
          new URL('../../packages/react/src/index.ts', import.meta.url),
        ),
        '@veyrajs/vue': fileURLToPath(
          new URL('../../packages/vue/src/index.ts', import.meta.url),
        ),
        '@veyrajs/svelte': fileURLToPath(
          new URL('../../packages/svelte/src/index.ts', import.meta.url),
        ),
      },
    },
  },
})