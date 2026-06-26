# `src/selection/selection-manager.ts` — Selection state

> Tracks which nodes are selected and notifies listeners. Pure state — no rendering or input.

## Purpose

Holds the selected-node set and emits a change event when it changes. The
[`SelectionController`](../controls/selection-controller.md) and any UI read from it; keeping
it separate means selection state is testable and reusable on its own.

## Exports

- `type SelectionChangeListener` — `(selected: readonly Node[]) => void`.
- `class SelectionManager`:
  - reads: `nodes`, `size`, `isEmpty`, `single` (the lone node or `null`), `has(node)`,
  - writes: `select(...)` / `set(list)` (replace), `add(...)`, `remove(...)`, `toggle(node)`,
    `clear()`,
  - `onChange(listener)` → unsubscribe function.

## How it works

Internally an ordered, de-duplicated array of nodes. Every mutator compares before/after and
**only emits when the set actually changes** (so `select(a)` twice fires once). `onChange`
returns an unsubscribe closure. `single` is a convenience for the common "exactly one
selected" case that the controller's resize/rotate handles require.

## Conventions & gotchas

- **`set`/`select` replace; `add`/`remove`/`toggle` mutate.** All de-duplicate.
- **No node lifecycle coupling.** Removing a node from the scene does not auto-deselect it;
  callers that need that should listen for removal and call `remove`. (A future refinement.)
- Order is insertion order; `nodes` is a readonly view.

## Relationships

- **Uses:** [`Node`](../scene/node.md) (type only).
- **Used by:** [`SelectionController`](../controls/selection-controller.md).

## Example

```ts
const sel = new SelectionManager()
const off = sel.onChange((nodes) => console.log('selected', nodes.length))
sel.select(rect)
sel.add(circle)
sel.toggle(rect) // now just the circle
off()
```
