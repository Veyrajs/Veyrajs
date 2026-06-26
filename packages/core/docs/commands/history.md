# `src/commands/history.ts` — Undo/redo stack

> Holds the undo and redo stacks and drives commands.

## Exports

- `type HistoryListener` — `() => void`.
- `class History`:
  - `run(command)` — execute + record; `push(command)` — record already-applied.
  - `undo()`, `redo()`, `clear()`.
  - `canUndo`, `canRedo`.
  - `onChange(listener)` → unsubscribe.

## How it works

`run` calls `command.do()` then `push`. `push` appends to the undo stack, trims to `limit`,
**clears the redo stack**, and emits. `undo` pops the undo stack, calls `command.undo()`, and
moves it to the redo stack; `redo` does the reverse. Every mutation emits a change so UI
(e.g. enabling/disabling undo buttons) stays in sync.

## Conventions & gotchas

- **Linear history.** A fresh `run`/`push` after some undos discards the redo branch.
- **Bounded.** The oldest entry is dropped past `limit` (default 200).
- **`onChange` for UI.** Bind button `disabled` state to `canUndo`/`canRedo` via `onChange`.

## Relationships

- **Uses:** [`Command`](./command.md).
- **Used by:** app code and [`SelectionController`](../controls/selection-controller.md)
  (pass `new History()` as `history`).

## Example

```ts
const history = new History()
const controller = new SelectionController(stage, { history })
history.onChange(() => { undoBtn.disabled = !history.canUndo })
```
