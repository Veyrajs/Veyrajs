---
title: Hit-Testing
description: The HitTester contract, its options and result types, and the default GeometricHitTester.
sidebar:
  order: 8
---

Hit-testing resolves a world point to the topmost node under it. The strategy is pluggable
behind the [`HitTester`](#hittester) interface; the default is
[`GeometricHitTester`](#geometrichittester). It is driven by `Stage.hitTest` /
`getIntersection`, which inject `new Stage({ hitTester })`.

## `HitTester`

```ts
interface HitTester {
  hitTest(
    root: Node,
    worldPoint: Vec2,
    pixelSize: number,        // world units per screen pixel = 1 / camera.zoom
    options?: HitTestOptions,
  ): HitResult | null
}
```

`pixelSize` is what makes the grab radius zoom-invariant: the tester uses it to convert the
screen-pixel `tolerance` into world (then local) units. The `Stage` computes and passes it.

## `HitType`

```ts
type HitType = 'fill' | 'stroke' | 'bounds' | 'vertex'
```

Tells you *what* was hit, which higher layers use to decide behaviour — e.g. a `'vertex'`
hit starts a corner drag, a `'fill'` hit selects the shape.

## `HitTestOptions`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `tolerance` | `number` | `0` | Extra grab radius in **screen pixels** (zoom-invariant). |
| `fill` | `boolean` | `true` | Test shape interiors. |
| `stroke` | `boolean` | `true` | Test shape outlines. |
| `bounds` | `boolean` | `false` | Also test bounding boxes (yields `'bounds'`). |
| `vertices` | `boolean` | `false` | Also test shape corners/points (yields `'vertex'`). |
| `deep` | `boolean` | `true` | Descend into containers. |
| `match` | `(node: Node) => boolean` | — | Accept only matching nodes. |

**Tolerance units differ by layer.** At the `Stage` / `HitTester` API it is screen pixels;
inside a shape's own `hitTest` the (already-converted) tolerance is in *local* units.

## `HitResult`

```ts
interface HitResult {
  node: Node
  type: HitType
  worldPoint: Vec2
  localPoint: Vec2
  vertexIndex?: number   // set for 'vertex' hits
}
```

```ts
stage.hitTest({ x, y }, { tolerance: 6, vertices: true })
// → { node, type: 'vertex', vertexIndex: 2, ... } | { type: 'fill', ... } | null
```

## `GeometricHitTester`

```ts
class GeometricHitTester implements HitTester
```

The default tester: a top-down reverse-z walk with an AABB broad-phase and a precise
per-shape test. It walks the tree **depth-first, children last-to-first** (so the
topmost-drawn shape is tested first) and returns the first hit. Per shape:

1. **Broad phase** — skip unless the shape's world AABB (expanded by the world-space tolerance)
   contains the point.
2. **To local space** — `localTolerance = worldTolerance / √|det(worldMatrix)|`, then invert
   the world matrix to get the local point.
3. **Vertices** (if requested) — return a `'vertex'` hit (with `vertexIndex`) when within
   tolerance of a `getVertices()` entry.
4. **Fill/stroke** — call `shape.hitTest(local, { tolerance, fill, stroke })`; a non-null
   result becomes a `'fill'`/`'stroke'` hit.
5. **Bounds** (if requested) — fall back to a `'bounds'` hit inside the expanded local bounds.

A `match` predicate, if provided, gates every result. **First hit wins** (topmost, reverse
z-order). `deep: false` stops the walk at the top level; non-visible / non-listening subtrees
are skipped entirely.

```ts
const tester = new GeometricHitTester()
tester.hitTest(stage, { x: 100, y: 5 }, 1 / camera.zoom, { tolerance: 6 })
```

## Related

- [Hit-Testing (concept)](/Veyrajs/concepts/hit-testing/)
- [Events (API)](/Veyrajs/api/events/)
