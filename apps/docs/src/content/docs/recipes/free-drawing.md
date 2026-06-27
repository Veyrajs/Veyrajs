---
title: Free Drawing
description: Draw a freehand stroke by growing a Line's points on pointer move.
sidebar:
  order: 4
---

Freehand drawing is a `Line` that grows while the pointer is down: start it on
`pointerdown`, append a point on every `pointermove`, and finalize on `pointerup`. Each
`SceneEvent` already carries `worldPoint`, so there's no manual coordinate math.

```ts
import { Stage, Line } from '@veyrajs/core'

const stage = new Stage({
  container: document.getElementById('app')!,
  width: 800,
  height: 480,
  background: '#0b1220',
})
const layer = stage.createLayer()

let current: Line | null = null
let points: { x: number; y: number }[] = []

stage.on('pointerdown', (e) => {
  if (e.button !== 0) return // primary button only
  points = [e.worldPoint]
  // Origin at (0,0) means each point is authored directly in world space.
  current = new Line({ x: 0, y: 0, points, stroke: '#38bdf8', strokeWidth: 3 })
  layer.add(current)
})

stage.on('pointermove', (e) => {
  if (!current) return
  points = [...points, e.worldPoint]
  current.points = points // the setter copies the array and repaints
})

stage.on('pointerup', () => {
  if (current && points.length < 2) current.remove() // discard a stray click
  current = null
})
```

`Line.points` is *copied* on assignment and the getter returns a read-only view, so you can't
push into it in place — instead keep your own array and reassign `current.points` each move,
which marks the node dirty and schedules a frame. Because the line's origin is `(0, 0)`, world
points double as the line's local points. If you have a transformed camera you can equally use
`stage.screenToWorld(e.screenPoint)`, which is exactly what `e.worldPoint` already gives you.
A `Line` is stroke-only; for a filled closed shape, build a `Polygon` instead.

## Related

- [Shapes (API)](/Veyrajs/api/shapes/)
- [Events (concept)](/Veyrajs/concepts/events/)
- [Camera (concept)](/Veyrajs/concepts/camera/)
- [Recipe: Drag Shapes](/Veyrajs/recipes/drag-shapes/)
