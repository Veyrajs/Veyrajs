---
title: Drag Shapes
description: Make a single shape draggable with the engine's dragstart and dragmove events.
sidebar:
  order: 2
---

The engine derives `dragstart` / `dragmove` / `dragend` from raw pointer events once the
pointer moves more than 3 px from the press point, and these events always target the
**pressed** node. Bind them on a shape to move it, remembering the grab offset so the point
under the cursor stays fixed.

```ts
import { Stage, Rect } from '@veyrajs/core'

const stage = new Stage({
  container: document.getElementById('app')!,
  width: 800,
  height: 480,
})
const layer = stage.createLayer()

const box = new Rect({ x: 120, y: 100, width: 150, height: 90, fill: '#38bdf8' })
layer.add(box)

// Remember where inside the box the user grabbed, so it doesn't snap to the cursor.
let grabX = 0
let grabY = 0

box.on('dragstart', (e) => {
  grabX = box.x - e.worldPoint.x
  grabY = box.y - e.worldPoint.y
})

box.on('dragmove', (e) => {
  box.x = e.worldPoint.x + grabX
  box.y = e.worldPoint.y + grabY
})
```

Every `SceneEvent` carries `worldPoint`, the pointer position in world space — the same space
the node's `x`/`y` live in (the layer here has no transform, so world maps straight to the
node's position). Capturing `box.x - e.worldPoint.x` at `dragstart` and re-applying it on each
`dragmove` keeps the grab point under the cursor. Mutating `box.x` / `box.y` automatically
schedules a repaint, so there's no `render()` call.

For full click-select plus drag-move (and resize/rotate handles), drop in a
`SelectionController` instead — it gives you draggable shapes for free, with undo. See
[Multi-Select](/Veyrajs/recipes/multi-select/).

## Related

- [Events (concept)](/Veyrajs/concepts/events/)
- [Events (API)](/Veyrajs/api/events/)
- [Selection & Transform (concept)](/Veyrajs/concepts/selection/)
- [Recipe: Multi-Select](/Veyrajs/recipes/multi-select/)
