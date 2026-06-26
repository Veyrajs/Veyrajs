# `src/serialization/migration-runner.ts` — Document migrations

> Upgrades older scene documents to the current schema version on load.

## Exports

- `interface Migration` — `{ from: number, migrate(doc) => doc }` (must advance `version`).
- `class MigrationRunner` — `register(migration)`, `run(doc)`.

## How it works

`run` repeatedly looks up the migration whose `from` matches the document's current version,
applies it, and continues until `version === CURRENT_SCHEMA_VERSION`. It throws if no
migration is registered for an intermediate version, or if a migration fails to advance the
version (guards against infinite loops).

## Conventions & gotchas

- **One step at a time.** Register `0→1`, `1→2`, … and the runner chains them. Don't write a
  single `0→N` migration; chained steps keep each migration small and testable.
- **Pure transforms.** A migration takes a document and returns a new one; it must set the new
  `version`. Keep migrations free of side effects so they're trivially testable against
  fixtures.
- **Missing migrations are loud.** Loading a document from a version with no registered path
  throws rather than guessing.

## Relationships

- **Uses:** [`SceneDocument`](./types.md). **Used by:** [`SceneSerializer`](./scene-serializer.md).

## Example

```ts
const migrations = new MigrationRunner()
  .register({ from: 0, migrate: (d) => ({ ...d, version: 1, nodes: renameFills(d.nodes) }) })
new SceneSerializer({ migrations }).load(stage, oldDoc)
```
