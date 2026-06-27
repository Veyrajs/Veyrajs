---
title: Custom Hit-Testers
description: Implement the HitTester seam — a spatial-index sketch that delegates precise tests to shapes, plus the zoom-invariant tolerance math you must preserve.
sidebar:
  order: 2
---

A [`HitTester`](/Veyrajs/api/hit-testing/) resolves a world point to the topmost node under it. The
strategy is pluggable; the default `GeometricHitTester` is a reverse-z tree walk with an AABB
broad-phase and a precise per-shape test. Inject an alternative with `new Stage({ hitTester })`; the
`Stage` drives it through `stage.hitTest` / `getIntersection`, computing and passing
`pixelSize = 1 / camera.zoom`.

## The interface

```ts
interface HitTester {
  hitTest(
    root: Node,
    worldPoint: Vec2,
    pixelSize: number,
    options?: HitTestOptions,
  ): HitResult | null
}

interface HitResult { node: Node; type: HitType; worldPoint: Vec2; localPoint: Vec2; vertexIndex?: number }
type HitType = 'fill' | 'stroke' | 'bounds' | 'vertex'
```

Return the first (topmost) hit or `null`. `options` carries `tolerance`, `fill`, `stroke`, `bounds`,
`vertices`, `deep`, and a `match` predicate — see the [Hit-Testing API](/Veyrajs/api/hit-testing/).

## pixelSize and zoom-invariant tolerance

`options.tolerance` is a grab radius in **screen pixels**. To keep it zoom-invariant a tester must
convert it in two steps:

```ts
const worldTolerance = (options.tolerance ?? 0) * pixelSize          // screen px → world units
const localTolerance = worldTolerance / Math.sqrt(Math.abs(world.determinant()) || 1) // → local
```

`pixelSize` is `1 / camera.zoom` (world units per screen pixel), supplied by the `Stage`; dividing by
the square root of the world-matrix determinant removes the shape's own scale. The effect is that a
"6 px grab" stays 6 px at any zoom — the behaviour an editor needs, and the one a naïve tester gets
wrong.

## Reuse the precise per-shape test

Whatever broad phase you use, the precise test should stay the shape's own `hitTest` — the geometry
lives in the shapes, not the tester. This helper mirrors what `GeometricHitTester` does per shape:

```ts
import { Shape } from '@veyrajs/core'
import type { HitResult, HitTestOptions, Vec2 } from '@veyrajs/core'

function testShape(
  shape: Shape,
  worldPoint: Vec2,
  pixelSize: number,
  options: HitTestOptions,
): HitResult | null {
  const worldTolerance = (options.tolerance ?? 0) * pixelSize

  // Broad phase: skip the shape if its (expanded) world AABB misses the point.
  if (!shape.getWorldBounds().expand(worldTolerance).contains(worldPoint)) return null

  // Convert the point + tolerance into the shape's LOCAL space.
  const world = shape.worldMatrix()
  const scale = Math.sqrt(Math.abs(world.determinant())) || 1
  const localTolerance = worldTolerance / scale
  const local = world.invert().applyToPoint(worldPoint)

  const kind = shape.hitTest(local, {
    tolerance: localTolerance,
    fill: options.fill ?? true,
    stroke: options.stroke ?? true,
  })
  return kind === null ? null : { node: shape, type: kind, worldPoint, localPoint: local }
}
```

The default also handles `vertices` (against `shape.getVertices()`), the `bounds` fallback, and the
`match` predicate — add them the same way if you need those result types.

## A spatial-index tester

`GeometricHitTester` is O(n) over candidates, with the AABB prefilter keeping the constant tiny — the
right default. For very large, mostly-static scenes you can swap in a spatial index (uniform grid,
quadtree, R-tree) so a query touches only nearby shapes. The tester owns the index and keeps it in
sync as the scene changes; on a query it asks the index for candidates and delegates the precise test
to the helper above:

```ts
import { Shape } from '@veyrajs/core'
import type { HitResult, HitTestOptions, HitTester, Node, Vec2 } from '@veyrajs/core'

class SpatialHitTester implements HitTester {
  // Your own grid/quadtree of Shapes, keyed by `shape.getWorldBounds()`. `query` returns the
  // shapes whose world AABB overlaps the point, ordered topmost-first (reverse paint order).
  private index = new SpatialIndex()

  // Keep the index in sync as the scene changes (add / remove / transform).
  insert(shape: Shape): void { this.index.insert(shape) }
  remove(shape: Shape): void { this.index.remove(shape) }
  refresh(shape: Shape): void { this.index.update(shape) }

  hitTest(
    root: Node,
    worldPoint: Vec2,
    pixelSize: number,
    options: HitTestOptions = {},
  ): HitResult | null {
    for (const shape of this.index.query(worldPoint)) {
      if (!shape.visible || !shape.listening) continue
      if (options.match && !options.match(shape)) continue
      const hit = testShape(shape, worldPoint, pixelSize, options)
      if (hit !== null) return hit // first (topmost) hit wins
    }
    return null
  }
}
```

`SpatialIndex` is your data structure, not part of core — the seam only requires the `hitTest` method.
Keeping the index correct on every move/add/remove is the real cost, which is why the geometric
default is the better choice until profiling says otherwise.

Inject it on the stage:

```ts
const tester = new SpatialHitTester()
const stage = new Stage({ container: el, hitTester: tester })
```

## Wrapping the default

If you only want to *adjust* behaviour — force a `match`, log misses, special-case a layer — compose
the default instead of reimplementing the math:

```ts
import { GeometricHitTester } from '@veyrajs/core'
import type { HitResult, HitTestOptions, HitTester, Node, Vec2 } from '@veyrajs/core'

class LoggingHitTester implements HitTester {
  private inner = new GeometricHitTester()

  hitTest(root: Node, worldPoint: Vec2, pixelSize: number, options?: HitTestOptions): HitResult | null {
    const hit = this.inner.hitTest(root, worldPoint, pixelSize, options)
    if (hit === null) console.debug('miss at', worldPoint)
    return hit
  }
}
```

## Related

- [Hit-Testing (concept)](/Veyrajs/concepts/hit-testing/)
- [Hit-Testing API](/Veyrajs/api/hit-testing/) — `HitTester`, `HitResult`, `HitTestOptions`.
- [Math API](/Veyrajs/api/math/) — `Matrix.invert` / `determinant`, `Bounds.expand` / `contains`.
- [Custom Renderers](/Veyrajs/advanced/custom-renderers/) — the other Stage-level seam.
