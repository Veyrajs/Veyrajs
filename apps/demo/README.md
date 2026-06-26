# @veyrajs/demo

Private Vite + Vue app that proves the engine works. Run from the repo root:

```bash
pnpm dev
```

> **Status:** Phase 1 — mounts a single blank, DPR-correct `Stage`. As the engine grows,
> this app gains pages for image rendering, basic shapes, layers, zoom/pan, selection,
> drag/move, transform handles, an events log, serialization import/export, and a
> performance test page (see the architecture plan). It is intentionally **not** a full
> annotation app.

The demo aliases `@veyrajs/core` directly to the engine's source, so changes to the
engine hot-reload here without a rebuild.
