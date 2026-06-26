# `src/scene/shapes/circle.ts` — Circle

> Center-origin circle.

## Purpose

A circle of a given `radius`, centered on the node's local origin `(0, 0)`. The node's
`x`/`y` is therefore the **center**.

## Exports

- `interface CircleConfig extends ShapeConfig` — adds `radius?`.
- `class Circle extends Shape` — `type = 'Circle'`; accessor `radius`.

## Behaviour

- **`getLocalBounds()`** → `Bounds(-r, -r, 2r, 2r)` (centered).
- **`drawOps()`** → an `ellipse` op with `radiusX = radiusY = radius`.
- **`containsPoint(p)`** → `p.x² + p.y² ≤ r²`.

## Conventions & gotchas

- A circle is just an `Ellipse` with equal radii; it exists as a convenience and a clearer
  intent. Because the origin is the center, `getLocalBounds` is symmetric about `(0,0)`.

## Example

```ts
new Circle({ x: 300, y: 95, radius: 52, fill: '#f472b6' })
```

See [shapes overview](./index.md) and [`Shape`](../shape.md).
