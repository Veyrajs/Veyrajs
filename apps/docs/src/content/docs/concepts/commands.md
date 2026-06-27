---
title: Commands & Undo/Redo
description: Reversible commands, the History stack, and batching with composites.
sidebar:
  order: 9
---

Undo/redo is a **day-one** feature, not a bolt-on. Every meaningful mutation can be expressed as a
reversible `Command`, and a `History` stack runs them. This is why a selection drag is a single
undoable step and why the op-log is the seam for future real-time collaboration.

## The Command interface

```ts
interface Command {
  do(): void
  undo(): void
  label?: string
}
```

Four built-in commands cover the common cases:

| Command | `do()` | `undo()` |
| --- | --- | --- |
| `SetPropsCommand(node, before, after, label?)` | apply `after` props | restore `before` props |
| `AddNodeCommand(parent, node, label?)` | add `node` to `parent` | remove it |
| `RemoveNodeCommand(node, label?)` | remove `node` | re-add to its previous parent |
| `CompositeCommand(commands, label?)` | run children forward | undo children **in reverse** |

`SetPropsCommand` snapshots two `NodeProps` bags (transform + visual props) and applies the relevant
one — it captures **values, not deltas**, so it's robust to intervening edits and trivial to invert.

## The History stack

```ts
import { History, SetPropsCommand } from '@veyrajs/core'

const history = new History()

// Execute + record in one call:
history.run(new SetPropsCommand(rect, { x: 0 }, { x: 120 }, 'move'))

// Or record something you already applied (e.g. after a live drag):
rect.x = 120
history.push(new SetPropsCommand(rect, { x: 0 }, { x: 120 }, 'move'))

history.undo()
history.redo()
history.canUndo // boolean
history.canRedo // boolean
```

- **`run` vs `push`.** `run` calls `command.do()` then records; `push` records an
  already-applied command. Both clear the redo stack.
- **Linear history.** A fresh `run`/`push` after some undos discards the redo branch.
- **Bounded.** The oldest entry drops past `limit` (default 200).

Wire UI state to the stack with `onChange`:

```ts
const off = history.onChange(() => {
  undoBtn.disabled = !history.canUndo
  redoBtn.disabled = !history.canRedo
})
// off() to unsubscribe
```

## Batching with CompositeCommand

Group several commands so they undo as **one** step — exactly how a multi-select move is recorded:

```ts
import { CompositeCommand, SetPropsCommand } from '@veyrajs/core'

const move = new CompositeCommand(
  selected.map((n) => new SetPropsCommand(n, { x: n.x }, { x: n.x + 40 })),
  'nudge right',
)
history.run(move) // one entry; undo moves them all back
```

## Integration with selection

Pass a `History` to a [`SelectionController`](/Veyrajs/concepts/selection/) and it records every
move/resize/rotate automatically — a `SetPropsCommand` for a single node, a `CompositeCommand` for a
multi-move — committed on pointer release (it mutates live during the drag, records the net change at
the end).

## Conventions & gotchas

- **Clear history around a scene reload.** Commands hold node references; after
  [`serializer.load`/`parse`](/Veyrajs/concepts/serialization/) the old node instances are gone, so
  call `history.clear()`.
- **`RemoveNodeCommand` undo re-adds at the top of the z-order**, not the original index (an MVP
  limitation; exact-index restore is a later refinement).
- **Custom commands** are first-class: implement `do()`/`undo()` for your own operation and `run` it.

## Related

- [Serialization & Versioning](/Veyrajs/concepts/serialization/) — save/load and why to clear history.
- [Selection & Transform](/Veyrajs/concepts/selection/) — the source of most recorded commands.
- [Recipe: Keyboard shortcuts](/Veyrajs/recipes/keyboard-shortcuts/) — wire undo/redo/delete/nudge.
