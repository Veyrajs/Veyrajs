# `src/hit/geometric-hit-tester.ts` — GeometricHitTester

> The default hit tester: top-down reverse-z walk, AABB broad-phase, precise per-shape test.

## Purpose

Implements [`HitTester`](./hit-tester.md) by walking the scene graph and testing each shape
geometrically. It is the strategy behind `Stage.hitTest`/`getIntersection`.

## Exports

- `class GeometricHitTester implements HitTester`.

## How it works

For a world point, it walks the tree **depth-first, children last-to-first** (so the
topmost-drawn shape is tested first) and returns the first hit. Per shape:

1. **Broad phase.** Skip the shape unless its world AABB — expanded by the world-space
   tolerance — contains the point. (Cheap reject; the future quadtree replaces this step.)
2. **To local space.** Compute `localTolerance = worldTolerance / √|det(worldMatrix)|` and
   invert the world matrix to get the local point.
3. **Vertices** (if requested) — return a `'vertex'` hit (with `vertexIndex`) when the local
   point is within tolerance of a `getVertices()` entry.
4. **Fill/stroke** — call `shape.hitTest(local, { tolerance, fill, stroke })`; a non-null
   result becomes a `'fill'`/`'stroke'` hit.
5. **Bounds** (if requested) — fall back to a `'bounds'` hit when the point is inside the
   (expanded) local bounds.

A `match` predicate, if provided, gates every result; non-matching nodes are skipped and
the walk continues.

## Conventions & gotchas

- **Reverse-z = topmost-first.** Children are visited from last to first because later
  children paint on top, so they should win ties.
- **`deep: false`** stops the walk from descending into containers (top-level hit only).
- **Skips non-visible / non-listening** subtrees entirely (the `listening` flag gates hit
  testing, exactly as it does for events).
- **Performance.** It is O(n) over candidate nodes; the AABB prefilter keeps the constant
  low, and the `HitTester` seam lets a spatial index drop in for large scenes.

## Relationships

- **Implements:** [`HitTester`](./hit-tester.md).
- **Uses:** [`Container`](../scene/container.md)/[`Shape`](../scene/shape.md) (`hitTest`,
  `getVertices`, `getWorldBounds`), [`Bounds.expand`](../math/bounds.md).

## Example

```ts
const tester = new GeometricHitTester()
tester.hitTest(stage, { x: 100, y: 5 }, 1 / camera.zoom, { tolerance: 6 })
```
