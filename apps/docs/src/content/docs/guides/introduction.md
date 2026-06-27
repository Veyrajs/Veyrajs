---
title: Introduction
description: What Veyrajs is, what it is for, and how it is put together.
---

**Veyrajs** is a framework-agnostic, TypeScript-first **2D canvas engine** — the same category
as Konva, Fabric, Paper.js, or EaselJS. It gives you a typed, mutable retained-mode scene graph
with a renderer abstraction, a camera, federated events, geometric hit-testing, data-driven
transform controls, versioned serialization, and a day-one command/undo layer.

You can use it **imperatively** (`new Stage(...)`, `layer.add(rect)`), or **declaratively**
through first-class adapters for **Vue, React, Svelte, and Angular** — over the *same* engine,
with zero framework code in the core.

## Why Veyrajs

Most canvas libraries make you bolt on undo, serialization, and a coordinate system yourself —
and lock you into one UI framework (or none). Veyrajs treats those as part of the engine:

- **Typed mutable scene graph** — `Stage → Layer → Group/Shape → Node`. Real classes you mutate
  (`rect.x = 10`), with guarded setters, lazy **version-counted** world transforms, and typed
  config objects instead of a stringly-typed attribute bag.
- **Renderer abstraction** — nodes emit backend-neutral `DrawOp[]`; the `Canvas2DRenderer` is the
  MVP backend, but no node ever touches a raw 2D context, reserving a WebGL/WebGPU/Offscreen seam.
- **Camera & coordinate spaces** — explicit *screen / world / local* spaces, all through one
  affine `Matrix`. Zoom-about-cursor, pan, and one `devicePixelRatio` source of truth.
- **Federated events** — DOM-style **capture → target → bubble** with `stopPropagation`, plus
  derived `click` / `dblclick` / `dragstart|move|end` / `pointerenter|leave` / `wheel`.
- **Geometric hit-testing** — reverse-z traversal with a world-AABB prefilter and **zoom-invariant
  tolerance** (a "5px grab" stays 5px at any zoom). The `HitTester` interface is a swap-in seam.
- **Selection & controls** — `SelectionManager` (single + multi) and a data-driven
  `SelectionController`: bounds box, resize handles, rotation, custom cursors — drags emit
  undoable commands.
- **Versioned serialization** — `toObject` / `fromObject` round-trips through a `ClassRegistry`,
  with a schema `version` and a `MigrationRunner` so scenes saved today survive future changes.
- **Command / undo from day one** — every meaningful mutation is a reversible, serializable
  `Command`; `History` gives you undo/redo, and the op-log is the seam for future collaboration.
- **Zero runtime dependencies in core** — the math and geometry are written in-house.

## When to use it

Veyrajs is a good fit when you need an **interactive, mutable** 2D canvas with selection,
transforms, undo, and save/load — across any (or no) framework:

- Annotation tools (bounding boxes, polygons, keypoints, masks)
- Design & diagramming editors, whiteboards, floor planners
- Data-visualisation surfaces that users pan, zoom, and edit
- Any app that would otherwise reinvent a scene graph + undo + serialization

It is **not** a game engine or a chart library — there is no physics, no built-in tween timeline
(animate with the frame loop), and no high-level chart API. For pure GPU sprite throughput a
WebGL-first engine like PixiJS may suit better; Veyrajs optimises for *editable* vector scenes
over one large image.

## The shape of the engine

```text
Stage                      // owns the host element, camera, renderer, events
 └─ Layer                  // a render partition
     └─ Group / Shape      // containers and drawables
         └─ Node           // the base: transform, parent, events, serialization
```

A deliberately un-clever Canvas-2D retained-mode scene graph, with four pieces of disciplined
future-proofing that are cheap now and expensive later:

1. **A renderer seam** — nodes emit `DrawOp[]`, never raw 2D calls.
2. **A hit-tester seam** — geometric by default, swappable for quadtree/pixel-perfect.
3. **A day-one command/serialization layer** — undo/redo and versioned save formats.
4. **A hard plugin boundary** — every annotation concept stays out of core.

> **Status.** The core engine (MVP) is complete, all four framework adapters are shipped, and
> micro + FPS benchmarks are in place. Annotation primitives (bounding boxes, polygons, masks) are
> intentionally deferred to an `@veyrajs/annotations` plugin built entirely against the seams
> above — the proof that the boundary holds.

## Where to go next

- [Installation](/Veyrajs/guides/installation/) — add the engine (and an adapter) to your project.
- [Getting Started](/Veyrajs/guides/getting-started/) — build your first scene in a few lines.
- [Design Philosophy](/Veyrajs/guides/design-philosophy/) — the seams, conventions, and trade-offs.
- [Core Concepts](/Veyrajs/concepts/scene-graph/) — the scene graph, rendering, events, and more.
- [Framework Adapters](/Veyrajs/adapters/overview/) — Vue, React, Svelte, and Angular.
