# `src/math/matrix.ts` — 2×3 affine transform

> The single transform primitive the entire engine is built on. Read this first.

## Purpose

`Matrix` represents an affine transform (translate, scale, rotate, skew, and their
compositions). **Every** coordinate conversion in the engine — local→world, and later
world→screen (camera) and hit-testing — goes through it.

## The storage layout

A `Matrix` is immutable and stored in the **Canvas-native** `[a, b, c, d, e, f]` form:

```
| a c e |        x' = a·x + c·y + e
| b d f |        y' = b·x + d·y + f
| 0 0 1 |
```

`a, b, c, d` are the linear (rotate/scale/skew) part; `e, f` are the translation. This is
exactly the order `CanvasRenderingContext2D.setTransform(a, b, c, d, e, f)` expects, so a
matrix can be handed to the canvas directly.

## The composition rule (load-bearing)

> `A.multiply(B)` returns the product `A · B`, which means **"apply B first, then A."**

That single rule is why world transforms read naturally:

```
worldMatrix = parentWorld.multiply(localMatrix)   // local first, then up through ancestors
```

If this convention were flipped, every coordinate conversion in the engine would be
silently wrong — which is why it has a dedicated test suite.

## Exports

- `class Matrix` with readonly fields `a, b, c, d, e, f` and methods:
  - **Constructors / factories:** `new Matrix(...)`, `Matrix.identity()`,
    `Matrix.translation(x, y)`, `Matrix.scaling(sx, sy)`, `Matrix.rotation(deg)`,
    `Matrix.skewing(skewX, skewY)`, `Matrix.fromArray([a..f])`.
  - **`Matrix.compose(components)`** — build a local transform from
    `{ x, y, rotation, scaleX, scaleY, skewX, skewY, offsetX, offsetY }`.
  - **Operations:** `multiply(o)`, `translate/scale/rotate`, `determinant()`, `invert()`,
    `applyToPoint(p)`, `equals(o, epsilon?)`, `toArray()`.
- `interface MatrixComponents` — the input shape for `compose`.

## How `compose` works

`compose` applies factors in this fixed order:

```
T(x, y) · R(rotation) · Skew(skewX, skewY) · S(scaleX, scaleY) · T(-offsetX, -offsetY)
```

The trailing `T(-offset)` makes `offsetX/offsetY` behave as a **pivot**: rotation and
scale happen around that local point. (Matches Konva's transform order.)

## Conventions & gotchas

- **Immutable.** Every method returns a *new* `Matrix`; instances are never mutated. This
  makes the world-matrix cache safe to hand out by reference.
- **Angles are degrees, clockwise.** `rotation(90)` maps `+x` to `+y` in the y-down screen
  space. Skew factors are shear factors, **not** angles.
- **`invert()` throws on singular matrices** (determinant `0`, e.g. a zero scale). Callers
  doing screen↔world conversions can rely on a clear error rather than `NaN` soup.
- **Equality uses an epsilon.** Float composition accumulates error; `equals(o, 1e-9)` is
  the idiom (the world-matrix cache uses exact `equals` only to detect "did it change").

## Relationships

- **Uses:** [`Vec2`](./vec2.md) (`applyToPoint`).
- **Used by:** [`scene/node.ts`](../scene/node.md) (local & world matrices),
  [`math/bounds.ts`](./bounds.md) (`Bounds.transform`),
  [`render/canvas2d-renderer.ts`](../render/canvas2d-renderer.md) (combined DPR·world
  transform). The camera (Phase 4) and hit-testing (Phase 6) will also use it.

## Example

```ts
import { Matrix } from '@veyrajs/core'

// scale by 2, then translate by (10, 0)
const m = Matrix.translation(10, 0).multiply(Matrix.scaling(2, 2))
m.applyToPoint({ x: 1, y: 1 }) // { x: 12, y: 2 }

m.multiply(m.invert()).equals(Matrix.identity(), 1e-9) // true
```
