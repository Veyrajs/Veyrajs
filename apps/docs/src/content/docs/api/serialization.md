---
title: Serialization
description: Save and load scenes as versioned JSON documents — SceneSerializer, ClassRegistry, and MigrationRunner.
sidebar:
  order: 10
---

Serialize a [`Stage`](/Veyrajs/api/scene/) to a plain-data document (or JSON string) and load it
back. Round-trips are exact for built-in shapes (ids, transforms, style, geometry).

```ts
import {
  SceneSerializer, ClassRegistry, createDefaultRegistry,
  MigrationRunner, CURRENT_SCHEMA_VERSION,
} from '@veyrajs/core'
import type {
  SceneSerializerOptions, NodeFactory, Migration,
  SceneDocument, SerializedNode,
} from '@veyrajs/core'
```

## `SceneSerializer`

The serialization entry point. `toDocument`/`stringify` save; `load`/`parse` restore.

```ts
interface SceneSerializerOptions {
  registry?: ClassRegistry       // custom type factories (default: createDefaultRegistry())
  migrations?: MigrationRunner   // upgrades older documents on load
}

class SceneSerializer {
  constructor(options?: SceneSerializerOptions)

  toDocument(stage: Stage): SceneDocument          // serialize the stage's layers
  stringify(stage: Stage, space?: number): string  // toDocument + JSON.stringify
  fromObject(data: SerializedNode): Node           // build a node + its descendants
  load(stage: Stage, document: SceneDocument): void // replace stage content
  parse(stage: Stage, json: string): void          // load from a JSON string
}
```

- **Save** serializes the stage's **layers** (its children) via each node's `toObject()`. The stage
  itself (size, camera) is viewport state and is **not** serialized.
- **Load** runs migrations, clears the stage, then rebuilds each top-level node with `fromObject`
  (which recurses into `children`), and requests a render.

```ts
const s = new SceneSerializer()
localStorage.setItem('scene', s.stringify(stage))
s.parse(stage, localStorage.getItem('scene') ?? '{"version":1,"nodes":[]}')
```

## `ClassRegistry`

Maps a serialized `type` string to a factory that constructs the node — the extension point for
custom node types.

```ts
type NodeFactory = (data: SerializedNode) => Node

class ClassRegistry {
  register(type: string, factory: NodeFactory): this  // chainable
  has(type: string): boolean
  create(data: SerializedNode): Node                  // throws on unknown type
}

function createDefaultRegistry(): ClassRegistry        // every built-in type registered
```

- Factories build the **bare node**; the serializer recurses into `data.children`.
- **Unknown types throw** rather than silently dropping nodes, so a missing plugin is loud.

```ts
const registry = createDefaultRegistry().register('BBox', (d) => new BBox(d as never))
new SceneSerializer({ registry }).load(stage, doc)
```

## `MigrationRunner`

Upgrades older documents to the current schema version on load.

```ts
interface Migration {
  from: number
  migrate(doc: SceneDocument): SceneDocument  // must advance `version`
}

class MigrationRunner {
  register(migration: Migration): this        // chainable
  run(doc: SceneDocument): SceneDocument
}
```

- **One step at a time.** Register `0→1`, `1→2`, … and the runner chains them until
  `version === CURRENT_SCHEMA_VERSION`.
- **Pure transforms** — return a new document with the new `version`; no side effects.
- **Missing migrations are loud** — an intermediate version with no registered path throws (also
  guards against a migration that fails to advance the version).

```ts
const migrations = new MigrationRunner()
  .register({ from: 0, migrate: (d) => ({ ...d, version: 1, nodes: renameFills(d.nodes) }) })
new SceneSerializer({ migrations }).load(stage, oldDoc)
```

## Document types

```ts
const CURRENT_SCHEMA_VERSION: number   // current on-disk format version (bumped on changes)

interface SceneDocument {
  version: number              // schema version the document was written with
  nodes: SerializedNode[]      // the top-level layers
}

interface SerializedNode {
  type: string                 // registered type name
  id: string
  children?: SerializedNode[]  // serialized children (containers)
  [key: string]: unknown       // type-specific props
}
```

- `SerializedNode` is intentionally loose (`[key: string]: unknown`); strong typing lives at the
  boundaries (`toObject` produces it, registry factories consume it back into typed configs).
- `version` is **per document** (the on-disk format, drives migrations) — distinct from the
  package's runtime `VERSION`.

## Notes

- **Replaces, not merges.** `load`/`parse` clear the stage first; clear your selection and
  [history](/Veyrajs/api/commands/) around a load (the old node instances are gone).
- **Images need re-attaching.** Only an image's size round-trips; reassign its `image` after load
  (assets are referenced, not embedded).
- **Custom types** require their factories registered on the `registry` you pass in.

## Related

- [Serialization concepts](/Veyrajs/concepts/serialization/)
- [Commands & History](/Veyrajs/api/commands/)
