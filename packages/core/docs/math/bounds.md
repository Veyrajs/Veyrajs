# `src/math/bounds.ts` — Axis-aligned bounding box

> An immutable AABB with union and matrix-transform helpers.

## Purpose

`Bounds` describes the extent of geometry as an axis-aligned rectangle `{ x, y, width,
height }`. It backs the scene graph's local/world bounds and will be the cheap broad-phase
filter before precise hit-testing (Phase 6).

## Exports

- `class Bounds` with readonly `x, y, width, height` and:
  - **Factories:** `Bounds.empty()`, `Bounds.fromRect(x, y, w, h)`,
    `Bounds.fromPoints(points)`.
  - **Derived:** `right`, `bottom`, `isEmpty`, `corners()`.
  - **Queries:** `contains(point)`, `intersects(other)`.
  - **Combinators:** `union(other)`, `expand(amount)`, `transform(matrix)`.

## How it works

- **`fromPoints`** computes the tight AABB over a point set (one pass for min/max).
- **`transform(m)`** maps the box's four corners through a matrix and returns the AABB of
  the results. This is how a *local* bounds becomes a *world* bounds: rotate a rectangle
  and you get a larger axis-aligned box that still contains it.
- **`union`** treats an **empty** box as the identity element, so accumulating child
  bounds is a clean fold:

  ```ts
  let b = Bounds.empty()
  for (const child of children) b = b.union(child.getLocalBounds().transform(child.localMatrix()))
  ```

## Conventions & gotchas

- **"Empty" is the sentinel only** (negative extent — `Bounds.empty()` / `fromPoints([])`).
  A degenerate-but-real box (e.g. a horizontal line, `height 0`) is **not** empty and
  participates in `union`/`expand`/`transform`. `union` returns the other operand by
  reference when one side is empty (so `a.union(empty) === a`).
- **Immutable.** Every method returns a new `Bounds`.
- `contains` is **inclusive of the edges** (a point exactly on the right/bottom edge counts
  as inside).
- `transform` returns an *axis-aligned* box — after rotation it is generally **looser**
  than the true oriented bounds. That's the right trade-off for a fast broad-phase filter;
  precise hit-testing refines it later.

## Relationships

- **Uses:** [`Vec2`](./vec2.md), [`Matrix`](./matrix.md).
- **Used by:** [`scene/node.ts`](../scene/node.md) (`getWorldBounds`),
  [`scene/container.ts`](../scene/container.md) (`getLocalBounds` union over children),
  [`scene/shape.ts`](../scene/shape.md) (concrete shapes return local bounds).

## Example

```ts
import { Bounds, Matrix } from '@veyrajs/core'

Bounds.fromRect(0, 0, 10, 20).transform(Matrix.rotation(90))
// → Bounds { x: -20, y: 0, width: 20, height: 10 }
```
