# `src/events/event-types.ts` — SceneEvent & event types

> The synthetic event delivered to listeners, plus the event-type union.

## Purpose

Defines `SceneEvent` (what every listener receives) and the `SceneEventType` union of
supported events. The event carries the pointer position in **both** screen and world
space, the originating native event, modifier keys, and the propagation controls.

## Exports

- `type SceneEventType` — the 11 event names (pointer/click/dblclick/wheel/drag/hover).
- `type SceneEventPhase` — `'capture' | 'target' | 'bubble'`.
- `type SceneEventListener = (event: SceneEvent) => void`.
- `interface SceneEventInit` — constructor input.
- `class SceneEvent`:
  - `type`, `target` (constant), `currentTarget` (updated during propagation), `eventPhase`,
  - `screenPoint`, `worldPoint`, `nativeEvent`, `bubbles`,
  - `pointerId`, `button`, `buttons`, `deltaX`, `deltaY`, and modifier flags
    (`altKey`/`ctrlKey`/`shiftKey`/`metaKey`),
  - `stopPropagation()`, `stopImmediatePropagation()`, `preventDefault()`,
  - `getLocalPoint(node?)`.

## How it works

- **`target` vs `currentTarget`.** `target` is the node the interaction resolved to and is
  constant; `currentTarget` is the node currently handling the event and changes as it
  propagates (set by the dispatcher).
- **`getLocalPoint(node = currentTarget)`** maps `worldPoint` into a node's local space via
  `node.worldMatrix().invert()` — lazy, so it costs nothing unless a handler asks.
- **`preventDefault()`** sets `defaultPrevented` and forwards to the native event (e.g. to
  stop page scroll on `wheel`).
- **Propagation flags** (`propagationStopped`, `immediatePropagationStopped`) are read by
  [`dispatchEvent`](./dispatch.md) and by `Node._emit`.

## Conventions & gotchas

- **Modifier keys** are snapshotted from the native event at construction; for synthetic
  events with `nativeEvent: null` they default to `false`.
- **`bubbles`** defaults to `true`; the manager passes `false` for `pointerenter`/
  `pointerleave`.
- `pointerId`/`button` default to `-1` and `deltaX`/`deltaY` to `0` when not applicable.

## Relationships

- **Uses:** [`Vec2`](../math/vec2.md), [`Node`](../scene/node.md) (types).
- **Dispatched by:** [`dispatchEvent`](./dispatch.md); **constructed by:**
  [`EventManager`](./event-manager.md); **delivered to:** `Node` listeners.

## Example

```ts
shape.on('click', (e) => {
  console.log(e.type, e.target.type, e.getLocalPoint())
  if (e.altKey) e.stopPropagation()
})
```
