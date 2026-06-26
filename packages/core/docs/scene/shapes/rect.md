# `src/scene/shapes/rect.ts` — Rectangle

> Top-left-origin rectangle.

## Purpose

A `width × height` rectangle whose local origin is its top-left corner — geometry spans
`(0, 0)` to `(width, height)`.

## Exports

- `interface RectConfig extends ShapeConfig` — adds `width?`, `height?`.
- `class Rect extends Shape` — `type = 'Rect'`; accessors `width`, `height`.

## Behaviour

- **`getLocalBounds()`** → `Bounds(0, 0, width, height)`.
- **`drawOps()`** → one `rect` op at `(0,0)` with the shape's paint style.
- **`containsPoint(p)`** → `0 ≤ p.x ≤ width && 0 ≤ p.y ≤ height`.

## Conventions & gotchas

- Position the rectangle with the **node** transform (`x`, `y`), not by offsetting the
  geometry. Setting `width`/`height` marks the node dirty (a repaint), not a transform change.

## Example

```ts
new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2 })
```

See [shapes overview](./index.md) and [`Shape`](../shape.md).
