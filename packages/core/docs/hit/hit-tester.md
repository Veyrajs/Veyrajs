# `src/hit/hit-tester.ts` — HitTester contract

> The pluggable hit-testing interface plus its options and result types.

## Purpose

Defines what a hit tester does — `hitTest(root, worldPoint, pixelSize, options)` → a
`HitResult` or `null` — and the option/result shapes shared by all strategies.

## Exports

- `type HitType` — `'fill' | 'stroke' | 'bounds' | 'vertex'`.
- `interface HitTestOptions`:
  - `tolerance` — extra grab radius in **screen pixels** (zoom-invariant). Default 0.
  - `fill` / `stroke` — test interiors / outlines. Default both true.
  - `bounds` — also test bounding boxes (yields `'bounds'`). Default false.
  - `vertices` — also test shape corners/points (yields `'vertex'`). Default false.
  - `deep` — descend into containers. Default true.
  - `match(node)` — accept only matching nodes.
- `interface HitResult` — `{ node, type, worldPoint, localPoint, vertexIndex? }`.
- `interface HitTester` — `hitTest(root, worldPoint, pixelSize, options?)`.

## How it works

- **`pixelSize`** is world units per screen pixel (`= 1 / camera.zoom`). The tester uses it
  to convert the screen-pixel `tolerance` into world (and then local) units — the source of
  the zoom-invariant grab radius. The `Stage` computes and passes it.
- **`HitResult.type`** tells you *what* was hit, which higher layers (controls, vertex
  editing) use to decide behaviour — e.g. a `'vertex'` hit starts a corner drag, a `'fill'`
  hit selects the shape.

## Conventions & gotchas

- **Tolerance units differ by layer.** At the `Stage`/`HitTester` API, `tolerance` is screen
  pixels. Inside a shape's `hitTest`, the (already-converted) tolerance is in *local* units.
- **First hit wins.** Implementations return the topmost (reverse z-order) result and stop.

## Relationships

- **Uses:** [`Vec2`](../math/vec2.md), [`Node`](../scene/node.md) (types).
- **Implemented by:** [`GeometricHitTester`](./geometric-hit-tester.md).
- **Driven by:** [`Stage.hitTest`](../scene/stage.md); injected via `new Stage({ hitTester })`.

## Example

```ts
stage.hitTest({ x, y }, { tolerance: 6, vertices: true })
// → { node, type: 'vertex', vertexIndex: 2, ... } | { type: 'fill', ... } | null
```
