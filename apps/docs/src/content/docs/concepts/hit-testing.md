---
title: Hit-Testing
description: Geometric picking with an AABB prefilter and zoom-invariant tolerance.
sidebar:
  order: 7
---

Hit-testing answers "what's under this point?" — the foundation for events, selection, and vertex
editing. It runs through a swappable `HitTester` interface; the default `GeometricHitTester` does
real geometry, not a color-pick buffer.

```ts
const hit = stage.hitTest({ x, y }, { tolerance: 6 })
// → { node, type, worldPoint, localPoint, vertexIndex? } | null
const node = stage.getIntersection({ x, y })   // convenience: just the node (or null)
```

## How a hit is found

For a world point, the tester walks the tree **depth-first, children last-to-first** — so the
topmost-drawn shape is tested first — and returns the **first** hit:

1. **Broad phase (AABB).** Skip the shape unless its world bounding box, expanded by the tolerance,
   contains the point. A cheap reject that keeps the constant low (a spatial index can replace this
   step for huge scenes).
2. **To local space.** Invert the shape's world matrix to get the local point, converting the
   screen-pixel tolerance into local units along the way.
3. **Vertices** *(if requested)* — a `'vertex'` hit (with `vertexIndex`) when the point is within
   tolerance of a `getVertices()` entry.
4. **Fill / stroke.** Call the shape's `hitTest(local, …)`: filled interiors use interior tests
   (point-in-polygon, radial), outlines use distance-to-polyline. Returns `'fill'` or `'stroke'`.
5. **Bounds** *(if requested)* — a `'bounds'` fallback when the point is inside the expanded local
   bounds.

Non-visible and non-`listening` subtrees are skipped entirely.

## Options

`stage.hitTest(worldPoint, options?)` accepts:

| Option | Default | Meaning |
| --- | --- | --- |
| `tolerance` | `0` | Extra grab radius in **screen pixels** (zoom-invariant). |
| `fill` / `stroke` | `true` / `true` | Test interiors / outlines. |
| `bounds` | `false` | Also yield a `'bounds'` hit. |
| `vertices` | `false` | Also yield `'vertex'` hits (with `vertexIndex`). |
| `deep` | `true` | Descend into containers (`false` = top-level only). |
| `match(node)` | — | Accept only matching nodes; others are skipped and the walk continues. |

The result `type` (`'fill' | 'stroke' | 'bounds' | 'vertex'`) tells higher layers *what* was hit — a
`'vertex'` hit starts a corner drag, a `'fill'` hit selects the shape.

## Zoom-invariant tolerance — the load-bearing detail

`tolerance` is specified in **screen pixels**. The `Stage` passes the tester a `pixelSize`
(`= 1 / camera.zoom`, world units per screen pixel), and the tester converts the tolerance into world
(then local) units. The effect: **a "5 px grab" stays 5 px at any zoom** — exactly the behaviour an
editor needs, and exactly what a naïve implementation gets wrong. Tolerance also accounts for stroke
width, so clicking a thin outline is forgiving.

## Swapping the tester

`GeometricHitTester` is O(n) over candidate nodes with the AABB prefilter keeping the constant small.
For very large scenes you can inject a spatial-index implementation behind the same interface:

```ts
new Stage({ hitTester: new MyQuadtreeHitTester() })
```

See [Advanced → Custom Hit-Testers](/Veyrajs/advanced/custom-hit-testers/).

## Related

- [Events](/Veyrajs/concepts/events/) — the event manager calls `getIntersection` to find a target.
- [Selection & Transform](/Veyrajs/concepts/selection/) — uses `'vertex'`/`'fill'` results.
- [Shapes](/Veyrajs/concepts/shapes/) — each shape's `containsPoint` is the precise test.
