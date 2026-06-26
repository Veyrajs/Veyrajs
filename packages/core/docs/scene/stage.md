# `src/scene/stage.ts` — Root, renderer owner, frame loop

> The engine's main entry point. Owns the renderer, the scheduler, and the viewport;
> turns "a property changed" into "one frame rendered."

## Purpose

`Stage` is the root of the scene graph and the object you create to start using the engine.
It extends [`Container`](./container.md) and additionally owns:

- the [`Renderer`](../render/renderer.md) (defaults to
  [`Canvas2DRenderer`](../render/canvas2d-renderer.md)),
- the [`FrameScheduler`](../scheduler.md),
- the viewport `width`/`height`/`pixelRatio` and the host `container`.

## Exports

- `interface StageOptions { container; width?; height?; pixelRatio?; background?; renderer?; camera? }`.
- `class Stage extends Container`:
  - getters `width`, `height`, `pixelRatio`, `canvas`; the `camera` ([Camera](./camera.md)),
  - `screenToWorld(point)`, `worldToScreen(point)` (delegate to the camera),
  - `hitTest(worldPoint, options?)` → `HitResult | null` (zoom-aware, options-driven),
  - `getIntersection(worldPoint, options?)` — convenience returning just the node,
  - `add(...layers)` (Layer-only), `createLayer(config?)`,
  - `setSize(w, h)`, `setPixelRatio(dpr)`,
  - `requestRender()` (coalesced), `render()` (synchronous),
  - `destroy()`.

## How it works

### Construction

The constructor resolves size and DPR, builds (or accepts) a renderer, creates a scheduler
whose callback is `() => this.render()`, sizes the renderer, and renders once.

### The frame loop

```
mutation → node.markDirty() → (root) Stage.onSubtreeDirty() → requestRender()
         → scheduler.request() (coalesce) → render()
```

`render()` calls `renderer.begin(frame)`, walks the tree with `renderSubtree`, then
`renderer.end()`. `renderSubtree`:

- skips a node if `!visible || opacity <= 0`,
- if it's a [`Shape`](./shape.md), calls `renderer.renderNode(shape, view · shape.worldMatrix())`
  where `view = camera.viewMatrix()` — so `screen = view · world`,
- if it's a `Container`, recurses into children in order (depth-first z-order).

So shapes draw back-to-front, each under its own world transform.

### Layer enforcement

`add()` rejects non-`Layer` children with a `TypeError`. Use `createLayer()` to make and
attach a layer in one call.

### Renderer injection

Passing `options.renderer` swaps the backend — used by tests (a `MockRenderer`) and, in
future, a WebGL renderer. When injected, the `Canvas2DRenderer` is not created and
`stage.canvas` reflects the injected renderer's `canvas` (possibly `undefined`).

## Conventions & gotchas

- **You don't call `render()` in normal use.** Mutating properties schedules a coalesced
  frame. `render()` is for synchronous needs and tests; `requestRender()` is the async path.
- **`onSubtreeDirty()` is the wiring point.** `Stage` overrides this `Node` hook to call
  `requestRender()`. That's how a deep node's change reaches the scheduler.
- **`destroy()` order:** cancel the scheduler → remove children → destroy the renderer (so
  no frame fires mid-teardown).
- **The camera is applied at render, not in node transforms.** Each shape is drawn under
  `camera.viewMatrix() · worldMatrix()`, so `screen = view · world` and world coordinates
  stay camera-independent.

## Relationships

- **Extends:** [`Container`](./container.md). **Owns:** [`Camera`](./camera.md),
  [`Renderer`](../render/renderer.md), [`FrameScheduler`](../scheduler.md), an
  [`EventManager`](../events/event-manager.md), a [`HitTester`](../hit/hit-tester.md).
  **Draws:** [`Shape`](./shape.md) nodes.
- **Used by:** the demo app and (future) the Vue adapter.

## Example

```ts
import { Stage } from '@annotacanvas/core'

const stage = new Stage({ container: el, width: 800, height: 480, background: '#0b1220' })
const layer = stage.createLayer()
layer.add(myShape)        // schedules a coalesced render automatically
// ...
stage.destroy()
```
