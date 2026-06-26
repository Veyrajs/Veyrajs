# `src/serialization/scene-serializer.ts` — The serializer

> Save a stage to a document/JSON and load one back. The serialization entry point.

## Exports

- `interface SceneSerializerOptions` — `{ registry?, migrations? }`.
- `class SceneSerializer`:
  - `toDocument(stage)` → `SceneDocument`; `stringify(stage, space?)` → JSON string.
  - `fromObject(data)` → `Node` (a node + its descendants).
  - `load(stage, document)` — replace the stage's content; `parse(stage, json)` — from a string.

## How it works

- **Save.** `toDocument` serializes the stage's **layers** (its children) via each node's
  `toObject()`. The stage itself (size, camera) is viewport state and is not serialized.
- **Load.** `load` first runs [migrations](./migration-runner.md), then clears the stage and
  rebuilds: for each top-level node it calls `fromObject` (which uses the
  [registry](./class-registry.md) and recurses into `children`), adding `Layer`s directly and
  wrapping any stray non-layer in a fresh layer. It requests a render at the end.

## Conventions & gotchas

- **Round-trip is exact for built-in shapes** (ids, transforms, style, geometry) — see the
  serialization tests.
- **Replaces, not merges.** `load`/`parse` clear the stage first. Clear your selection and
  history around a load (the old node instances are gone).
- **Images need re-attaching.** Only an image's size round-trips; reassign its `image` after
  load (assets-by-reference).
- **Custom types** require their factories registered on the `registry` you pass in.

## Relationships

- **Uses:** [`ClassRegistry`](./class-registry.md), [`MigrationRunner`](./migration-runner.md),
  [`Stage`](../scene/stage.md), [`Container`](../scene/container.md)/[`Layer`](../scene/layer.md).

## Example

```ts
const s = new SceneSerializer()
localStorage.setItem('scene', s.stringify(stage))
s.parse(stage, localStorage.getItem('scene') ?? '{"version":1,"nodes":[]}')
```
