# `@annotacanvas/core` — Architecture & Module Docs

This folder documents **every source file** in `packages/core/src`, one markdown file per
module, mirroring the source tree. The goal is to make the engine's context deeply
understandable without reverse-engineering it from code.

> Status: Phases 1–3 complete (math, scene graph, transforms, renderer abstraction,
> scheduler, concrete shapes). Camera, events, hit-testing, controls, serialization, undo
> and the Vue adapter are future phases — each module doc notes where those plug in.

---

## What this package is

A **framework-agnostic, TypeScript-first 2D canvas engine**. It is a *retained-mode*
scene graph: you build a tree of mutable objects (`Stage → Layer → Group/Shape`), mutate
their properties, and the engine redraws. It has **zero runtime dependencies**.

It is intentionally *not* an annotation tool. Annotation primitives are planned as future
plugins that attach through the engine's extension points — with no changes to this core.

---

## The four layers

```
        ┌───────────────────────────────────────────────┐
  scene │  Stage · Layer · Group · Shape · Node          │  retained-mode tree
        │  (the objects you build and mutate)            │
        └───────────────┬───────────────────────────────┘
                        │ emits DrawOps + world matrices
        ┌───────────────▼───────────────────────────────┐
 render │  Renderer (interface) · DrawOp (vocabulary)    │  backend-neutral seam
        │  Canvas2DRenderer (MVP) · MockRenderer (tests) │
        └───────────────┬───────────────────────────────┘
                        │ uses
        ┌───────────────▼───────────────────────────────┐
   math │  Matrix · Vec2 · Bounds                        │  pure geometry
        └───────────────────────────────────────────────┘

  support: scheduler (frame coalescing) · id (deterministic ids) · version · index
```

- **math** — pure, dependency-free geometry. The `Matrix` is the single transform
  primitive used by everything.
- **scene** — the object graph. Nodes hold transforms and hierarchy; shapes describe
  themselves as `DrawOp`s; the `Stage` owns the renderer and the frame loop.
- **render** — the backend seam. Nodes never touch a canvas context; they emit `DrawOp`s
  that a `Renderer` consumes. Today that's `Canvas2DRenderer`; tomorrow it could be WebGL.
- **support** — small utilities: the frame scheduler, id generator, version constant, and
  the public barrel (`index.ts`).

---

## Module map

| Source | Doc | What it is |
| --- | --- | --- |
| `src/index.ts` | [index.md](./index.md) | Public API barrel |
| `src/version.ts` | [version.md](./version.md) | Version constant |
| `src/id.ts` | [id.md](./id.md) | Deterministic node ids |
| `src/scheduler.ts` | [scheduler.md](./scheduler.md) | Frame coalescing (`FrameScheduler`) |
| `src/math/vec2.ts` | [math/vec2.md](./math/vec2.md) | 2D point/vector + helpers |
| `src/math/matrix.ts` | [math/matrix.md](./math/matrix.md) | 2×3 affine transform |
| `src/math/bounds.ts` | [math/bounds.md](./math/bounds.md) | Axis-aligned bounding box |
| `src/math/geometry.ts` | [math/geometry.md](./math/geometry.md) | Hit-test geometry helpers |
| `src/math/index.ts` | [math/index.md](./math/index.md) | Math barrel |
| `src/render/draw-ops.ts` | [render/draw-ops.md](./render/draw-ops.md) | Backend-neutral draw vocabulary |
| `src/render/renderer.ts` | [render/renderer.md](./render/renderer.md) | `Renderer`/`Renderable` contracts |
| `src/render/canvas2d-renderer.ts` | [render/canvas2d-renderer.md](./render/canvas2d-renderer.md) | Canvas 2D backend |
| `src/scene/node.ts` | [scene/node.md](./scene/node.md) | Scene-graph base class |
| `src/scene/container.ts` | [scene/container.md](./scene/container.md) | Branch node (children) |
| `src/scene/group.ts` | [scene/group.md](./scene/group.md) | Generic grouping container |
| `src/scene/layer.ts` | [scene/layer.md](./scene/layer.md) | Render partition under the stage |
| `src/scene/shape.ts` | [scene/shape.md](./scene/shape.md) | Drawable leaf base class |
| `src/scene/stage.ts` | [scene/stage.md](./scene/stage.md) | Root + renderer + frame loop |
| `src/scene/shapes/**` | [scene/shapes/index.md](./scene/shapes/index.md) | Concrete shapes (Rect, Circle, Ellipse, Line, Polygon, Image, Text) |
| `src/__tests__/**` | [__tests__.md](./__tests__.md) | Test strategy & helpers |

---

## The core data flow (read this once)

Everything in the engine follows one loop:

```
  you mutate a property            node.x = 120
        │
        ▼
  node.markDirty()                 walks up to the root Stage
        │
        ▼
  Stage.onSubtreeDirty()           → stage.requestRender()
        │
        ▼
  FrameScheduler.request()         coalesces many mutations into ONE frame (rAF)
        │
        ▼
  Stage.render()                   depth-first walk of visible nodes
        │
        ▼
  renderer.renderNode(shape, world)   shape.drawOps() executed under its world matrix
```

Two consequences worth internalizing:

1. **You never call "draw" yourself.** Mutating a property schedules a single coalesced
   repaint. `stage.render()` exists for synchronous/test use.
2. **Nodes are renderer-agnostic.** A shape produces data (`DrawOp[]`), not canvas calls.
   Swapping `Canvas2DRenderer` for a WebGL renderer requires zero node changes.

---

## Coordinate spaces & the transform convention

Three spaces today (a fourth — screen — arrives with the camera in Phase 4):

- **Local** — a node's own frame. `getLocalBounds()` and `containsPoint()` are local.
- **World** — the shared scene space. `worldMatrix()` maps local → world.
- **Screen** — *(future)* pixels in the host element; the camera's view matrix maps
  world → screen.

The single rule that makes all of this consistent:

> A `Matrix` is the Canvas-native `[a, b, c, d, e, f]` affine, and `A.multiply(B) = A · B`
> means **"apply B first, then A."** Therefore `worldMatrix = parentWorld.multiply(localMatrix)`
> — local space first, then up through ancestors.

Coordinates are **top-left origin, y-down, rotation in degrees clockwise** (matches the
Canvas/DOM/image-pixel convention). See [math/matrix.md](./math/matrix.md).

---

## Key design decisions (and why)

- **Mutable OOP scene graph** — chosen over a reactive/immutable core for a simpler,
  faster MVP and ergonomic imperative API. Undo and reactivity are added as *layers* on
  top (the command layer in Phase 8; framework adapters in Phase 9).
- **Renderer abstraction from day one** — Canvas 2D is the only backend now, but nodes
  emit `DrawOp`s so WebGL can be added later without touching the scene graph.
- **Lazy, version-counted world transforms** — changing a node never eagerly walks its
  subtree (Konva's classic cost). Descendants recompute on demand only when an ancestor's
  world matrix actually changed. See [scene/node.md](./scene/node.md).
- **DPR isolated in the renderer** — device-pixel-ratio scaling lives only in
  `Canvas2DRenderer`; all scene math stays in CSS-pixel space.

---

## Suggested reading order

1. [math/matrix.md](./math/matrix.md) — the transform rules everything depends on.
2. [scene/node.md](./scene/node.md) — transforms, dirty propagation, the world-matrix cache.
3. [scene/container.md](./scene/container.md) → [scene/stage.md](./scene/stage.md) — the tree and the frame loop.
4. [render/renderer.md](./render/renderer.md) → [render/canvas2d-renderer.md](./render/canvas2d-renderer.md) — the backend seam.
5. The rest as needed.
