# `src/scene/shapes/line.ts` — Line / polyline

> An open polyline (or closed outline) through explicit local-space points.

## Purpose

Draws a path through a list of points. Open by default (a polyline); set `closed` to join
the last point back to the first.

## Exports

- `interface LineConfig extends ShapeConfig` — adds `points?: Vec2[]`, `closed?: boolean`.
- `class Line extends Shape` — `type = 'Line'`; accessors `points`, `closed`.

## Behaviour

- **`getLocalBounds()`** → `Bounds.fromPoints(points)`.
- **`drawOps()`** → a `polygon` op with `closed` reflecting the flag.
- **`containsPoint(p)`** → near the stroke: `distanceToPolyline(p, points, closed) ≤ tol`,
  where `tol = max(strokeWidth / 2, 2)`.

## Conventions & gotchas

- **Points are copied** on set/construction (`points.map(...)`), so external mutation of the
  passed array does not silently change the shape. The getter returns a `readonly` view.
- A `Line` is stroke-oriented; for a filled closed shape prefer [`Polygon`](./polygon.md).
- Hit tolerance is coarse (Phase 6 makes tolerance zoom-aware and configurable).

## Example

```ts
new Line({
  x: 40, y: 230,
  points: [{ x: 0, y: 0 }, { x: 110, y: 50 }, { x: 220, y: 0 }],
  stroke: '#fbbf24', strokeWidth: 3,
})
```

See [shapes overview](./index.md), [`Shape`](../shape.md), [geometry](../../math/geometry.md).
