# `src/events/event-manager.ts` — Native binding & derived events

> Binds native Pointer/Wheel events, normalizes them, hit-tests, and synthesizes the
> high-level events.

## Purpose

The `EventManager` is the glue between the browser and the scene graph. It listens to
native Pointer/Wheel events on the stage container, converts them to screen/world points,
finds a target via hit-testing, builds a [`SceneEvent`](./event-types.md), and dispatches
it. It also runs the small **state machines** that derive click, dblclick, drag and hover.

## Exports

- `class EventManager` — `constructor(stage)`, `bind()`, `destroy()`. Created and owned by
  the [`Stage`](../scene/stage.md); you rarely construct it directly.

## How it works

For each native event the manager:

1. computes the **screen point** = `clientX/Y − container.getBoundingClientRect()`,
2. converts to **world** via `stage.screenToWorld`,
3. resolves the **target** = `stage.getIntersection(world)` (or the stage if nothing is hit),
4. builds a `SceneEvent` and calls [`dispatchEvent`](./dispatch.md) over the target's path.

### Derived events (state machines)

- **click** — `pointerup` whose target equals the `pointerdown` target (and no drag occurred).
- **dblclick** — two clicks on the same target within `300 ms` (timed via `nativeEvent.timeStamp`).
- **drag** — once the pointer moves more than `3 px` from the press point, fires `dragstart`
  then `dragmove` (and `dragend` on release). Drag events target the **press** node, not the
  current hit. Pointer capture is requested on `pointerdown`.
- **hover** — tracks the current hit; when it changes, fires `pointerleave` on the old and
  `pointerenter` on the new (non-bubbling, but capture-traversed).

## Conventions & gotchas

- **DOM-agnostic robustness.** `setPointerCapture`/`releasePointerCapture` are wrapped in
  try/catch (not all environments support them), so the engine never throws on capture.
- **Drag target stickiness.** `dragstart`/`dragmove`/`dragend` always go to the node where
  the press began, so a fast drag that outruns the pointer still moves the right node.
- **Wheel is non-passive.** The `wheel` listener is bound with `{ passive: false }` so a
  handler calling `event.preventDefault()` can stop page scroll (used for zoom).
- **Lifecycle.** `Stage` creates the manager in its constructor and calls `destroy()` on
  teardown to unbind every native listener.

## Relationships

- **Uses:** [`Stage`](../scene/stage.md) (`getIntersection`, `screenToWorld`, `container`),
  [`dispatchEvent`](./dispatch.md), [`SceneEvent`](./event-types.md).
- **Owned by:** the `Stage`.

## Future / not yet

- Touch gestures (pinch/rotate), keyboard events, and richer enter/leave ancestor diffing.
- Hit-testing precision/perf comes from the Phase 6 hit-testing engine (the manager just
  calls `stage.getIntersection`).
