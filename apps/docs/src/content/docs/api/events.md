---
title: Events
description: The synthetic SceneEvent, the SceneEventType union, EventManager, and the capture/target/bubble dispatch walk.
sidebar:
  order: 7
---

The event system delivers a synthetic [`SceneEvent`](#sceneevent) to node listeners. Native
Pointer/Wheel events are normalized, hit-tested, and dispatched DOM-style
(capture → target → bubble). The event carries the pointer position in **both** screen and
world space.

## `SceneEvent`

The object every listener receives. `type SceneEventListener = (event: SceneEvent) => void`.

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `type` | `SceneEventType` | The event name. |
| `target` | `Node` | The node the interaction resolved to. Constant. |
| `currentTarget` | `Node` | The node currently handling the event. Updated as it propagates. |
| `eventPhase` | `SceneEventPhase` | The current propagation phase. |
| `screenPoint` | `Vec2` | Pointer position in screen space. |
| `worldPoint` | `Vec2` | Pointer position in world space. |
| `nativeEvent` | `Event \| null` | The originating native Pointer/Wheel event; `null` for synthetic events. |
| `bubbles` | `boolean` | Whether the event bubbles. Default `true`; `false` for `pointerenter`/`pointerleave`. |
| `pointerId` | `number` | Pointer id. `-1` when not applicable. |
| `button` | `number` | The button that changed. `-1` when not applicable. |
| `buttons` | `number` | Bitmask of buttons currently held. |
| `deltaX` | `number` | Wheel delta X. `0` when not applicable. |
| `deltaY` | `number` | Wheel delta Y. `0` when not applicable. |
| `altKey` / `ctrlKey` / `shiftKey` / `metaKey` | `boolean` | Modifier flags, snapshotted from the native event (`false` for synthetic events). |

### Methods

| Method | Description |
| --- | --- |
| `stopPropagation(): void` | Halt the walk after the current node. |
| `stopImmediatePropagation(): void` | Also stop the remaining listeners on the current node. |
| `preventDefault(): void` | Set `defaultPrevented` and forward to the native event (e.g. stop page scroll on `wheel`). |
| `getLocalPoint(node?: Node): Vec2` | Map `worldPoint` into a node's local space (defaults to `currentTarget`); computed lazily. |

`interface SceneEventInit` is the constructor input for `new SceneEvent({ … })`.

```ts
shape.on('click', (e) => {
  console.log(e.type, e.target.type, e.getLocalPoint())
  if (e.altKey) e.stopPropagation()
})
```

## `SceneEventType`

The 11 supported event names:

| Group | Names |
| --- | --- |
| Pointer | `pointerdown`, `pointerup`, `pointermove` |
| Hover | `pointerenter`, `pointerleave` |
| Click | `click`, `dblclick` |
| Wheel | `wheel` |
| Drag | `dragstart`, `dragmove`, `dragend` |

## `SceneEventPhase`

```ts
type SceneEventPhase = 'capture' | 'target' | 'bubble'
```

## `EventManager`

The glue between the browser and the scene graph. Created and owned by the `Stage` — you
rarely construct it directly.

```ts
class EventManager {
  constructor(stage: Stage)
  bind(): void      // attach native Pointer/Wheel listeners on the stage container
  destroy(): void   // unbind every native listener
}
```

For each native event the manager: computes the **screen point**
(`clientX/Y − container.getBoundingClientRect()`), converts to **world** via
`stage.screenToWorld`, resolves the **target** via `stage.getIntersection` (or the stage if
nothing is hit), builds a `SceneEvent`, and calls [`dispatchEvent`](#dispatchevent).

It also runs the state machines that **derive** the high-level events:

- **click** — `pointerup` whose target equals the `pointerdown` target (and no drag occurred).
- **dblclick** — two clicks on the same target within `300 ms`.
- **drag** — once the pointer moves more than `3 px` from the press point, fires `dragstart`,
  then `dragmove`, then `dragend` on release. Drag events target the **press** node.
- **hover** — when the current hit changes, fires `pointerleave` on the old node and
  `pointerenter` on the new (non-bubbling, but capture-traversed).

The `wheel` listener is bound with `{ passive: false }`, so a handler calling
`preventDefault()` can stop page scroll (used for zoom).

## `dispatchEvent`

The pure capture → target → bubble walk (no DOM dependency). Also exported for advanced use
and testing.

```ts
function dispatchEvent(event: SceneEvent, path: readonly Node[]): void
```

`path` is ordered **target-first**: `[target, parent, …, root]`. The walk:

1. **capture** — root down to the target's parent (capture listeners).
2. **target** — the target's capture listeners, then its bubble listeners.
3. **bubble** — the target's parent up to the root (bubble listeners) — **only if** `event.bubbles`.

`stopPropagation()` halts after the current node; `stopImmediatePropagation()` additionally
stops the remaining listeners on that node. Non-bubbling events
(`pointerenter`/`pointerleave`) still traverse capture and target — so ancestor *capture*
listeners can observe descendant hover.

```ts
const path = [leaf, mid, root] // target-first
dispatchEvent(new SceneEvent({ type: 'click', target: leaf, /* … */ }), path)
// → root capture, mid capture, leaf (capture+bubble), mid bubble, root bubble
```

## Related

- [Events (concept)](/Veyrajs/concepts/events/)
- [Hit-Testing (API)](/Veyrajs/api/hit-testing/)
