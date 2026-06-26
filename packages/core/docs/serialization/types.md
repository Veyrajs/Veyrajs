# `src/serialization/types.ts` — Serialization types

> The plain-data shapes and the schema version.

## Exports

- `const CURRENT_SCHEMA_VERSION` — the current document format version (bump on changes).
- `interface SerializedNode` — `{ type, id, children?, [key]: unknown }`. A node's type, id,
  type-specific props, and (for containers) serialized children.
- `interface SceneDocument` — `{ version, nodes }`. A versioned document: the top-level
  layers plus the schema version they were written with.

## Conventions & gotchas

- **`SerializedNode` is intentionally loose** (`[key: string]: unknown`) because each node
  type carries different props. The strong typing lives at the boundaries: `toObject`
  produces it, and the registry factories consume it back into typed configs.
- **`version` is per document, not per node.** It tracks the on-disk format and drives
  [migrations](./migration-runner.md) — distinct from the package's runtime `VERSION`.

## Relationships

- **Used by:** the whole serialization subsystem and [`Node.toObject`](../scene/node.md).
  Has no imports itself (the bottom of the dependency graph here).
