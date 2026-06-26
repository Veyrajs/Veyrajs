# `src/commands/command.ts` — Commands

> The `Command` interface and the built-in reversible operations.

## Exports

- `interface Command` — `do()`, `undo()`, optional `label`.
- `interface NodeProps` — the transform/visual props a `SetPropsCommand` can change.
- Commands:
  - `SetPropsCommand(node, before, after, label?)` — set props; undo restores `before`.
  - `AddNodeCommand(parent, node, label?)` — add; undo removes.
  - `RemoveNodeCommand(node, label?)` — remove; undo re-adds to the previous parent.
  - `CompositeCommand(commands, label?)` — group; undoes its children in reverse.

## How it works

`SetPropsCommand` snapshots two `NodeProps` bags and applies the relevant one on `do`/`undo`
(via an internal `applyProps` that sets only the defined keys). `CompositeCommand` runs its
children forward on `do` and **in reverse** on `undo` (the correct order for nested
dependencies).

## Conventions & gotchas

- **`SetPropsCommand` captures values, not deltas** — robust to intervening edits and trivial
  to invert.
- **`RemoveNodeCommand`'s undo re-adds at the top of the z-order**, not the original index (an
  MVP limitation; restoring the exact index is a later refinement).
- Commands hold node references; if a node is also removed/replaced (e.g. by a scene reload),
  clear the history.

## Relationships

- **Uses:** [`Node`](../scene/node.md), [`Container`](../scene/container.md).
- **Used by:** [`History`](./history.md) and [`SelectionController`](../controls/selection-controller.md).

## Example

```ts
history.run(new AddNodeCommand(layer, rect))
history.push(new SetPropsCommand(rect, { x: 0 }, { x: 120 }, 'move')) // already applied
```
