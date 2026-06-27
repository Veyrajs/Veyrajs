---
title: Rendering & the Frame Loop
description: The Renderer seam, backend-neutral DrawOps, DPR handling, and coalesced frames.
sidebar:
  order: 4
---

Veyrajs separates **what** to draw (the scene graph) from **how** to draw it (a renderer backend).
Nodes never touch a `CanvasRenderingContext2D`; they emit backend-neutral **draw ops**, and a
`Renderer` turns those into pixels. That seam is what reserves a WebGL/WebGPU future with zero node
changes.

```text
scene graph ──drawOps()──▶ DrawOp[] ──▶ Renderer ──▶ pixels
   (what)                  (data)      (how)
```

The dependency only ever points one way (`scene → render → math`): the render layer talks to a tiny
structural `Renderable` type, never to `Shape` directly.

## Draw ops — the drawing vocabulary

A shape describes itself by returning a `DrawOp[]` in **local coordinates**. `DrawOp` is a
discriminated union on `type`:

| Op | Shape of it |
| --- | --- |
| `RectOp` | `{ type: 'rect', x, y, width, height, ...style }` |
| `EllipseOp` | `{ type: 'ellipse', x, y, radiusX, radiusY, ...style }` |
| `PolygonOp` | `{ type: 'polygon', points, closed?, ...style }` |
| `ImageOp` | `{ type: 'image', image, x, y, width?, height? }` |
| `TextOp` | `{ type: 'text', x, y, text, font, textAlign?, textBaseline?, ...style }` |

where `style` is the shared `FillStrokeStyle` (`fill`, `stroke`, `strokeWidth`, `lineDash`,
`lineCap`, `lineJoin`). Because ops are **plain data**, they're inspectable and unit-testable without
a canvas — you can assert a shape returns `[{ type: 'rect', … }]` directly.

```ts
// What a Rect emits (conceptually):
rect.drawOps() // → [{ type: 'rect', x: 0, y: 0, width: 150, height: 90, fill: '#38bdf8' }]
```

## The Renderer interface

```ts
interface Renderer {
  readonly canvas?: HTMLCanvasElement
  setSize(width: number, height: number, pixelRatio: number): void
  begin(frame: FrameInfo): void                       // start a frame (clear, paint bg)
  renderNode(node: Renderable, worldMatrix: Matrix): void // draw one node under its transform
  end(): void                                         // finish a frame
  destroy(): void
}

interface Renderable { readonly opacity: number; drawOps(): DrawOp[] }
```

The `Stage` drives the lifecycle each frame: `begin` → `renderNode` for every visible shape in
depth-first z-order → `end`. A renderer is a **pure consumer**: it reads and draws, never mutates the
scene — which is what enables headless rendering, alternate backends, and easy testing. Inject one
with `new Stage({ renderer })`; see [Custom Renderers](/Veyrajs/advanced/custom-renderers/).

## Canvas2DRenderer & device pixel ratio

`Canvas2DRenderer` is the MVP backend — the **only** module that touches a 2D context. It owns the
`<canvas>`, clears each frame, and draws each node under the combined matrix:

```text
ctx.setTransform( scale(dpr) · world )   // DPR × world transform
ctx.globalAlpha = node.opacity
// then execute each DrawOp: fillRect / ellipse / path / drawImage / fillText
```

`setSize(w, h, dpr)` sets the backing store to `w·dpr × h·dpr` device pixels while the CSS size stays
`w × h` — that's what keeps rendering crisp on high-DPI screens. **DPR lives only here**; every other
module works in CSS-pixel/world space, so you never thread a `devicePixelRatio` through scene math.
Each `renderNode` is bracketed by `save()`/`restore()`, so a node's transform and alpha never leak to
its siblings.

## The frame loop — coalesced repaints

You never call `render()`. A mutation schedules **one** repaint on the next animation frame:

```text
mutation → node.markDirty() → Stage.onSubtreeDirty() → requestRender()
         → FrameScheduler.request()  ← coalesces many requests into one
         → Stage.render():  renderer.begin() → walk tree → renderer.end()
```

The `FrameScheduler` (Konva's `batchDraw` idea) collapses any number of invalidations in a frame into
a single `requestAnimationFrame` callback. Mutate a hundred properties in a loop — you still get one
frame. (`render()` is available for synchronous needs and tests; `requestRender()` is the normal
async path.)

## Overlays

The `Stage` can draw **screen-space overlays** *after* the scene — used by the
[`SelectionController`](/Veyrajs/concepts/selection/) for its handles, which is why they stay a
constant size at any zoom:

```ts
interface Overlay { drawOps(): DrawOp[] }
stage.addOverlay(myOverlay)
stage.removeOverlay(myOverlay)
```

## Related

- [Scene Graph & Transforms](/Veyrajs/concepts/scene-graph/) — what produces the world matrices.
- [Camera & Coordinate Spaces](/Veyrajs/concepts/camera/) — the view matrix composed at render time.
- [Custom Renderers](/Veyrajs/advanced/custom-renderers/) — implement the `Renderer` interface.
