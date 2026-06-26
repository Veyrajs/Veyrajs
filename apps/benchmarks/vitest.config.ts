import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Micro-benchmarks run under `vitest bench`. happy-dom supplies a DOM for the few suites
// that build a real `Stage` (the render-walk suite); the rest are pure CPU and DOM-free.
export default defineConfig({
  resolve: {
    alias: {
      '@veyrajs/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    benchmark: {
      include: ['src/micro/**/*.bench.ts'],
    },
  },
})
