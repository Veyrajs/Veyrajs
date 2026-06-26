# `src/scene/shapes/polygon.ts` — Polygon

> A closed, fillable polygon through explicit local-space points.

## Purpose

A closed shape through a list of points — the fillable counterpart to [`Line`](./line.md).

## Exports

- `interface PolygonConfig extends ShapeConfig` — adds `points?: Vec2[]`.
- `class Polygon extends Shape` — `type = 'Polygon'`; accessor `points`.

## Behaviour

- **`getLocalBounds()`** → `Bounds.fromPoints(points)`.
- **`drawOps()`** → a `polygon` op with `closed: true`.
- **`containsPoint(p)`** → inside the fill **or** near an edge:
  - if `fill` is set and `pointInPolygon(p, points)` → hit;
  - else `distanceToPolyline(p, points, true) ≤ max(strokeWidth / 2, 2)`.

## Conventions & gotchas

- **Points are copied** on set/construction; the getter returns a `readonly` view.
- The fill hit test only applies when `fill` is set — an unfilled polygon is hit only near
  its outline, which matches what the user sees.

## Example

```ts
new Polygon({
  x: 470, y: 205,
  points: [{ x: 0, y: -48 }, { x: 46, y: 34 }, { x: -46, y: 34 }],
  fill: '#34d399', stroke: '#059669', strokeWidth: 2,
})
```

See [shapes overview](./index.md), [`Shape`](../shape.md), [geometry](../../math/geometry.md).
