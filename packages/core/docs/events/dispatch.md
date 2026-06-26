# `src/events/dispatch.ts` — Pure event dispatch

> The DOM-style capture→target→bubble walk. No DOM dependency — fully unit-testable.

## Purpose

`dispatchEvent(event, path)` walks a node path and invokes listeners in the correct phase
order, honoring `stopPropagation`. Isolating this as a pure function means the trickiest
event logic is tested deterministically, without a browser.

## Exports

- `dispatchEvent(event: SceneEvent, path: readonly Node[]): void`.

## How it works

`path` is ordered **target-first**: `[target, parent, …, root]`. The walk is:

1. **capture** — iterate `path` from the root down to the target's parent, calling each
   node's *capture* listeners (`node._emit(event, true)`).
2. **target** — call the target's capture listeners, then its bubble listeners.
3. **bubble** — iterate from the target's parent up to the root, calling *bubble* listeners
   — **only if** `event.bubbles`.

`stopPropagation()` halts the walk after the current node;
`stopImmediatePropagation()` additionally stops remaining listeners on the current node
(checked inside `Node._emit`).

## Conventions & gotchas

- **Pairs with `Node._emit`.** This function decides *which nodes and phases*; `Node._emit`
  decides *which of that node's listeners* (capture vs bubble) run and applies
  `immediatePropagationStopped`.
- **Non-bubbling events still capture.** `pointerenter`/`pointerleave` pass `bubbles: false`,
  so they traverse capture and target but skip the bubble pass — which is why ancestor
  *capture* listeners can still observe descendant hover.
- **Index-safe.** Path entries are guarded against `undefined` (for `noUncheckedIndexedAccess`).

## Relationships

- **Uses:** [`Node`](../scene/node.md) (`_emit`), [`SceneEvent`](./event-types.md) (types).
- **Called by:** [`EventManager`](./event-manager.md). Also exported publicly for advanced
  use and testing.

## Example (test-style)

```ts
const path = [leaf, mid, root] // target-first
dispatchEvent(new SceneEvent({ type: 'click', target: leaf, /* … */ }), path)
// → root capture, mid capture, leaf (capture+bubble), mid bubble, root bubble
```
