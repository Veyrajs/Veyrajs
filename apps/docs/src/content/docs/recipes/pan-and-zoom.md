---
title: "Pan & Zoom"
description: Drag the empty canvas to pan and use the wheel for cursor-anchored zoom.
sidebar:
  order: 1
---

Two small handlers turn a stage into an infinite, pannable canvas: drag to pan with the
camera's `panBy`, and scroll to zoom with `zoomAt`. The camera is a *view* onto the world, so
panning and zooming never touch your node coordinates.

```ts
import { Stage, Rect, Circle } from '@veyrajs/core'

const stage = new Stage({
  container: document.getElementById('app')!,
  width: 800,
  height: 480,
  background: '#0b1220',
})
const layer = stage.createLayer()
layer.add(
  new Rect({ x: 120, y: 120, width: 160, height: 100, fill: '#38bdf8' }),
  new Circle({ x: 480, y: 240, radius: 60, fill: '#f472b6' }),
)

// --- Drag to pan: feed the screen delta between moves to panBy ---
let panning = false
let last = { x: 0, y: 0 }

stage.on('pointerdown', (e) => {
  if (e.button !== 0) return // primary button only
  panning = true
  last = e.screenPoint
})

stage.on('pointermove', (e) => {
  if (!panning) return
  stage.camera.panBy(e.screenPoint.x - last.x, e.screenPoint.y - last.y)
  last = e.screenPoint
})

stage.on('pointerup', () => {
  panning = false
})

// --- Wheel to zoom about the cursor ---
stage.on('wheel', (e) => {
  e.preventDefault() // stop the page from scrolling
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
  stage.camera.zoomAt(e.screenPoint, factor)
})
```

Listen on the `stage` so handlers fire even when the pointer hits empty canvas (the stage
becomes the event target). `panBy` takes a delta in **screen pixels**, so we track the last
pointer position and pass the difference each move. `zoomAt(anchor, factor)` is
cursor-anchored: the world point under `e.screenPoint` stays put while everything scales
around it, and `e.preventDefault()` keeps the wheel from scrolling the page (the `wheel`
listener is non-passive). Zoom is clamped to `[minZoom, maxZoom]` automatically.

## Related

- [Camera (concept)](/Veyrajs/concepts/camera/)
- [Camera (API)](/Veyrajs/api/camera/)
- [Events (concept)](/Veyrajs/concepts/events/)
- [Recipe: Drag Shapes](/Veyrajs/recipes/drag-shapes/)
