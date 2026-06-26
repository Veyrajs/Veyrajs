# `src/commands/` — Commands & history (undo/redo)

> Reversible operations and an undo/redo stack.

| File | Doc | Concern |
| --- | --- | --- |
| `command.ts` | [command.md](./command.md) | The `Command` interface + built-in commands |
| `history.ts` | [history.md](./history.md) | The undo/redo stack |

## The model

A `Command` is a reversible operation: `do()` applies it, `undo()` reverts it. The
[`History`](./history.md) keeps an undo and a redo stack. This delivers the project's
"undo/redo from day one" decision, and because commands are serializable in shape, it also
keeps the door open for collaboration (an op-log) later.

## `run` vs `push` — the key distinction

- **`history.run(command)`** — execute *and* record (the normal path for programmatic edits).
- **`history.push(command)`** — record a command **already applied** (the interactive path).

The [`SelectionController`](../controls/selection-controller.md) mutates nodes *live* during a
drag (so you see it move), then on release builds a `SetPropsCommand` capturing before→after
and calls `push`. This is why undo integrates without changing the interactive code at all:
the live mutation and the recorded command are two views of the same change.

## Conventions & gotchas

- **Group with `CompositeCommand`** so a multi-node move is a single undo step.
- **Records are net changes**, not per-frame: one drag → one command.
- A new `run`/`push` clears the redo stack (standard linear-history behaviour).
