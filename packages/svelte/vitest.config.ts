import { URL, fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // Svelte 5 ships a `browser` export condition; tests must resolve it.
    conditions: ['browser'],
    alias: {
      // Consume the engine's source directly (no build step needed for tests).
      '@annotacanvas/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.{test,spec}.ts'],
  },
})
