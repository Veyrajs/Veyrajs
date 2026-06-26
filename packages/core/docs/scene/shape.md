# `src/scene/shape.ts` — Drawable leaf base class

> The bridge between the scene graph and the renderer: carries paint style, emits DrawOps,
> answers point queries.

## Purpose

`Shape` is the abstract base for drawable leaf nodes. The concrete shapes — `Rect`,
`Circle`, `Ellipse`, `Line`, `Polygon`, `Image`, `Text` — live in
[`scene/shapes/`](./shapes/index.md). It extends [`Node`](./node.md) with paint style and
the rendering/hit-testing contract, and it implements the
[`Renderable`](../render/renderer.md) interface the renderer consumes.

## Exports

- `interface ShapeConfig extends NodeConfig` — adds paint props (`fill`, `stroke`,
  `strokeWidth`, `lineDash`, `lineCap`, `lineJoin`).
- `type ShapeHitKind` (`'fill' | 'stroke'`) and `interface ShapeHitOptions`
  (`tolerance`, `fill`, `stroke`).
- `abstract class Shape extends Node implements Renderable`:
  - typed accessors for the paint properties,
  - `protected get fillStrokeStyle` — the style bundle subclasses spread into their ops,
  - `abstract getLocalBounds()`, `abstract drawOps()`,
  - `abstract hitTest(localPoint, options?)` → `ShapeHitKind | null`,
  - concrete `containsPoint(localPoint, tolerance?)` and `getVertices()` (default `null`).

## How it works

A concrete shape implements three methods:

- **`getLocalBounds()`** — its extent in local space (used for world bounds and the
  hit-test broad phase).
- **`drawOps()`** — returns backend-neutral [`DrawOp`s](../render/draw-ops.md) in local
  coordinates, usually spreading `this.fillStrokeStyle` for paint.
- **`hitTest(localPoint, options?)`** — local-space hit test returning which part was hit
  (`'fill'`/`'stroke'`) or `null`; `tolerance` (local units) is additive to the geometry
  (e.g. stroke width). `containsPoint` is the boolean convenience and `getVertices()`
  exposes local corners/points for vertex hit-testing.

Setting a paint property calls `markDirty()` (a visual change) but does **not** invalidate
the transform — paint doesn't move geometry.

Because `Shape` implements `Renderable` (just `opacity` + `drawOps()`), the renderer can
draw it without knowing it's a `Shape` — preserving the one-way `scene → render` dependency.

## Conventions & gotchas

- **Local coordinates only.** `drawOps()` must emit local-space geometry; the renderer
  applies the world transform. Never bake world position into an op.
- **No context access.** A shape never sees a `CanvasRenderingContext2D`. If a shape needs
  something the `DrawOp` union can't express, the right move is to extend the union (shared
  by all backends), not to reach for the canvas.
- **`fillStrokeStyle` is `protected`** — it's an implementation helper for subclasses, not
  public API.

## Relationships

- **Extends:** [`Node`](./node.md). **Implements:** [`Renderable`](../render/renderer.md).
- **Produces:** [`DrawOp`](../render/draw-ops.md). **Drawn by:** the renderer via the
  [`Stage`](./stage.md) walk.
- The test [`TestRect`](../__tests__.md) is a minimal concrete `Shape` used until Phase 3.

## Example (shape of a concrete subclass)

```ts
class Rect extends Shape {
  readonly type = 'Rect'
  width = 0; height = 0
  getLocalBounds() { return Bounds.fromRect(0, 0, this.width, this.height) }
  drawOps() { return [{ type: 'rect', x: 0, y: 0, width: this.width, height: this.height, ...this.fillStrokeStyle }] }
  hitTest(p) { return p.x >= 0 && p.y >= 0 && p.x <= this.width && p.y <= this.height ? 'fill' : null }
}
```
