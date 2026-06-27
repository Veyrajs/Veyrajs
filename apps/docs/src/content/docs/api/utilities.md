---
title: Utilities
description: Frame coalescing, deterministic node ids, and the package version constant.
sidebar:
  order: 12
  label: Utilities
---

Small cross-cutting helpers used throughout the engine.

```ts
import { FrameScheduler, nextId, VERSION } from '@veyrajs/core'
```

## FrameScheduler

Collapses many invalidations in one frame into a **single** `requestAnimationFrame` callback — the
same idea as Konva's `batchDraw`. The `Stage` owns one scheduler whose `run` is
`() => this.render()`, and `Stage.requestRender()` delegates to `scheduler.request()`.

```ts
class FrameScheduler {
  constructor(run: () => void) // callback to invoke once per scheduled frame
  request(): void             // schedule run for the next frame, if not already scheduled
  cancel(): void              // cancel a pending frame
  get isScheduled(): boolean  // whether a frame is currently pending
}
```

### How it works

- The frame primitive is picked **once at import time**: `requestAnimationFrame` when available
  (browser / happy-dom), otherwise a `setTimeout(cb, 16)` fallback (~60fps) for headless hosts.
- `request()` sets a `scheduled` flag; further `request()` calls while pending are **no-ops** — this
  is the coalescing.
- The flag is cleared **before** `run()` is invoked, so a mutation made *inside* `run()` can
  correctly schedule the next frame.

## nextId

Produces unique node ids from a monotonic counter (no randomness), so ids are **deterministic and
reproducible across runs** — which makes snapshot tests and stable serialization possible.

```ts
nextId(prefix = 'node'): string // → `${prefix}-${n}`, e.g. 'node-1', 'node-2', …
```

- **Caller-supplied ids win.** `Node`'s constructor uses `config.id ?? nextId()`, so a caller or
  deserializer can always provide an explicit id; the counter is only the fallback.

## VERSION

The current `@veyrajs/core` version string, for runtime/debugging use (e.g. logging which engine
build is running).

```ts
VERSION: string // currently '0.0.0'
```

Kept in sync with `package.json` at release time. This is a *runtime* value — separate from the
serialization **schema version** for saved scenes; do not conflate the two.

## Related

- [Rendering](/Veyrajs/concepts/rendering/) — how `FrameScheduler` drives the `Stage` repaint loop.
