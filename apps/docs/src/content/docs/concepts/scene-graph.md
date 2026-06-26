---
title: Scene Graph & Transforms
description: Stage, Layer, Group, Shape, Node — and how world transforms stay cheap.
sidebar:
  order: 1
---

The scene graph is a typed, mutable, retained-mode tree:

```text
Stage → Layer → Group / Shape → Node
```

- **`Node`** — the base class: identity, parent link, transform (`x`, `y`, `scaleX/Y`,
  `rotation`, `skewX/Y`, `offsetX/Y`), `opacity`, `visible`, `listening`, events, and
  serialization. Setters are **guarded** (`if (v !== this._x)`) so assigning an unchanged value
  is a no-op — which is what makes the framework adapters loop-safe.
- **`Container`** → `Group`, `Layer`, `Stage` — adds/removes/reorders children.
- **`Shape`** → `Rect`, `Circle`, `Ellipse`, `Line`, `Polygon`, `Text`, `Image` — geometry as
  `DrawOp[]` plus a `containsPoint` for hit-testing.
- **`Stage`** — the root: owns the host element, the `Camera`, the renderer, and the event
  manager.

## Coordinate spaces

Everything is one affine `Matrix` (2×3). Four explicit spaces:

| Space | What it is |
| --- | --- |
| **Screen** | CSS pixels relative to the host element (what pointer events give you). |
| **World** | the logical scene; `screen = ViewMatrix · world` (the camera). |
| **Local** | a node's own frame; `world = nodeWorldMatrix · local`. |
| **Media** | *(future)* source-image pixels, for annotation work. |

Convention: **top-left origin, y-down, rotation in degrees clockwise**.

## Lazy, version-counted world transforms

A node's `worldMatrix` is `parent.worldMatrix · localMatrix`, computed **lazily** and cached
with a **version counter**. A node only recomputes when its own transform changed or an
ancestor's version advanced — avoiding the eager whole-subtree invalidation that plagues some
engines. Bounds (`getLocalBounds` / `getWorldBounds`) are cached the same way.

## Dirty tracking

Mutations call an internal `markDirty()`, which schedules **one** redraw per animation frame via
the `FrameScheduler` (Konva's `batchDraw` idea). You mutate freely; the engine coalesces.
