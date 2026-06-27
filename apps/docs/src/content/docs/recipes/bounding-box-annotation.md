---
title: Bounding-Box Annotation
description: Drag out new bounding-box Rects on a background, then switch to a SelectionController to move, resize, and delete them — the annotation workflow.
sidebar:
  order: 11
---

The classic annotation loop: in **draw mode**, drag out a new [`Rect`](/Veyrajs/api/shapes/) on the
background; in **select mode**, hand off to a [`SelectionController`](/Veyrajs/api/selection-and-controls/)
to move, resize, and delete boxes (with undo). Drawing reads `event.worldPoint` from each pointer
[event](/Veyrajs/api/events/) and resizes a draft rect live.

```ts
import { Stage, Rect, History, SelectionController } from '@veyrajs/core'
import type { SceneEvent } from '@veyrajs/core'

const container = document.querySelector('#app') as HTMLElement
const stage = new Stage({ container, width: 800, height: 480, background: '#0b1220' })
const layer = stage.createLayer()
const history = new History()

let controller: SelectionController | null = null
let draft: Rect | null = null
let start = { x: 0, y: 0 }

// --- Draw mode: drag out a new box on the background ---
stage.on('pointerdown', (e: SceneEvent) => {
  if (controller) return                       // select mode owns the pointer
  start = e.worldPoint
  draft = new Rect({
    x: start.x, y: start.y, width: 0, height: 0,
    fill: 'rgba(56,189,248,0.25)', stroke: '#38bdf8', strokeWidth: 2,
  })
  layer.add(draft)
})

stage.on('pointermove', (e: SceneEvent) => {
  if (!draft) return
  const p = e.worldPoint                        // normalize so any drag direction works
  draft.x = Math.min(start.x, p.x)
  draft.y = Math.min(start.y, p.y)
  draft.width = Math.abs(p.x - start.x)
  draft.height = Math.abs(p.y - start.y)
})

stage.on('pointerup', () => {
  if (draft && (draft.width < 4 || draft.height < 4)) draft.remove()  // drop tiny boxes
  draft = null
})

// --- Switch to select mode to move / resize / delete the boxes ---
function enableEditing() {
  controller = new SelectionController(stage, { history })
}
```

The draw handlers bail with `if (controller) return` because the controller intercepts pointer events
in the **capture phase** once editing is on — the two modes never fight over the same drag. Each
finished box is a normal `Rect`, so the controller selects and transforms it for free; pass `history`
and its moves/resizes are undoable. Wrap the `layer.add(draft)` in an `AddNodeCommand` run through the
[history](/Veyrajs/api/commands/) if you want box creation itself to be undoable.

## Related

- [Selection & Controls (API)](/Veyrajs/api/selection-and-controls/)
- [Selection & Transform (concept)](/Veyrajs/concepts/selection/)
- [Events (API)](/Veyrajs/api/events/) — `SceneEvent.worldPoint`.
- [Recipe: Snapping & Guides](/Veyrajs/recipes/snapping-guides/)
