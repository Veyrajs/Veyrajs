---
title: Design Philosophy
description: The seams, conventions, and trade-offs that shape the Veyrajs engine.
---

Veyrajs is a deliberately **un-clever** Canvas-2D retained-mode scene graph, with four pieces of
disciplined future-proofing that are cheap to add now and expensive to retrofit later. Understanding
these four seams explains almost every API decision in the engine.

## The four seams

```text
            ┌──────────────────────────────────────────────┐
            │                   Nodes                       │
            │   (transform, props, events) — never touch    │
            │   a 2D context, a picking algorithm, or JSON   │
            └───────┬───────────┬───────────┬──────────┬────┘
                    │           │           │          │
              drawOps()   containsPoint  toObject   ClassRegistry
                    │           │           │          │
              ┌─────▼────┐ ┌────▼─────┐ ┌───▼────┐ ┌───▼─────────┐
              │ Renderer │ │HitTester │ │Command │ │ plugin types │
              │  seam    │ │  seam    │ │ + JSON │ │  (out of core)│
              └──────────┘ └──────────┘ └────────┘ └──────────────┘
```

| Seam | Interface | Default | Why it exists |
| --- | --- | --- | --- |
| **Rendering** | `Renderer` | `Canvas2DRenderer` | Nodes emit backend-neutral `DrawOp[]`; a WebGL/WebGPU/Offscreen backend can drop in with no node changes. |
| **Hit-testing** | `HitTester` | `GeometricHitTester` | Geometric picking today; a quadtree or pixel-perfect tester can replace it for huge scenes. |
| **Persistence** | `Command` + `ClassRegistry` | built-in commands | Undo/redo and versioned save formats are part of the engine, not a bolt-on. The op-log is the seam for future real-time collaboration. |
| **Extensibility** | `ClassRegistry` / `ControlDef` | core shapes + handles | Custom node types and custom transform handles register from outside — annotation primitives live in a plugin, never in core. |

### 1. The renderer seam

A node's job is to describe *what* to draw, not *how*. Each shape implements `drawOps()` returning
a small array of backend-neutral primitives (`RectOp`, `EllipseOp`, `PolygonOp`, `ImageOp`,
`TextOp`). The `Canvas2DRenderer` is the only backend today, but because no node ever calls
`ctx.fillRect`, swapping in a GPU backend is a contained change.

### 2. The hit-testing seam

Picking goes through the `HitTester` interface. `GeometricHitTester` does a reverse-z traversal
with a world-AABB prefilter, then asks each candidate shape `containsPoint`. Tolerance is
**zoom-invariant** — a 5px grab stays 5px at any zoom — which is the behaviour an editor needs and
a naive implementation gets wrong.

### 3. Commands and serialization from day one

Every meaningful mutation is a reversible, serializable `Command`. That is why undo/redo "just
works", why a selection drag is one undoable transaction, and why scenes round-trip through
versioned JSON via a `ClassRegistry` and `MigrationRunner`. Retrofitting undo onto a mutable engine
is notoriously painful; doing it on day one keeps the whole API honest.

### 4. A hard plugin boundary

The core knows about rectangles and circles — never about bounding boxes or keypoints. Annotation
concepts are added through the seams above (`ClassRegistry` for new node types, `ControlDef` for new
handles, `HitTester`/`Renderer` if needed) in a separate `@veyrajs/annotations` package. The proof
of a clean boundary is adding an annotation primitive with **zero changes to `@veyrajs/core`**.

## Conventions (locked)

These are fixed across the engine; every page assumes them.

- **Mutable OOP scene graph.** Real classes you mutate (`rect.x = 10`) with **guarded setters** —
  assigning an unchanged value is a no-op, which is what makes the framework adapters loop-safe.
- **One transform primitive.** Everything is a single affine `Matrix` (2×3). Local → world → screen
  are all matrix products; there is no second code path.
- **Coordinates:** **top-left origin, y-down, rotation in degrees clockwise** — matching the
  Canvas/DOM convention so what you read matches what you see.
- **Pivot via offset.** `offsetX`/`offsetY` move a node's transform origin, so rotation and scale
  happen around any local point (matching Konva's transform order).
- **History is day-1.** Undo/redo is assumed everywhere, not opt-in.
- **Scale target:** one large image plus *hundreds* of vector shapes at 60fps — the engine is tuned
  for editable vector scenes, not for tens of thousands of GPU sprites.

## The composition rule that holds it together

World transforms read top-down because matrix multiplication is defined "apply the right operand
first":

```text
worldMatrix = parentWorld.multiply(localMatrix)   // local first, then up through ancestors
```

If that convention were flipped, every coordinate conversion in the engine would be silently
wrong — which is why `Matrix` has a dedicated test suite. See
[Scene Graph & Transforms](/Veyrajs/concepts/scene-graph/) for how this powers lazy,
version-counted world matrices.

## Non-goals

- **Not a game engine** — no physics, no sprite-sheet animation system, no scene-wide tween
  timeline. Animate with the frame loop (`requestAnimationFrame`) and mutate nodes directly.
- **Not a chart library** — no axes, scales, or marks; build those on top.
- **Not WebGL-first** — Canvas 2D is the MVP backend. If you need tens of thousands of sprites at
  GPU throughput, a WebGL-first engine may suit better; Veyrajs optimises for *editable* scenes.

Next: [Core Concepts → Scene Graph & Transforms](/Veyrajs/concepts/scene-graph/)
