import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // No Angular build plugin: the components use `inject()` / explicit `@Inject` (no decorator
  // metadata reflection), so esbuild's legacy-decorator transform + Angular's JIT compiler
  // (loaded in the setup file) are enough to run them under Vitest.
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        // Angular requires set-semantics class fields, not ES [[Define]].
        useDefineForClassFields: false,
      },
    },
  },
  resolve: {
    alias: {
      // Consume the engine's source directly (no build step needed for tests).
      '@veyrajs/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
})
