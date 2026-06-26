# `src/math/geometry.ts` — Geometry helpers

> Pure point/segment/polygon functions that back shape hit-testing.

## Purpose

Small, dependency-free geometry routines used by shapes' `containsPoint`, and (later) by
the Phase 6 hit-testing engine. Kept in the math layer so they stay pure and unit-testable.

## Exports

- `pointInPolygon(point, polygon): boolean` — even-odd ray-cast point-in-polygon test
  (polygon is treated as closed).
- `distanceToSegment(p, a, b): number` — shortest distance from a point to a segment,
  projecting and clamping to the endpoints.
- `distanceToPolyline(p, points, closed = false): number` — shortest distance to a
  polyline; when `closed`, also considers the closing edge.
- `rectCorners(width, height): Vec2[]` — the four corners of a local-origin rectangle.

## How it works

- **`pointInPolygon`** walks each edge and flips an `inside` flag whenever a horizontal ray
  from the point crosses the edge — the classic even-odd rule.
- **`distanceToSegment`** computes the projection parameter `t`, clamps it to `[0, 1]`, and
  returns the distance to the projected (or endpoint) point. A degenerate zero-length
  segment falls back to point distance.
- **`distanceToPolyline`** folds `distanceToSegment` over consecutive point pairs (plus the
  closing edge when `closed`).

## Conventions & gotchas

- **Index-safe.** With `noUncheckedIndexedAccess` on, array lookups are guarded; malformed
  input (sparse arrays) is skipped rather than throwing.
- **Stroke vs. fill.** `pointInPolygon` answers "inside the fill"; `distanceToPolyline`
  answers "near the outline". Shapes combine them: a filled `Polygon` is hit if the point is
  inside *or* near an edge.

## Relationships

- **Uses:** [`Vec2`](./vec2.md).
- **Used by:** [`Line`](../scene/shapes/line.md) and [`Polygon`](../scene/shapes/polygon.md)
  (`containsPoint`). Re-exported from the package [`index.ts`](../index.md).

## Example

```ts
import { pointInPolygon, distanceToSegment } from '@veyrajs/core'

const tri = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 10, y: 20 }]
pointInPolygon({ x: 10, y: 5 }, tri)                       // true
distanceToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 }) // 5
```
