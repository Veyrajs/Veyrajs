---
title: Math
description: Vec2, Matrix, Bounds, and pure geometry helpers — the dependency-free bottom of the engine.
sidebar:
  order: 2
  label: Math
---

The math layer has **no dependencies** on the rest of the engine — it sits at the bottom of the
dependency graph. Every coordinate conversion (local→world, world→screen, hit-testing) goes through
`Matrix`. All values are immutable or plain objects; helpers never mutate their inputs.

```ts
import { Vec2, Matrix, Bounds, pointInPolygon, distanceToSegment, distanceToPolyline } from '@veyrajs/core'
```

## Vec2

A 2D point/vector. Deliberately a **plain object, not a class** — so it round-trips through JSON and
drops straight into draw-op payloads. All operations are free functions on the merged `Vec2` const,
never methods on the data.

```ts
interface Vec2 { x: number; y: number }
```

Pure helpers (return new objects, never mutate):

| Helper | Description |
| --- | --- |
| `Vec2.of(x, y)` | construct a `Vec2` |
| `Vec2.clone(v)` | copy |
| `Vec2.add(a, b)` | component-wise sum |
| `Vec2.sub(a, b)` | component-wise difference |
| `Vec2.scale(v, s)` | scalar multiply |
| `Vec2.dot(a, b)` | dot product |
| `Vec2.length(v)` | magnitude |
| `Vec2.distance(a, b)` | distance between two points |
| `Vec2.equals(a, b, epsilon = 0)` | tolerant float compare; default `0` is exact |

```ts
const a = Vec2.of(1, 2)
const b = Vec2.of(4, 6)
Vec2.distance(a, b) // 5
```

## Matrix

An **immutable** 2×3 affine transform (translate, scale, rotate, skew, and compositions). Stored in
the **Canvas-native** `[a, b, c, d, e, f]` form, so an instance can be handed straight to
`CanvasRenderingContext2D.setTransform(a, b, c, d, e, f)`:

```
| a c e |        x' = a·x + c·y + e
| b d f |        y' = b·x + d·y + f
| 0 0 1 |
```

`a, b, c, d` are the linear (rotate/scale/skew) part; `e, f` are the translation. Every method
returns a *new* `Matrix`; instances are never mutated.

**The composition rule (load-bearing):** `A.multiply(B)` returns `A · B`, meaning **"apply B first,
then A."** This is why world transforms read naturally:

```ts
worldMatrix = parentWorld.multiply(localMatrix) // local first, then up through ancestors
```

### Constructors & factories

| Factory | Description |
| --- | --- |
| `new Matrix(a, b, c, d, e, f)` | from raw components; readonly fields `a, b, c, d, e, f` |
| `Matrix.identity()` | identity transform |
| `Matrix.translation(x, y)` | translate |
| `Matrix.scaling(sx, sy)` | scale |
| `Matrix.rotation(deg)` | rotate (degrees, clockwise) |
| `Matrix.skewing(skewX, skewY)` | skew (shear factors, **not** angles) |
| `Matrix.fromArray([a, b, c, d, e, f])` | from a 6-element array |
| `Matrix.compose(components)` | build a local transform from a `MatrixComponents` bag |

### Operations

| Method | Description |
| --- | --- |
| `multiply(o)` | product `this · o` ("apply `o` first") |
| `translate`, `scale`, `rotate` | instance convenience composers mirroring the factories |
| `determinant()` | matrix determinant |
| `invert()` | inverse; **throws on singular matrices** (determinant `0`) |
| `applyToPoint(p)` | transform a `Vec2` |
| `equals(o, epsilon?)` | tolerant compare; `equals(o, 1e-9)` is the idiom |
| `toArray()` | back to `[a, b, c, d, e, f]` |

### MatrixComponents

The input shape for `Matrix.compose`:

```ts
interface MatrixComponents {
  x, y          // translation
  rotation      // degrees, clockwise
  scaleX, scaleY
  skewX, skewY  // shear factors
  offsetX, offsetY // pivot
}
```

`compose` applies factors in this fixed order (matches Konva):

```
T(x, y) · R(rotation) · Skew(skewX, skewY) · S(scaleX, scaleY) · T(-offsetX, -offsetY)
```

The trailing `T(-offset)` makes `offsetX/offsetY` behave as a **pivot** — rotation and scale happen
around that local point.

### Conventions & gotchas

- **Immutable** — every method returns a new instance, which makes the world-matrix cache safe to
  hand out by reference.
- **Angles are degrees, clockwise.** `rotation(90)` maps `+x` to `+y` in y-down screen space.
- **`invert()` throws on singular matrices** (e.g. a zero scale) — a clear error instead of `NaN`.
- **Equality uses an epsilon.** Float composition accumulates error; pass `1e-9` for "are these the
  same transform," reserve exact `equals` for "did it change."

```ts
// scale by 2, then translate by (10, 0)
const m = Matrix.translation(10, 0).multiply(Matrix.scaling(2, 2))
m.applyToPoint({ x: 1, y: 1 }) // { x: 12, y: 2 }

m.multiply(m.invert()).equals(Matrix.identity(), 1e-9) // true
```

## Bounds

An **immutable** axis-aligned bounding box `{ x, y, width, height }`. Backs the scene graph's
local/world bounds and the cheap broad-phase filter before precise hit-testing.

### Factories

| Factory | Description |
| --- | --- |
| `Bounds.empty()` | the empty sentinel (negative extent) |
| `Bounds.fromRect(x, y, w, h)` | from a rectangle |
| `Bounds.fromPoints(points)` | tight AABB over a point set |

### Derived & queries

| Member | Description |
| --- | --- |
| `right`, `bottom` | far edges |
| `isEmpty` | whether this is the empty sentinel |
| `corners()` | the four corner `Vec2`s |
| `contains(point)` | point inside? (**inclusive of edges**) |
| `intersects(other)` | overlap test |

### Combinators

| Method | Description |
| --- | --- |
| `union(other)` | combined box; empty acts as the identity element |
| `expand(amount)` | grow the box by `amount` on all sides |
| `transform(matrix)` | AABB of the four corners mapped through `matrix` (local→world) |

### Conventions & gotchas

- **"Empty" is the sentinel only** (`Bounds.empty()` / `fromPoints([])`). A degenerate-but-real box
  (e.g. a horizontal line, `height 0`) is **not** empty and still participates in
  `union`/`expand`/`transform`.
- `union` returns the other operand **by reference** when one side is empty, so
  `a.union(Bounds.empty()) === a` — accumulating child bounds is a clean fold.
- **Immutable** — every method returns a new `Bounds`.
- `transform` returns an *axis-aligned* box, so after rotation it is generally **looser** than the
  true oriented bounds — the right trade-off for a fast broad-phase filter.

```ts
Bounds.fromRect(0, 0, 10, 20).transform(Matrix.rotation(90))
// → Bounds { x: -20, y: 0, width: 20, height: 10 }
```

## Geometry helpers

Pure, dependency-free point/segment/polygon routines that back shapes' `containsPoint`. With
`noUncheckedIndexedAccess` on, array lookups are guarded — malformed input is skipped, not thrown.

| Function | Description |
| --- | --- |
| `pointInPolygon(point, polygon): boolean` | even-odd ray-cast point-in-polygon test (polygon is treated as closed) — answers "inside the fill" |
| `distanceToSegment(p, a, b): number` | shortest distance from a point to a segment, projecting and clamping to the endpoints |
| `distanceToPolyline(p, points, closed = false): number` | shortest distance to a polyline; when `closed`, also considers the closing edge — answers "near the outline" |

A filled shape combines them: a `Polygon` is hit if the point is inside *or* near an edge.

```ts
const tri = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 10, y: 20 }]
pointInPolygon({ x: 10, y: 5 }, tri)                              // true
distanceToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 }) // 5
```

## Related

- [Scene graph](/Veyrajs/concepts/scene-graph/) — how local and world matrices/bounds flow through the tree.
- [Scene API](/Veyrajs/api/scene/) — `Node` and `Container`, the main consumers of this layer.
