---
title: Keyboard Shortcuts
description: Undo, redo, delete, and arrow-key nudge wired to the command history and current selection.
sidebar:
  order: 5
---

The engine doesn't synthesize keyboard events, so bind a `keydown` listener on the `window`
yourself and route keys to the [`History`](/Veyrajs/api/commands/). This recipe adds undo/redo,
delete, and arrow-key nudging that act on the current `SelectionController` selection — every
change is undoable because it goes through a command.

```ts
import {
  Stage, History, SelectionController,
  RemoveNodeCommand, SetPropsCommand, CompositeCommand, Rect,
} from '@veyrajs/core'

const stage = new Stage({ container: document.getElementById('app')!, width: 800, height: 480 })
const layer = stage.createLayer()
layer.add(new Rect({ x: 120, y: 100, width: 150, height: 90, fill: '#38bdf8' }))

const history = new History()
const controller = new SelectionController(stage, { history })

const NUDGE: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
}

function onKeyDown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey
  const selected = [...controller.selection.nodes] // snapshot before mutating

  if (mod && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    if (e.shiftKey) history.redo()
    else history.undo()
    return
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (!selected.length) return
    e.preventDefault()
    history.run(new CompositeCommand(selected.map((n) => new RemoveNodeCommand(n)), 'delete'))
    controller.selection.clear()
    return
  }

  const delta = NUDGE[e.key]
  if (delta && selected.length) {
    e.preventDefault()
    const step = e.shiftKey ? 10 : 1
    const [dx, dy] = delta
    history.run(new CompositeCommand(
      selected.map((n) => new SetPropsCommand(
        n,
        { x: n.x, y: n.y },
        { x: n.x + dx * step, y: n.y + dy * step },
        'nudge',
      )),
      'nudge',
    ))
  }
}

window.addEventListener('keydown', onKeyDown)
// Teardown: window.removeEventListener('keydown', onKeyDown)
```

`history.run(command)` applies a command *and* records it, so undo/redo come for free.
`SetPropsCommand` captures `before`/`after` values (not deltas), and wrapping a batch in a
`CompositeCommand` makes a multi-node nudge or delete reverse in a single undo. Hold Shift with
an arrow for a bigger 10 px step. Note that `RemoveNodeCommand`'s undo re-adds the node at the
top of the z-order.

## Related

- [Commands & History (API)](/Veyrajs/api/commands/)
- [Commands & Undo/Redo (concept)](/Veyrajs/concepts/commands/)
- [Selection & Controls (API)](/Veyrajs/api/selection-and-controls/)
- [Recipe: Multi-Select](/Veyrajs/recipes/multi-select/)
