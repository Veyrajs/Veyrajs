# `src/render/canvas2d-renderer.ts` — Canvas 2D backend

> The MVP renderer. The **only** module allowed to touch a `CanvasRenderingContext2D`.

## Purpose

Implements [`Renderer`](./renderer.md) on top of the Canvas 2D API. It owns the DOM
`<canvas>`, clears each frame, and executes every node's [`DrawOp`s](./draw-ops.md) under
its world transform.

## Exports

- `interface Canvas2DRendererOptions { container; background?; canvas? }`.
- `class Canvas2DRenderer implements Renderer` — `canvas`, `setSize`, `begin`,
  `renderNode`, `end`, `destroy`.

## How it works

- **Construction** creates (or adopts) a `<canvas>`, appends it to `container`, and grabs a
  `'2d'` context (stored nullable — see gotchas).
- **`setSize(w, h, dpr)`** sets the backing store to `w·dpr × h·dpr` device pixels while
  the CSS size stays `w × h`. This is what makes rendering crisp on high-DPI screens.
- **`begin(frame)`** resets the transform to the DPR scale, clears the canvas in CSS-pixel
  space, and paints the background if one was configured.
- **`renderNode(node, world)`** is the heart of it:

  ```
  ctx.setTransform(dpr·world.a, dpr·world.b, dpr·world.c,
                   dpr·world.d, dpr·world.e, dpr·world.f)
  ```

  The combined matrix is `scale(dpr) · world`, so the node's `DrawOp`s — authored in
  **local space** — land in the right place at the right resolution. It then sets
  `globalAlpha` from the node's opacity and executes each op (`fillRect`/`ellipse`/path/
  `drawImage`).
- **`end()`** is a no-op for the immediate Canvas 2D backend.
- **`destroy()`** removes the canvas from the DOM.

## Conventions & gotchas

- **DPR lives here and nowhere else.** Every other module works in CSS-pixel/world space;
  the device-pixel-ratio factor is applied only inside this renderer. Don't leak `dpr` into
  scene math.
- **Null-context tolerance.** `getContext('2d')` can return `null` (e.g. in some test DOMs).
  Every method guards on it and no-ops, so the engine never throws just because a real 2D
  context is unavailable — which is why scene/stage tests can run headlessly.
- **`save()`/`restore()` per node.** Each `renderNode` brackets its work, so per-node
  transform/alpha changes don't leak to siblings.
- **Group opacity does not yet compound** onto descendants (a Phase 3 refinement); today
  each shape applies only its own opacity.

## Relationships

- **Implements:** [`Renderer`](./renderer.md).
- **Executes:** [`DrawOp`](./draw-ops.md) values.
- **Used by:** [`scene/stage.ts`](../scene/stage.md) as the default renderer when none is
  injected.

## Future / not yet

- Dirty-rectangle clears, layer/object offscreen caching, and an overlay canvas for
  interaction handles are planned optimizations that fit behind the same `Renderer`
  interface.
