import { fileURLToPath } from 'node:url'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

// GitHub Pages project site: https://veyrajs.github.io/Veyrajs/
// If you deploy to a user/org site (repo renamed to veyrajs.github.io) or a custom domain,
// set `base: '/'` and update `site`.
export default defineConfig({
  site: 'https://veyrajs.github.io',
  base: '/Veyrajs',
  // No-op image service so we don't need sharp's native binary (pnpm 10 blocks its postinstall).
  image: { service: { entrypoint: 'astro/assets/services/noop' } },
  integrations: [
    starlight({
      title: 'Veyrajs',
      description: 'A framework-agnostic, TypeScript-first 2D canvas engine.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Veyrajs/Veyrajs' }],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction', slug: 'guides/introduction' },
            { label: 'Getting Started', slug: 'guides/getting-started' },
          ],
        },
        { label: 'Core Concepts', items: [{ autogenerate: { directory: 'concepts' } }] },
        { label: 'Adapters', items: [{ autogenerate: { directory: 'adapters' } }] },
        { label: 'Demos', items: [{ autogenerate: { directory: 'demos' } }] },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
  vite: {
    resolve: {
      alias: {
        // Demos consume the engine straight from source — always in sync, instant HMR.
        '@veyrajs/core': fileURLToPath(
          new URL('../../packages/core/src/index.ts', import.meta.url),
        ),
      },
    },
  },
})
