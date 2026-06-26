# `src/scene/shapes/` — Concrete shapes

> The drawable leaf nodes. Each implements the `Shape` contract; this barrel re-exports them.

## The shared contract

Every concrete shape extends [`Shape`](../shape.md) and implements three methods:

- **`getLocalBounds(): Bounds`** — its extent in local space.
- **`drawOps(): DrawOp[]`** — backend-neutral [draw ops](../../render/draw-ops.md) in local
  coordinates (usually spreading `this.fillStrokeStyle`).
- **`containsPoint(localPoint): boolean`** — a local-space hit test.

The node's transform (`x, y, scale, rotation, …`) places the shape; the geometry is always
authored around the shape's **local origin**, which differs by shape:

| Shape | Doc | Local origin | Drawn via |
| --- | --- | --- | --- |
| `Rect` | [rect.md](./rect.md) | top-left `(0,0)` | `rect` op |
| `Circle` | [circle.md](./circle.md) | center `(0,0)` | `ellipse` op |
| `Ellipse` | [ellipse.md](./ellipse.md) | center `(0,0)` | `ellipse` op |
| `Line` | [line.md](./line.md) | explicit points | `polygon` op (open) |
| `Polygon` | [polygon.md](./polygon.md) | explicit points | `polygon` op (closed) |
| `Image` | [image.md](./image.md) | top-left `(0,0)` | `image` op |
| `Text` | [text.md](./text.md) | top-left `(0,0)` | `text` op |

## Exports (`index.ts` barrel)

Each shape and its config type: `Rect`/`RectConfig`, `Circle`/`CircleConfig`,
`Ellipse`/`EllipseConfig`, `Line`/`LineConfig`, `Polygon`/`PolygonConfig`,
`Image`/`ImageConfig`, `Text`/`TextConfig`. All are re-exported from the package
[`index.ts`](../../index.md).

## Conventions & gotchas

- **Paint setters mark dirty, not transform.** Changing `fill`/`width`/`points` schedules a
  repaint but does **not** invalidate the world matrix (geometry doesn't move the node).
- **Local coordinates only** in `drawOps()` — the renderer applies the world transform.
- **Hit tests are geometric and coarse** for now (Phase 6 adds tolerance + options). Filled
  polygons use point-in-polygon; strokes/lines use distance-to-polyline.

## Future / not yet

- `Path` (arbitrary Bézier) is deferred with the vector-editing work; a `path` draw-op and
  command model arrive then. Precise text measurement (via the renderer) is also a later
  refinement.
