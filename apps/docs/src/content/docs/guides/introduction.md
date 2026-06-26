---
title: Introduction
description: What Veyrajs is, what it is for, and how it is put together.
---

**Veyrajs** is a framework-agnostic, TypeScript-first **2D canvas engine** — the same category
as Konva, Fabric, Paper.js, or EaselJS. It gives you a typed, mutable retained-mode scene graph
with a renderer abstraction, a camera, federated events, geometric hit-testing, data-driven
transform controls, versioned serialization, and a day-one command/undo layer.

You can use it **imperatively** (`new Stage(...)`, `layer.add(rect)`), or **declaratively**
through first-class adapters for **Vue, React, Svelte, and Angular**.

## What it is for

Veyrajs is built as a clean engine foundation first. It is designed to later host annotation
workflows (bounding boxes, polygons, keypoints, masks, …) as **optional plugins**, without
baking any annotation logic into the core. The same engine works equally well for diagramming,
design tools, data-visualisation, and interactive canvases.

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

## Where to go next

- [Getting Started](/Veyrajs/guides/getting-started/) — install and build your first scene.
- [Core Concepts](/Veyrajs/concepts/scene-graph/) — the scene graph, rendering, events, and more.
- [Adapters](/Veyrajs/adapters/overview/) — Vue, React, Svelte, and Angular.
