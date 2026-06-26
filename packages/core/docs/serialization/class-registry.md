# `src/serialization/class-registry.ts` — Type registry

> Maps a serialized `type` string to a factory that constructs the node. The extension point
> for custom node types.

## Exports

- `type NodeFactory` — `(data: SerializedNode) => Node`.
- `class ClassRegistry` — `register(type, factory)`, `has(type)`, `create(data)`.
- `createDefaultRegistry()` — a registry with every built-in type registered.

## How it works

Because `toObject` mirrors the constructor, each factory is just `(data) => new Ctor(data)`.
A small `factoryFor(Ctor)` helper builds these and bridges the `unknown`-valued
`SerializedNode` to the typed config with a single cast. `create` looks up the factory by
`data.type` and throws on an unknown type. **Children are not handled here** — the factory
builds the bare node; the [`SceneSerializer`](./scene-serializer.md) recurses into
`data.children`.

## Conventions & gotchas

- **Extensible.** Register custom shapes/nodes (e.g. annotation primitives) on a registry and
  pass it to the serializer — round-tripping works without touching core. This is exactly how
  the future `@veyrajs/annotations` plugin serializes its node types.
- **Unknown types throw** rather than silently dropping nodes, so a missing plugin is loud.

## Relationships

- **Uses:** the scene shapes/containers (`Rect`, `Group`, …), [`SerializedNode`](./types.md).
- **Used by:** [`SceneSerializer`](./scene-serializer.md).

## Example

```ts
const registry = createDefaultRegistry().register('BBox', (d) => new BBox(d as never))
new SceneSerializer({ registry }).load(stage, doc)
```
