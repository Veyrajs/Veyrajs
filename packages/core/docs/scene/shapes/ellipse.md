# `src/scene/shapes/ellipse.ts` — Ellipse

> Center-origin ellipse.

## Purpose

An axis-aligned ellipse with independent `radiusX`/`radiusY`, centered on the node's local
origin `(0, 0)`.

## Exports

- `interface EllipseConfig extends ShapeConfig` — adds `radiusX?`, `radiusY?`.
- `class Ellipse extends Shape` — `type = 'Ellipse'`; accessors `radiusX`, `radiusY`.

## Behaviour

- **`getLocalBounds()`** → `Bounds(-rx, -ry, 2rx, 2ry)`.
- **`drawOps()`** → an `ellipse` op centered at `(0,0)`.
- **`containsPoint(p)`** → `(p.x/rx)² + (p.y/ry)² ≤ 1` (returns `false` for non-positive
  radii).

## Conventions & gotchas

- The local origin is the center, so geometry is symmetric about `(0,0)` and the node
  transform places/rotates it. Rotation comes from the node's `rotation`, not the op.

## Example

```ts
new Ellipse({ x: 480, y: 95, radiusX: 80, radiusY: 48, fill: '#a78bfa' })
```

See [shapes overview](./index.md) and [`Shape`](../shape.md).
