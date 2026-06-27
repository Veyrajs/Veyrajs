---
title: Multi-Select
description: Click, shift-click, and marquee selection with SelectionController, plus reacting to changes.
sidebar:
  order: 3
---

A single `SelectionController` wires up click-to-select, shift-click to toggle, drag-an-empty-
area marquee selection, and resize/rotate handles for a single selection — all as a
screen-space overlay. Read the selected set from `controller.selection.nodes`, and react to
changes with `onChange`.

```ts
import { Stage, History, SelectionController, Rect, Circle } from '@veyrajs/core'

const stage = new Stage({
  container: document.getElementById('app')!,
  width: 800,
  height: 480,
})
const layer = stage.createLayer()
layer.add(
  new Rect({ x: 80, y: 90, width: 130, height: 90, fill: '#38bdf8' }),
  new Rect({ x: 260, y: 150, width: 130, height: 90, fill: '#f472b6' }),
  new Circle({ x: 540, y: 150, radius: 56, fill: '#a78bfa' }),
)

// Passing a History makes every move/resize/rotate undoable.
const history = new History()
const controller = new SelectionController(stage, { history })

// React whenever the selection changes (e.g. to update a properties panel).
const unsubscribe = controller.selection.onChange((nodes) => {
  console.log(`${nodes.length} selected`)
})

// Read the current selection at any time:
function logSelection() {
  const selected = controller.selection.nodes // readonly view, in selection order
  console.log(selected.map((n) => n.type))
}

// Teardown:
// unsubscribe()
// controller.destroy()
```

`SelectionController` listens to stage pointer events in the capture phase, so it's
authoritative over node-level handlers. Click a shape to select it, shift-click to add or
remove, or drag from empty canvas to draw a marquee that selects every shape whose world
bounds it intersects. The managed `SelectionManager` (`controller.selection`) is pure state —
beyond reading `.nodes` you can drive it directly with `select`, `add`, `toggle`, and `clear`.

## Related

- [Selection & Transform (concept)](/Veyrajs/concepts/selection/)
- [Selection & Controls (API)](/Veyrajs/api/selection-and-controls/)
- [Commands & History (API)](/Veyrajs/api/commands/)
- [Recipe: Keyboard Shortcuts](/Veyrajs/recipes/keyboard-shortcuts/)
