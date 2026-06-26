# `src/events/` — Event system

> Pointer/click/dblclick/drag/hover with DOM-style capture→target→bubble propagation.

The event system is split into three concerns so the tricky parts stay testable:

| File | Doc | Concern |
| --- | --- | --- |
| `event-types.ts` | [event-types.md](./event-types.md) | The `SceneEvent` object + the event-type union |
| `dispatch.ts` | [dispatch.md](./dispatch.md) | The **pure** capture/target/bubble walk |
| `event-manager.ts` | [event-manager.md](./event-manager.md) | Native binding + the derived-event state machines |

Listener storage itself lives on [`Node`](../scene/node.md) (`on`/`off`/`once`/`_emit`).

## Event types

`pointerdown`, `pointermove`, `pointerup`, `pointerenter`, `pointerleave`, `click`,
`dblclick`, `wheel`, `dragstart`, `dragmove`, `dragend`.

All bubble **except** `pointerenter`/`pointerleave` (which still traverse the capture phase).

## The flow

```
native PointerEvent on the container
        │  (EventManager)
        ▼
  screen point  →  camera.screenToWorld  →  world point
        │
        ▼
  Stage.getIntersection(world)  →  target node (or the stage)
        │
        ▼
  new SceneEvent(...)  →  dispatchEvent(event, [target, …, stage])
        │
        ▼
  capture (stage→target.parent) · target · bubble (target.parent→stage)
```

The `EventManager` also derives **click** (down+up on the same target), **dblclick**
(two clicks within 300 ms), **drag** (move past a 3 px threshold, with pointer capture),
and **hover** (`pointerenter`/`pointerleave` as the hit target changes).

## Why three pieces

- **Pure dispatch** ([dispatch.md](./dispatch.md)) has no DOM dependency, so phase ordering
  and `stopPropagation` are unit-tested deterministically.
- **`Node` listeners** keep registration on the object users already hold.
- **`EventManager`** is the thin, replaceable native-glue layer; everything hard about
  *semantics* lives in the other two.

## Design notes

- **Target fallback.** With nothing under the pointer, the target is the `Stage`, so
  background interactions (pan/zoom tools) can listen at the stage level.
- **Local points on demand.** `SceneEvent.getLocalPoint(node?)` converts the world point
  into any node's local space lazily — no per-node precomputation.
- **Hit-testing is basic for now.** Targets come from `Stage.getIntersection` (geometric,
  top-down). Phase 6 swaps in a pluggable, options-aware hit-testing engine behind the same
  call.
