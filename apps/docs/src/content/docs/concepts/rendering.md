---
title: Rendering & Camera
description: The renderer abstraction, draw ops, the frame scheduler, and the camera.
sidebar:
  order: 2
---

## The renderer seam

Nodes never touch a `CanvasRenderingContext2D`. Instead, each shape describes itself as
backend-neutral **draw operations** (`DrawOp[]` — rect, ellipse, polygon, image, text, with a
`FillStrokeStyle`). A `Renderer` consumes them:

```ts
interface Renderer {
  begin(frame: FrameInfo): void
  // walks the tree, applies world transforms, emits the shape's draw ops
  end(): void
  resize(w: number, h: number, dpr: number): void
}
```

The MVP backend is **`Canvas2DRenderer`**. Because nodes emit data rather than 2D calls, a
future `WebGLRenderer` is a second `Renderer` implementation with **no node-API change** — the
single most important seam in the engine.

## The frame loop

`Stage` owns a `FrameScheduler`. Mutations call `markDirty()`; the scheduler coalesces them into
**one `requestAnimationFrame` redraw** (`stage.requestRender()`). `stage.render()` forces one
synchronously when you need it.

## Device pixel ratio

There is **one** source of truth for `devicePixelRatio`, confined to the renderer / canvas
sizing. The backing canvas is sized `cssW·dpr × cssH·dpr`; all scene math stays in CSS pixels.
DPR never leaks into world or local coordinates.

## Camera

The `Camera` lives on the stage and produces the **view matrix** (world → screen) and its
inverse:

```ts
stage.camera.zoomAt(point, 1.2)     // zoom about a screen point (e.g. the cursor)
stage.camera.setZoom(1.5)
stage.camera.screenToWorld(point)   // and worldToScreen(point)
stage.camera.reset()
```

Zoom and pan live entirely in the camera — nodes don't change when you zoom, so selection and
handles stay correct and cheap.
