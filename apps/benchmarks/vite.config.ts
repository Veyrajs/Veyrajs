import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Vanilla-TS harness (no Vue). Consume the engine's source directly so the FPS page
// reflects live core changes with no separate build step — same alias trick as apps/demo.
export default defineConfig({
  resolve: {
    alias: {
      '@veyrajs/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
    },
  },
})
