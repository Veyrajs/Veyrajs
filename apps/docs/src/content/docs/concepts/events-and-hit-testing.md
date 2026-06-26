---
title: Events & Hit-Testing
description: Federated events with phased propagation, and zoom-aware geometric picking.
sidebar:
  order: 3
---

## Federated events

The `EventManager` binds Pointer Events on the host element, normalises them, runs hit-testing to
find the target, and dispatches **synthetic events** through the node path with real
**capture → target → bubble** phases:

```ts
rect.on('click', (e) => { /* e.target, e.screenPoint, e.worldPoint, e.stopPropagation() … */ })
```

Raw inputs (`pointerdown/move/up`, `wheel`) are normalised, and higher-level gestures are
**derived in the manager** so they respect the scene graph and camera:

- `click`, `dblclick` (timing + distance thresholds)
- `dragstart` / `dragmove` / `dragend` (drag threshold from a `pointerdown` target)
- `pointerenter` / `pointerleave` (by diffing the hit target between moves)
- `wheel` (the default zoom input)

Every event carries `screenPoint` and `worldPoint` (both `Vec2`), plus `stopPropagation()` and
`preventDefault()`.

## Geometric hit-testing

The default `GeometricHitTester` walks visible, listening nodes in reverse z-order, prefilters by
**world-AABB**, then transforms the pointer into each node's local space and calls
`shape.containsPoint(localPoint, options)`.

```ts
interface HitTestOptions {
  // fill / stroke / bounds toggles, a tolerance in *screen* pixels, a filter, …
}
```

The standout detail is **zoom-aware tolerance**: a grab radius is specified in *screen* pixels
and divided by the effective scale (camera zoom × node scale) via the inverse world matrix — so a
"5px grab" feels like 5px at any zoom level.

The `HitTester` interface is a seam: a `QuadtreeHitTester` (for thousands of nodes) or a
pixel-perfect tester can be swapped in per stage without touching shape code.
