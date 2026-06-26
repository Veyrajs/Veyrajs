# `src/math/vec2.ts` — 2D point/vector

> A plain `{ x, y }` value type plus pure helper functions.

## Purpose

Represents a 2D point or vector. It is the smallest geometric value in the engine, used
for positions, pointer coordinates, and polygon vertices.

## Exports

- `interface Vec2 { x: number; y: number }` — the value type.
- `const Vec2` — a namespace-style object of **pure** helpers (same name as the interface,
  via declaration merging):
  - `of(x, y)`, `clone(v)`
  - `add(a, b)`, `sub(a, b)`, `scale(v, s)`
  - `dot(a, b)`, `length(v)`, `distance(a, b)`
  - `equals(a, b, epsilon = 0)`

## How it works

`Vec2` is deliberately a **plain object, not a class**. Two reasons:

1. **Serialization** — a `{ x, y }` object round-trips through JSON with no wrapping.
2. **Interop** — it drops straight into `DrawOp` payloads (e.g. `PolygonOp.points`) and
   matrix math without conversion.

The helper functions never mutate their inputs; they return new objects. The merged
`Vec2` const lets you write `Vec2.add(a, b)` while `Vec2` is still usable as a type.

## Conventions & gotchas

- **No methods on the data.** Because `Vec2` values are plain objects, all operations are
  free functions (`Vec2.add(...)`), not methods (`a.add(...)`). This keeps the data
  serialization-friendly.
- `equals` takes an optional `epsilon` for tolerant float comparison; default `0` is exact.

## Relationships

- **Used by:** [`math/matrix.ts`](./matrix.md) (`applyToPoint`), [`math/bounds.ts`](./bounds.md)
  (corners/`fromPoints`), [`render/draw-ops.ts`](../render/draw-ops.md) (polygon points),
  and `Shape.containsPoint` (local-space point queries).

## Example

```ts
import { Vec2 } from '@veyrajs/core'

const a = Vec2.of(1, 2)
const b = Vec2.of(4, 6)
Vec2.distance(a, b) // 5
```
