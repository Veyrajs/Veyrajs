# `src/serialization/` — Versioned JSON serialization

> Save and load the scene graph as plain JSON, with a schema version and migrations.

| File | Doc | Concern |
| --- | --- | --- |
| `types.ts` | [types.md](./types.md) | `SerializedNode`, `SceneDocument`, the schema version |
| `class-registry.ts` | [class-registry.md](./class-registry.md) | `type` → factory mapping (extensible) |
| `migration-runner.ts` | [migration-runner.md](./migration-runner.md) | Upgrade old documents |
| `scene-serializer.ts` | [scene-serializer.md](./scene-serializer.md) | `toDocument` / `load` (the entry point) |

## The core idea: serialization mirrors the constructor

Each node's `toObject()` (on [`Node`](../scene/node.md), extended per type via
`serializedExtras()`) emits **exactly the shape its constructor accepts**. So
deserialization is just `new Rect(data)` via the [`ClassRegistry`](./class-registry.md) —
there's no separate hydration logic, and ids are preserved (`config.id`). Containers add a
`children` array; the serializer recurses and re-parents.

## Why versioning matters now

Per the project's "internal product first, publish later" decision, scenes saved **today**
must still load after the format evolves. Every document carries a `version`; the
[`MigrationRunner`](./migration-runner.md) upgrades older documents step by step on load.
That's why versioned serialization is an MVP concern, not a V2 afterthought.

## Assets by reference

The bitmap of an `Image` is **not** inlined — only its size is serialized (re-attach the
`image` on load). Large rasters and the source URL are an asset concern the host resolves,
keeping documents small and DOM-free.

## Example

```ts
const serializer = new SceneSerializer()
const json = serializer.stringify(stage, 2)   // save
serializer.parse(otherStage, json)            // load (clears + rebuilds)
```
