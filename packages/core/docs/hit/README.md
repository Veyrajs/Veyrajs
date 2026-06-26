# `src/hit/` — Hit-testing

> Find the topmost node at a point, with Paper-style options and a zoom-invariant tolerance.

| File | Doc | Concern |
| --- | --- | --- |
| `hit-tester.ts` | [hit-tester.md](./hit-tester.md) | The `HitTester` contract + options/result types |
| `geometric-hit-tester.ts` | [geometric-hit-tester.md](./geometric-hit-tester.md) | The default implementation |

The scene-graph entry points are [`Stage.hitTest`](../scene/stage.md) (returns a rich
`HitResult`) and `Stage.getIntersection` (returns just the node). The
[`EventManager`](../events/event-manager.md) uses them to resolve event targets.

## What it answers

Given a **world point**, return the topmost listening node whose geometry is hit — and
*how* it was hit: `'fill'`, `'stroke'`, `'vertex'`, or `'bounds'`.

## Options (Paper-inspired)

`{ tolerance, fill, stroke, bounds, vertices, deep, match }` — choose what counts as a hit
(interior / outline / corners / bounding box), how much slop to allow, whether to descend
into groups, and an arbitrary `match` predicate. See [hit-tester.md](./hit-tester.md).

## Zoom-invariant tolerance (the key idea)

`tolerance` is in **screen pixels**, but shapes test in **local** space. The conversion is
two steps:

```
localTolerance = (screenTolerance ÷ cameraZoom) ÷ nodeScale
```

- `÷ cameraZoom` — the `Stage` passes `pixelSize = 1/zoom` to the tester (world per screen px).
- `÷ nodeScale` — the tester divides by `√|det(worldMatrix)|`.

So a "5px grab radius" stays 5px on screen at any zoom or node scale — exactly what an
annotation UI needs for grabbing thin lines and vertices.

## Pluggable

`HitTester` is an interface; `GeometricHitTester` is the default. Future strategies —
spatial-index/quadtree (for tens of thousands of nodes), color-buffer, or pixel-perfect —
implement the same interface and are injected via `new Stage({ hitTester })`.
