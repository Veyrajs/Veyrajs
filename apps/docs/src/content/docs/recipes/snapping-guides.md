---
title: Snapping & Guides
description: Snap a dragged node to a grid or to another node's edges inside a dragmove handler, using getWorldBounds for edge alignment.
sidebar:
  order: 12
---

Snapping lives in a `dragmove` handler. The built-in drag [events](/Veyrajs/api/events/) fire on the
pressed node once the pointer moves more than 3 px; they don't move the node, so you set `x`/`y`
yourself — and round them to a grid on the way. Capture the pointer's offset from the node origin on
`dragstart` so the box doesn't jump under the cursor.

```ts
import { Stage, Rect } from '@veyrajs/core'
import type { SceneEvent } from '@veyrajs/core'

const container = document.querySelector('#app') as HTMLElement
const stage = new Stage({ container, width: 800, height: 480, background: '#0b1220' })
const layer = stage.createLayer()

const box = new Rect({ x: 60, y: 60, width: 120, height: 80, fill: '#38bdf8' })
const other = new Rect({ x: 320, y: 220, width: 120, height: 80, fill: '#f472b6' })
layer.add(box, other)

const STEP = 20
const snap = (v: number) => Math.round(v / STEP) * STEP

let grab = { x: 0, y: 0 }

box.on('dragstart', (e: SceneEvent) => {
  grab = { x: e.worldPoint.x - box.x, y: e.worldPoint.y - box.y }  // pointer offset from origin
})

box.on('dragmove', (e: SceneEvent) => {
  box.x = snap(e.worldPoint.x - grab.x)   // snap the node origin to the grid
  box.y = snap(e.worldPoint.y - grab.y)
})
```

To align with neighbours instead, compare world AABBs from `getWorldBounds()` and nudge the node when
an edge falls within a threshold:

```ts
const THRESHOLD = 8

// Replace the dragmove above to align edges with another node.
box.on('dragmove', (e: SceneEvent) => {
  box.x = e.worldPoint.x - grab.x
  box.y = e.worldPoint.y - grab.y

  const a = box.getWorldBounds()
  const b = other.getWorldBounds()

  if (Math.abs(a.x - b.x) < THRESHOLD) box.x += b.x - a.x                          // left ↔ left
  else if (Math.abs(a.right - b.right) < THRESHOLD) box.x += b.right - a.right     // right ↔ right

  if (Math.abs(a.y - b.y) < THRESHOLD) box.y += b.y - a.y                          // top ↔ top
  else if (Math.abs(a.bottom - b.bottom) < THRESHOLD) box.y += b.bottom - a.bottom // bottom ↔ bottom
})
```

The edge math assumes the node sits on an untransformed layer (world ≈ local); under a scaled or
rotated parent, convert the delta through the parent's matrix. To show a guide while snapping, draw a
temporary `Line` on a dedicated layer — see the [grid & ruler recipe](/Veyrajs/recipes/grid-ruler/).

## Related

- [Events (API)](/Veyrajs/api/events/) — the drag events and `worldPoint`.
- [Selection & Controls (API)](/Veyrajs/api/selection-and-controls/)
- [Math (API)](/Veyrajs/api/math/) — `Bounds` edges (`right`, `bottom`).
- [Recipe: Grid & Ruler Overlay](/Veyrajs/recipes/grid-ruler/)
