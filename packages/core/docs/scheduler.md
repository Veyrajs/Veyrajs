# `src/scheduler.ts` — Frame coalescing

> Collapses many invalidations in one frame into a single `requestAnimationFrame` callback.

## Purpose

When you mutate several properties in quick succession, you want **one** repaint on the
next frame, not one per mutation. `FrameScheduler` implements that coalescing — the same
idea as Konva's `batchDraw`.

## Exports

- `class FrameScheduler`
  - `constructor(run: () => void)` — `run` is the callback to invoke once per scheduled frame.
  - `request(): void` — schedule `run` for the next frame, if not already scheduled.
  - `cancel(): void` — cancel a pending frame.
  - `get isScheduled(): boolean` — whether a frame is currently pending.

## How it works

The module picks a frame primitive **once at import time**:

```
raf = typeof requestAnimationFrame === 'function'
  ? (cb) => requestAnimationFrame(() => cb())   // browser / happy-dom
  : (cb) => setTimeout(cb, 16)                    // non-DOM fallback (~60fps)
```

`request()` sets a `scheduled` flag and schedules the callback; further `request()` calls
while `scheduled` is `true` are no-ops (this is the coalescing). When the frame fires, the
flag is cleared *before* `run()` is invoked, so a mutation made *inside* `run()` can
correctly schedule the next frame. `cancel()` clears the pending handle and flag.

## Conventions & gotchas

- **Cleared before run.** The order — clear flag, then call `run` — is deliberate so the
  scheduler can re-arm during its own callback.
- **Fallback for headless hosts.** The `setTimeout` branch lets the engine run where
  `requestAnimationFrame` is absent (e.g. some server/worker contexts).
- **Testing.** Because the scheduler ultimately calls the global `requestAnimationFrame`,
  tests use `vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })`
  and `vi.runAllTimers()` to fire frames deterministically. See
  [`__tests__.md`](./__tests__.md).

## Relationships

- **Used by:** [`scene/stage.ts`](./scene/stage.md). The `Stage` owns one scheduler whose
  `run` is `() => this.render()`; `Stage.requestRender()` delegates to `scheduler.request()`.

## Future / not yet

- Could grow priority/phases (e.g. layout vs. paint) or integrate dirty-rectangle
  invalidation, but the public surface is intentionally minimal for now.
