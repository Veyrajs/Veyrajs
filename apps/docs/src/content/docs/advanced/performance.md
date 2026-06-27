---
title: Performance
description: How Veyrajs stays at 60fps — coalesced redraws, lazy transforms, culling with visible/listening, few layers, a spatial-index hit-tester, and measuring with a counting renderer.
sidebar:
  order: 4
---

Veyrajs is built around one scale target: **one large background image plus hundreds of vector
shapes at 60fps**. Most of the work to hit that target is already done for you by the engine's
design — coalesced frames, guarded setters, and lazy world transforms. The job of this page is to
show you the levers that matter, the ones that don't, and how to measure before you tune.

## Let the frame scheduler coalesce — never call `render()`

The single most important rule: **you don't call `render()`**. A mutation flags the node dirty,
which walks to the root [`Stage`](/Veyrajs/api/scene/) and asks the
[`FrameScheduler`](/Veyrajs/api/utilities/) for a frame. The scheduler collapses *any number* of
invalidations in a frame into **one** `requestAnimationFrame` callback — further requests while one
is pending are no-ops. Mutate freely; exactly one frame is rendered:

```ts
rect.x = 60
rect.y = 80
rect.fill = '#f472b6'   // three mutations …
// … exactly one frame is rendered on the next animation frame
```

`Stage.render()` *is* synchronous and public, but it's there for explicit/test needs.
`requestRender()` is the normal path, and it's already what every mutation triggers — calling
`render()` yourself in app code (especially in a loop) defeats the coalescing and is the most common
self-inflicted performance bug.

## Redundant work is already free

Two engine behaviours mean you rarely need to hand-optimise your update code:

- **Guarded setters.** Assigning a property its current value is a no-op (`if (v !== this._x)`), so
  it never marks anything dirty or schedules a frame. This is what makes the framework adapters
  loop-safe: re-applying the same props every render cycle costs nothing. You don't need to diff
  props before assigning them.
- **Lazy, version-counted world transforms.** A node's `worldMatrix()` is cached against a version
  counter. Changing one node **never eagerly walks its subtree** — a descendant recomputes only when
  its own transform changes or an ancestor's world matrix actually moved. Bounds
  (`getLocalBounds` / `getWorldBounds`) are cached the same way. Moving a parent of 10,000 children
  doesn't touch those children until something reads their world matrix.

The practical takeaway: prefer plain mutation. The cost model rewards it.

## Cull with `visible` and `listening`

The cheapest node is one the engine skips. Two flags do that, and they are **not** symmetric:

| Flag | Rendering | Hit-testing |
| --- | --- | --- |
| `visible = false` | skipped (Stage only walks **visible** shapes) | subtree skipped entirely |
| `listening = false` | **not** affected — still drawn | subtree skipped entirely |

```ts
// A backdrop that's drawn but never picked — skip it in every hit-test:
backgroundImage.listening = false

// An off-screen / toggled-off subtree — skip it in both passes:
hiddenPanel.visible = false
```

Set `listening = false` on large decorative or static content (a background image, a grid) so the
[hit-tester](/Veyrajs/concepts/hit-testing/) prunes whole subtrees up front. Set `visible = false`
on anything currently off-screen or toggled off — it's removed from both the render walk and
hit-testing without detaching it from the tree.

## Keep layers few

A [`Layer`](/Veyrajs/api/scene/) is a top-level **render partition**, not the grouping mechanism.
In the MVP every layer renders to the stage's single canvas in order — layers are *logical*, so a
dozen of them buys you nothing and adds traversal overhead. Use a **`Group`** for logical grouping
anywhere in the tree (transform it and its children follow); reach for a `Layer` only when you
genuinely need a coarse top-level partition. (Konva's per-layer canvas memory ceiling is the
cautionary tale this design avoids.) See
[Scene Graph & Transforms](/Veyrajs/concepts/scene-graph/).

## Scale hit-testing with a spatial index

The default [`GeometricHitTester`](/Veyrajs/api/hit-testing/) is geometric, not a colour-pick
buffer. It does a top-down reverse-z walk with an **AABB broad-phase** (skip any shape whose
world bounding box, expanded by the tolerance, doesn't contain the point) and a precise per-shape
test, with **zoom-invariant tolerance** (a "5 px grab" stays 5 px at any zoom). That broad-phase
keeps the constant small, but it's still **O(n)** over candidate nodes.

For very large scenes the broad-phase is exactly the step a spatial index replaces. The
[`HitTester`](/Veyrajs/api/hit-testing/) is a seam — inject your own behind the same interface:

```ts
new Stage({ container, hitTester: new MyQuadtreeHitTester() })
```

Don't reach for this until a profile says hit-testing is your bottleneck; for hundreds-to-low-thousands
of shapes the AABB prefilter is plenty. See
[Custom Hit-Testers](/Veyrajs/advanced/custom-hit-testers/).

## Control device-pixel cost

The [`Canvas2DRenderer`](/Veyrajs/api/rendering/) sizes its backing store to `w·dpr × h·dpr`
**device pixels** while the CSS size stays `w × h`. That's what keeps rendering crisp on high-DPI
screens — but it means a `2×` display rasterizes **four times** the pixels per frame. Rasterization
cost (clearing, large fills, the background image) scales with device-pixel *area*, not shape count.

If a profile shows you're fill/raster-bound rather than scene-graph-bound, capping the pixel ratio
is a direct lever — at the cost of sharpness:

```ts
stage.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
// or pass `pixelRatio` in StageOptions up front
```

DPR is applied **only** inside the renderer, so this never leaks into your scene math.

## Measure with a counting renderer

Before tuning, separate the two costs that make up a frame: the **scene-graph work** (tree
traversal + `view · world` matrix composition + draw-op allocation) and the **rasterization** the
canvas/GPU does. The benchmarks app isolates the first with a *counting renderer* — a
[`Renderer`](/Veyrajs/api/rendering/) that does the engine-side per-node work (it pulls each node's
`drawOps()`) but performs **no** rasterization:

```ts
import type { FrameInfo, Matrix, Renderable, Renderer } from '@veyrajs/core'

class CountingRenderer implements Renderer {
  nodeCount = 0
  opCount = 0
  setSize(): void {}
  begin(_frame: FrameInfo): void {
    this.nodeCount = 0
    this.opCount = 0
  }
  renderNode(node: Renderable, _world: Matrix): void {
    this.nodeCount += 1
    this.opCount += node.drawOps().length
  }
  end(): void {}
  destroy(): void {}
}

const renderer = new CountingRenderer()
const stage = new Stage({ container, width: 1920, height: 1080, renderer })
// drive frames with stage.render() and read renderer.nodeCount / renderer.opCount
```

Because the [`Renderer`](/Veyrajs/concepts/rendering/) is a pure consumer injected via
`new Stage({ renderer })`, swapping it changes nothing else. If frame time is high but the counting
renderer is fast, you're rasterization-bound (look at DPR, fill area, the image) — if the counting
renderer itself is slow, you're scene-graph-bound (look at node count, dirtying patterns, and
whether you're re-dirtying everything each frame). The repo's `@veyrajs/benchmarks` app pairs this
with an on-canvas FPS harness that steps the shape count from 100 to 10k so you can watch where
60fps breaks.

## What's MVP vs. reserved

Be honest about which optimisations exist today and which the architecture only *reserves*:

- **Shipped:** coalesced frames, guarded setters, lazy/version-counted world matrices and bounds,
  geometric hit-testing with an AABB broad-phase, and the single-canvas immediate-mode
  `Canvas2DRenderer`. The renderer draws each node immediately under its world transform; `end()` is
  a no-op (there's no batching/flush phase yet).
- **Reserved behind the `Renderer` seam:** a **WebGL/WebGPU backend** (the `scene → render → math`
  dependency points one way, so a backend swap needs *zero* node changes) and **per-layer offscreen
  canvas caching** — a planned, opt-in optimisation that would let an unchanged layer skip
  re-rasterization. Today layers do not cache; they render in order to the one canvas. See
  [Custom Renderers](/Veyrajs/advanced/custom-renderers/).
- **Reserved behind the `HitTester` seam:** a spatial-index tester for huge scenes. The default is
  `GeometricHitTester`; anything faster is something you inject.

Don't write code today that assumes layer caching or a GPU backend — but do know the seams are there
when those land.

## Related

- [Rendering & the Frame Loop (concept)](/Veyrajs/concepts/rendering/)
- [Scene Graph & Transforms (concept)](/Veyrajs/concepts/scene-graph/)
- [Hit-Testing (concept)](/Veyrajs/concepts/hit-testing/)
- [Rendering API](/Veyrajs/api/rendering/) and [Utilities (FrameScheduler)](/Veyrajs/api/utilities/)
- [Custom Renderers](/Veyrajs/advanced/custom-renderers/) and [Custom Hit-Testers](/Veyrajs/advanced/custom-hit-testers/)
