---
title: Serialization & Undo
description: Versioned JSON with migrations, and a reversible command/history layer.
sidebar:
  order: 4
---

## Versioned serialization

Scenes round-trip through a typed, **versioned** JSON document:

```ts
import { SceneSerializer, createDefaultRegistry } from '@veyrajs/core'

const serializer = new SceneSerializer({ registry: createDefaultRegistry() })
const json = serializer.toJSON(stage)   // { version, stage: { type, id, ...props, children } }
const restored = serializer.fromJSON(json)
```

- **`toObject` / `fromObject`** per node — driven by each type's serializable-prop descriptor,
  not a generic attribute dump.
- **`ClassRegistry`** maps a `type` string to a node factory, so plugins (e.g. future annotation
  primitives) round-trip without core changes.
- **`MigrationRunner`** upgrades older documents step by step, so scenes saved today survive
  schema evolution — the concrete payoff of designing serialization in from day one.

Assets (images) are serialized **by reference**, not inlined.

## Commands & undo

Every meaningful mutation is a reversible, serializable **command**:

```ts
import { History, SetPropsCommand } from '@veyrajs/core'

const history = new History()
history.run(new SetPropsCommand(rect, { x: 200 }))   // apply + record
history.undo()
history.redo()
```

- **`SetPropsCommand`**, **`AddNodeCommand`**, **`RemoveNodeCommand`**, and
  **`CompositeCommand`** (transactions) cover the basics.
- The `SelectionController` emits commands for you — a resize or drag becomes **one** undoable
  transaction.
- Because commands are serializable, the same machinery is the seam for future real-time
  collaboration (an op-log), without paying an immutable-core tax today.

`history.canUndo` / `history.canRedo` and `history.onChange(fn)` let your UI track the stack.
