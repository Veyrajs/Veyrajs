---
title: Schema Migrations
description: Keep old saved scenes loadable — versioned SceneDocuments, one-step migrations, the MigrationRunner, and how the runner chains 0→1→2 up to the current schema version.
sidebar:
  order: 5
---

A scene saved today should still load after your save format changes. Veyrajs handles this with
**versioned documents** and **one-step migrations**: every [`SceneDocument`](/Veyrajs/api/serialization/)
carries the schema `version` it was written with, and a `MigrationRunner` upgrades older documents to
the current version as they load.

```ts
import {
  SceneSerializer, MigrationRunner, CURRENT_SCHEMA_VERSION,
} from '@veyrajs/core'
import type { Migration, SceneDocument, SerializedNode } from '@veyrajs/core'
```

## Versioned documents

A saved scene is a plain `SceneDocument` — a `version` plus the top-level nodes (the
[layers](/Veyrajs/api/scene/)):

```ts
interface SceneDocument {
  version: number              // schema version this document was written with
  nodes: SerializedNode[]      // the top-level layers
}

interface SerializedNode {
  type: string                 // registered type name
  id: string
  children?: SerializedNode[]  // serialized children (containers)
  [key: string]: unknown       // type-specific props
}
```

`stringify` / `toDocument` always write `version: CURRENT_SCHEMA_VERSION`. When you change the
on-disk format you **bump `CURRENT_SCHEMA_VERSION`** and add a migration that gets older documents up
to it. Note this `version` is *per document* (the on-disk format, what drives migrations) — it is
**not** the package's runtime `VERSION`; don't conflate the two.

## Writing a one-step migration

A `Migration` upgrades a document from **one** version to the next. Its `migrate` is a **pure
transform**: return a *new* document, with the `version` advanced, and no side effects.

```ts
interface Migration {
  from: number
  migrate(doc: SceneDocument): SceneDocument  // must advance `version`
}
```

The golden rule: write **small, one-step** migrations (`0→1`, `1→2`, …) — never a single `0→N`. Each
step only has to understand the format immediately before it, and the runner composes them.

## A worked example: renaming a prop (0 → 1)

Say v0 shapes stored their paint colour under `color`, and v1 renames that to `fill`. The migration
walks the node tree and renames the prop wherever it appears. Because nodes nest, the rename must
recurse into `children`:

```ts
// Rename `color` → `fill` on every node, recursively.
function renameColorToFill(nodes: SerializedNode[]): SerializedNode[] {
  return nodes.map((node) => {
    const next: SerializedNode = { ...node }
    if ('color' in next) {
      next.fill = next.color
      delete next.color
    }
    if (next.children) next.children = renameColorToFill(next.children)
    return next
  })
}

const zeroToOne: Migration = {
  from: 0,
  migrate: (doc) => ({ ...doc, version: 1, nodes: renameColorToFill(doc.nodes) }),
}
```

A v0 document on the way in…

```jsonc
{
  "version": 0,
  "nodes": [
    { "type": "Layer", "id": "n1", "children": [
      { "type": "Rect", "id": "n2", "x": 40, "y": 40, "width": 150, "height": 90, "color": "#38bdf8" }
    ]}
  ]
}
```

…comes out as a v1 document, with `color` renamed to `fill` and `version` bumped:

```jsonc
{
  "version": 1,
  "nodes": [
    { "type": "Layer", "id": "n1", "children": [
      { "type": "Rect", "id": "n2", "x": 40, "y": 40, "width": 150, "height": 90, "fill": "#38bdf8" }
    ]}
  ]
}
```

Returning `{ ...doc, version: 1, … }` rather than mutating `doc` keeps the transform pure, which is
what makes migrations trivially unit-testable (feed in a v0 object, assert the v1 result).

## Registering on the MigrationRunner

Collect your migrations on a `MigrationRunner`. `register` is chainable; `run` upgrades a document:

```ts
class MigrationRunner {
  register(migration: Migration): this        // chainable
  run(doc: SceneDocument): SceneDocument
}

const migrations = new MigrationRunner()
  .register(zeroToOne)
  // .register(oneToTwo)   // add 1→2 when you next change the format
```

You can run it directly — handy in tests or one-off tooling:

```ts
const upgraded = migrations.run({ version: 0, nodes: [/* … */] })
upgraded.version === CURRENT_SCHEMA_VERSION // true once every step is registered
```

## Passing it to the serializer

In normal use you don't call `run` yourself — hand the runner to the
[`SceneSerializer`](/Veyrajs/api/serialization/) and it migrates on every `load` / `parse`:

```ts
const serializer = new SceneSerializer({ migrations })

// A v0 string is upgraded to the current version on the way in, then loaded:
serializer.parse(stage, oldJson)
```

On load the serializer runs migrations **first**, then clears the stage and rebuilds the nodes — so
the node factories in the [`ClassRegistry`](/Veyrajs/advanced/custom-node-types/) only ever see
current-version data. (Loading **replaces** the stage's content, so clear your selection and
[history](/Veyrajs/api/commands/) around a load — the old node instances are gone.)

## How chaining works

The runner applies **one step at a time**, looking up the migration whose `from` matches the
document's current `version`, until `version === CURRENT_SCHEMA_VERSION`. Register `0→1`, `1→2`, … and
a very old document walks the whole chain automatically:

```text
v0 ──0→1──▶ v1 ──1→2──▶ v2 ── … ──▶ vCURRENT
```

This composition is exactly why each migration only needs to be one step. It also has two loud
failure modes — both deliberate:

- **A missing step throws.** If the document sits at an intermediate version with no registered
  migration for it, the runner throws rather than guessing or silently dropping data. The practical
  consequence: when you bump to v2, keep `0→1` registered *as well as* adding `1→2`, so a stored v0
  document can still chain all the way up.
- **A non-advancing migration throws.** A `migrate` that returns the same `version` it was given
  would loop forever, so the runner guards against it. Always advance `version` in every step.

## Related

- [Serialization API](/Veyrajs/api/serialization/) — `SceneSerializer`, `MigrationRunner`, `Migration`, `SceneDocument`.
- [Serialization & Versioning (concept)](/Veyrajs/concepts/serialization/) — round-tripping scenes to JSON.
- [Custom Node Types](/Veyrajs/advanced/custom-node-types/) — the `ClassRegistry` factories that consume migrated data.
