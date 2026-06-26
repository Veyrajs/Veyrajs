# `src/__tests__/**` — Test strategy & helpers

> How the core is tested, and the two test-only helpers that make it possible.

## Purpose

The core's correctness lives in its math and its graph/transform/render wiring — exactly
the kind of logic that fails silently. The test suite (Vitest, `happy-dom` environment)
locks down those guarantees so later phases can build with confidence.

## Layout

```
__tests__/
├─ helpers/
│  ├─ mock-renderer.ts   # a Renderer that records calls instead of drawing
│  └─ test-rect.ts       # a minimal concrete Shape (until Phase 3 ships real shapes)
├─ math/
│  ├─ matrix.test.ts     # affine algebra, composition order, invert, pivot
│  └─ bounds.test.ts     # AABB, union (empty identity), matrix transform
├─ scene/
│  ├─ scene-graph.test.ts  # add/remove/re-parent, cycles, z-order, traversal, bounds
│  ├─ transform.test.ts    # local/world matrices, lazy+versioned cache, reparent
│  └─ stage-render.test.ts # render lifecycle, z-order, visible/opacity skip, setSize
├─ scheduler.test.ts     # rAF coalescing (fake timers)
└─ smoke.test.ts         # Stage mounts/tears down a real canvas
```

## Helpers

### `MockRenderer`

Implements [`Renderer`](./render/renderer.md) but **records** lifecycle calls instead of
drawing: `beginCount`/`endCount`, the `size` from `setSize`, the `frames`, and a `calls`
array of `{ node, world }` (reset each `begin`). Tests assert on draw **order**, the
**world matrices** passed in, and which nodes were skipped — all without a real canvas.
This helper is also the living proof of the renderer abstraction: the `Stage` drives it
identically to `Canvas2DRenderer`.

### `TestRect`

A minimal concrete [`Shape`](./scene/shape.md) (`getLocalBounds` from `width/height`, a
`rect` `drawOps`, an AABB `containsPoint`). It stands in for real shapes (Phase 3) so the
scene-graph, transform, and render tests have something concrete to exercise.

## Notable techniques

- **Headless rendering.** Tests run under `happy-dom`; `Canvas2DRenderer` tolerates a null
  2D context, and `MockRenderer` needs no DOM at all. The smoke test still verifies a real
  `<canvas>` is mounted into and removed from the container.
- **Deterministic ids.** `resetIdCounter()` (from [`id.ts`](./id.md)) is called in
  `beforeEach` where ids matter, keeping assertions stable.
- **Fake-timer frames.** `scheduler.test.ts` uses
  `vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })` and
  `vi.runAllTimers()` to fire frames deterministically and prove coalescing.

## What the suite guarantees (as of Phase 2)

- Matrix algebra and the **composition convention** (`A·B` = apply B then A; clockwise
  degrees; pivot offset).
- `Bounds` AABB math, union with empty identity, and matrix transform.
- Scene-graph integrity: re-parenting, cycle rejection, z-order, DFS traversal, bounds
  union.
- **Lazy, version-counted world transforms**: a sibling change does *not* recompute a node;
  an ancestor change or reparent *does*.
- **Render lifecycle**: one render on construction, correct depth-first z-order, skipping
  invisible/transparent nodes, correct world matrix per node, `setSize` propagation.
- **Scheduler** coalescing, cancel, and re-arm.

Run with `pnpm --filter @veyrajs/core test` (or `pnpm test` for the whole monorepo).

## Future / not yet

- Per-shape geometry/hit tests (Phase 3/6), event dispatch (Phase 5), controls (Phase 7),
  serialization round-trips + migrations (Phase 8), and Playwright visual regression all
  extend this suite. See the architecture plan's testing section.
