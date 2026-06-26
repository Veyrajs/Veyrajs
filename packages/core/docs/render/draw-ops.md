# `src/render/draw-ops.ts` — Backend-neutral draw vocabulary

> The data language shapes use to describe themselves instead of issuing canvas calls.

## Purpose

Defines `DrawOp` — a small, **backend-neutral** set of drawing primitives. A `Shape`
describes what it looks like by returning `DrawOp[]`; the renderer decides how to turn
those into actual pixels. This indirection is the key to supporting multiple rendering
backends (Canvas 2D now, WebGL/WebGPU later) from one scene graph.

## Exports

- `interface FillStrokeStyle` — shared paint props: `fill`, `stroke`, `strokeWidth`,
  `lineDash`, `lineCap`, `lineJoin` (all optional).
- Op shapes (each a discriminated member keyed by `type`):
  - `RectOp` — `{ type: 'rect', x, y, width, height, ...style }`
  - `EllipseOp` — `{ type: 'ellipse', x, y, radiusX, radiusY, ...style }`
  - `PolygonOp` — `{ type: 'polygon', points, closed?, ...style }`
  - `ImageOp` — `{ type: 'image', image, x, y, width?, height? }`
  - `TextOp` — `{ type: 'text', x, y, text, font, textAlign?, textBaseline?, fill?, stroke?, strokeWidth? }`
- `type DrawOp = RectOp | EllipseOp | PolygonOp | ImageOp | TextOp`.

## How it works

`DrawOp` is a **discriminated union** on the `type` field. Renderers switch over `type`
and draw accordingly. Coordinates in a `DrawOp` are in the shape's **local space** — the
renderer applies the node's world transform (and DPR) before executing the ops, so a shape
never has to know where it sits in the scene.

## Conventions & gotchas

- **Data, not commands.** Ops are plain objects, so they are inspectable, testable, and
  (in principle) serializable/cacheable. A shape that returns `[{ type: 'rect', ... }]` can
  be asserted on directly in a unit test without a canvas.
- **Local coordinates.** Always emit local-space geometry; never bake in world position.
- **The union grows.** Phase 3 (concrete shapes) and later text/path work will add members
  (e.g. a `text` op, a richer `path` op). Renderers must handle every member — adding one
  is a deliberate, type-checked change across backends.

## Relationships

- **Uses:** [`Vec2`](../math/vec2.md) (polygon points).
- **Produced by:** [`scene/shape.ts`](../scene/shape.md) subclasses (`drawOps()`).
- **Consumed by:** [`render/canvas2d-renderer.ts`](./canvas2d-renderer.md) (and any future
  backend).

## Future / not yet

- New ops for text, bézier paths, gradients, and images-with-clip as concrete shapes and
  features arrive. Each addition is shared by all renderers via this single union.
