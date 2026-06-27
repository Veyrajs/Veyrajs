---
title: Commands & History
description: Reversible operations and the undo/redo stack — the Command interface, built-in commands, and History.
sidebar:
  order: 11
---

Every undoable mutation runs through a `Command`. [`History`](#history) executes commands and holds
the undo/redo stacks.

```ts
import {
  History, SetPropsCommand, AddNodeCommand, RemoveNodeCommand, CompositeCommand,
} from '@veyrajs/core'
import type { Command, NodeProps, HistoryListener } from '@veyrajs/core'
```

## `Command`

A reversible operation.

```ts
interface Command {
  do(): void
  undo(): void
  label?: string   // for UI (e.g. "Undo move")
}

interface NodeProps {
  // the transform & visual props a SetPropsCommand can change (all optional)
}
```

## Built-in commands

Each implements `Command`.

```ts
// set props; undo restores `before`
class SetPropsCommand implements Command {
  constructor(node: Node, before: NodeProps, after: NodeProps, label?: string)
}

// add `node` to `parent`; undo removes it
class AddNodeCommand implements Command {
  constructor(parent: Container, node: Node, label?: string)
}

// remove `node`; undo re-adds it to the previous parent
class RemoveNodeCommand implements Command {
  constructor(node: Node, label?: string)
}

// group; runs children forward on do(), in reverse on undo()
class CompositeCommand implements Command {
  constructor(commands: Command[], label?: string)
}
```

- `SetPropsCommand` **captures values, not deltas** — robust to intervening edits and trivial to
  invert.
- `RemoveNodeCommand`'s undo re-adds at the **top of the z-order**, not the original index (an MVP
  limitation).
- Commands hold node references; if a node is removed or replaced (e.g. by a
  [scene reload](/Veyrajs/api/serialization/)), clear the history.

```ts
history.run(new AddNodeCommand(layer, rect))
history.push(new SetPropsCommand(rect, { x: 0 }, { x: 120 }, 'move')) // already applied
```

## `History`

The undo/redo stack. `run` executes a command and records it; `push` records one that has already
been applied.

```ts
type HistoryListener = () => void

class History {
  run(command: Command): void    // command.do() then push
  push(command: Command): void   // record an already-applied command

  undo(): void
  redo(): void
  clear(): void

  get canUndo(): boolean
  get canRedo(): boolean

  onChange(listener: HistoryListener): () => void  // returns an unsubscribe fn
}
```

- **Linear history.** A fresh `run`/`push` after some undos discards the redo branch.
- **Bounded.** The oldest entry is dropped past the limit (default `200`).
- **`onChange` for UI.** Every mutation emits a change; bind button `disabled` state to `canUndo`/
  `canRedo`.
- **Clear after a scene reload** — loading a document replaces every node instance, invalidating
  any recorded commands.

```ts
const history = new History()
const controller = new SelectionController(stage, { history })
history.onChange(() => { undoBtn.disabled = !history.canUndo })
```

## Related

- [Commands concepts](/Veyrajs/concepts/commands/)
- [Serialization concepts](/Veyrajs/concepts/serialization/)
- [Selection & Controls](/Veyrajs/api/selection-and-controls/)
