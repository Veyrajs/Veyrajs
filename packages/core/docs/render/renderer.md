# `src/render/renderer.ts` — Rendering contracts

> The interface that decouples the scene graph from any specific drawing backend.

## Purpose

Defines the boundary between *what* to draw (the scene graph) and *how* to draw it (a
backend). The scene graph produces `Renderable` nodes plus world matrices; a `Renderer`
consumes them. This is the seam that lets a WebGL/WebGPU backend replace Canvas 2D with
**zero changes to nodes**.

## Exports

- `interface FrameInfo { width; height; pixelRatio }` — viewport info passed to `begin`.
- `interface Renderable { readonly opacity: number; drawOps(): DrawOp[] }` — the minimal
  surface a renderer needs from a node. Implemented by [`Shape`](../scene/shape.md).
- `interface Renderer`:
  - `readonly canvas?: HTMLCanvasElement` — present when the backend is canvas-based.
  - `setSize(width, height, pixelRatio)` — size the output surface.
  - `begin(frame)` — start a frame (e.g. clear the canvas).
  - `renderNode(node, worldMatrix)` — draw one renderable under its world transform.
  - `end()` — finish a frame.
  - `destroy()` — release resources / DOM.

## How it works

The `Stage` drives the lifecycle each frame: `begin` → `renderNode` for each visible shape
in depth-first z-order → `end`. The renderer is a **pure consumer**: it reads the scene
graph and draws, but never mutates it. That one-directional dependency is what enables
headless rendering, alternate backends, and easy testing.

`Renderable` is intentionally tiny (`opacity` + `drawOps()`) so that the render layer does
**not** depend on the scene layer — only the scene layer depends on the render layer. That
keeps the dependency graph acyclic (`scene → render → math`).

## Conventions & gotchas

- **No back-references.** `render/` must not import from `scene/`. The renderer talks to
  the structural `Renderable` type, not to `Shape` directly.
- **Renderer owns its surface.** Size and DOM lifecycle (creating/removing a canvas) are
  the renderer's responsibility, surfaced via `setSize`/`canvas`/`destroy`.
- **Capabilities can be advertised later.** As backends diverge (filters, blend modes), the
  interface can grow optional capability flags rather than forcing a lowest common
  denominator.

## Relationships

- **Implemented by:** [`Canvas2DRenderer`](./canvas2d-renderer.md) (MVP) and the test
  `MockRenderer` (see [`__tests__.md`](../__tests__.md)).
- **Driven by:** [`scene/stage.ts`](../scene/stage.md).
- **Uses:** [`Matrix`](../math/matrix.md), [`DrawOp`](./draw-ops.md).

## Future / not yet

- A `WebGLRenderer`/`WebGPURenderer` implementing this same interface (the deferred-but-
  reserved backend). An `OffscreenCanvas`/worker variant is also a renderer-internal change.
