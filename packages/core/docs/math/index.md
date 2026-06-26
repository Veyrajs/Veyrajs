# `src/math/index.ts` — Math barrel

> Re-exports the math layer.

## Purpose

A small barrel that gathers the math primitives so the rest of the engine can
`import { Matrix, Bounds, Vec2 } from '../math'` instead of reaching into individual files.

## Exports

- `Vec2` — see [vec2.md](./vec2.md)
- `Matrix` + type `MatrixComponents` — see [matrix.md](./matrix.md)
- `Bounds` — see [bounds.md](./bounds.md)
- `pointInPolygon`, `distanceToSegment`, `distanceToPolyline` — see [geometry.md](./geometry.md)

## How it works

Pure re-exports. The math layer has **no dependencies** on the rest of the engine — it is
the bottom of the dependency graph, which keeps it trivially testable in isolation.

## Relationships

- **Re-exports from:** `vec2.ts`, `matrix.ts`, `bounds.ts`.
- **Used by:** scene and render layers; also re-exported from the package
  [`index.ts`](../index.md).
