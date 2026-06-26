# `src/scene/layer.ts` — Render partition

> A logical layer directly under the `Stage`. Not a general grouping primitive.

## Purpose

`Layer` is a top-level partition of the scene. The `Stage`'s direct children must be
`Layer`s; shapes and groups live inside layers. Layers exist to separate concerns that may
later be rendered/cached independently (e.g. a static background vs. a dynamic foreground).

## Exports

- `class Layer extends Container` — `type = 'Layer'`; constructor takes an optional
  `NodeConfig`.

## How it works

Today a `Layer` behaves like any [`Container`](./container.md): in the MVP **all** layers
render to the stage's single canvas, in order. The structural role matters now (the `Stage`
enforces Layer-only children); the *performance* role (giving a layer its own offscreen
canvas for caching) is a later, opt-in optimization that fits behind the existing
[`Renderer`](../render/renderer.md) interface.

## Conventions & gotchas

- **Stage children must be Layers.** `Stage.add()` throws on non-`Layer` children — use
  `stage.createLayer()`.
- **Use layers sparingly.** They are partitions, not the grouping mechanism. Konva's
  per-layer-canvas memory ceiling is the cautionary tale; AnnotaCanvas keeps layers logical
  by default and only allocates a real canvas per layer when caching is explicitly enabled.

## Relationships

- **Extends:** [`Container`](./container.md).
- **Parent:** always a [`Stage`](./stage.md). **Children:** `Group`s and `Shape`s.

## Example

```ts
const layer = stage.createLayer()
layer.add(rect, group)
```
