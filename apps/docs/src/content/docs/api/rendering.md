---
title: Rendering
description: The Renderer seam, the Renderable/FrameInfo contracts, the Canvas2DRenderer backend, and the backend-neutral DrawOp vocabulary.
sidebar:
  order: 6
---

The render layer decouples *what* to draw (the scene graph) from *how* to draw it (a backend). The
scene produces [`Renderable`](#renderable) nodes plus world matrices; a [`Renderer`](#renderer)
consumes them. The dependency points one way only (`scene → render → math`), so a WebGL/WebGPU backend
could replace Canvas 2D with **zero changes to nodes**. All coordinates in draw ops are **local
space** — the renderer applies the world transform (and DPR).

## Renderer

`interface Renderer` — the boundary every backend implements. The [`Stage`](/Veyrajs/api/scene/)
drives the lifecycle each frame: `begin` → `renderNode` for each visible shape in depth-first z-order
→ `end`. A renderer is a **pure consumer** — it reads the scene and draws, but never mutates it.

```ts
interface Renderer {
  readonly canvas?: HTMLCanvasElement       // present when the backend is canvas-based
  setSize(width: number, height: number, pixelRatio: number): void  // size the output surface
  begin(frame: FrameInfo): void             // start a frame (e.g. clear the canvas)
  renderNode(node: Renderable, worldMatrix: Matrix): void  // draw one renderable under its transform
  end(): void                               // finish a frame
  destroy(): void                           // release resources / DOM
}
```

`worldMatrix` is a [`Matrix`](/Veyrajs/api/math/). The renderer owns its surface — size and DOM
lifecycle are surfaced via `setSize` / `canvas` / `destroy`.

## Renderable

`interface Renderable` — the minimal surface a renderer needs from a node, implemented by
[`Shape`](/Veyrajs/api/shapes/). Intentionally tiny so the render layer does **not** depend on the
scene layer.

```ts
interface Renderable {
  readonly opacity: number
  drawOps(): DrawOp[]
}
```

## FrameInfo

`interface FrameInfo` — viewport info passed to `begin`.

```ts
interface FrameInfo { width: number; height: number; pixelRatio: number }
```

## Canvas2DRenderer

`class Canvas2DRenderer implements Renderer` — the MVP backend and the **only** module allowed to
touch a `CanvasRenderingContext2D`. It owns the DOM `<canvas>`, clears each frame, and executes every
node's [`DrawOp`s](#drawop) under its world transform. Members: `canvas`, `setSize`, `begin`,
`renderNode`, `end`, `destroy`.

```ts
interface Canvas2DRendererOptions {
  container          // element to append the canvas to
  background?        // background fill painted each frame
  canvas?            // adopt an existing canvas instead of creating one
}
```

Behaviour:

- **Construction** creates (or adopts) a `<canvas>`, appends it to `container`, and grabs a `'2d'`
  context.
- **`setSize(w, h, dpr)`** sets the backing store to `w·dpr × h·dpr` device pixels while the CSS size
  stays `w × h` — what makes rendering crisp on high-DPI screens.
- **`begin(frame)`** resets the transform to the DPR scale, clears the canvas in CSS-pixel space, and
  paints the background if one was configured.
- **`renderNode(node, world)`** sets the transform to `scale(dpr) · world`, sets `globalAlpha` from
  the node's opacity, and executes each op (`fillRect` / `ellipse` / path / `drawImage` / text). Each
  call is bracketed by `save()`/`restore()`, so per-node transform/alpha never leak to siblings.
- **`end()`** is a no-op for the immediate Canvas 2D backend.
- **`destroy()`** removes the canvas from the DOM.

:::note[DPR lives only here]
The device-pixel-ratio factor is applied **only** inside this renderer; every other module works in
CSS-pixel/world space, so you never thread `dpr` into scene math. Group opacity does not yet compound
onto descendants — today each shape applies only its own opacity.
:::

## DrawOp

`type DrawOp = RectOp | EllipseOp | PolygonOp | ImageOp | TextOp` — a small, backend-neutral set of
drawing primitives. A `Shape` describes itself by returning `DrawOp[]`; the renderer decides how to
turn them into pixels. It is a **discriminated union** on `type`. Ops are plain **data** (not
commands) — inspectable, unit-testable without a canvas, and in principle serializable. Coordinates
are **local-space**.

### FillStrokeStyle

`interface FillStrokeStyle` — shared paint props spread into the geometry ops (all optional): `fill`,
`stroke`, `strokeWidth`, `lineDash`, `lineCap`, `lineJoin`.

### Op members

- `RectOp` — `{ type: 'rect', x, y, width, height, ...style }`
- `EllipseOp` — `{ type: 'ellipse', x, y, radiusX, radiusY, ...style }`
- `PolygonOp` — `{ type: 'polygon', points, closed?, ...style }` (`points` are [`Vec2`](/Veyrajs/api/math/))
- `ImageOp` — `{ type: 'image', image, x, y, width?, height? }`
- `TextOp` — `{ type: 'text', x, y, text, font, textAlign?, textBaseline?, fill?, stroke?, strokeWidth? }`

where `...style` is [`FillStrokeStyle`](#fillstrokestyle). Renderers switch over `type` and must
handle every member; adding a member is a deliberate, type-checked change across all backends.

## Related

- [Rendering & the Frame Loop (concept)](/Veyrajs/concepts/rendering/)
- [Shapes API](/Veyrajs/api/shapes/)
