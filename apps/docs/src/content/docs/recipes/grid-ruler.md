---
title: Grid & Ruler Overlay
description: Draw a grid of Line shapes on a background layer that pans and zooms with the scene, plus a screen-fixed ruler via a stage Overlay.
sidebar:
  order: 9
---

A grid built from [`Line`](/Veyrajs/api/shapes/) shapes lives in **world space**, so it pans and zooms
with your content. Put it on its own [layer](/Veyrajs/api/scene/) created *first* (child order is paint
order, so it sits behind everything) and rebuild it whenever the scene size changes.

```ts
import { Stage, Line } from '@veyrajs/core'

const container = document.querySelector('#app') as HTMLElement
const stage = new Stage({ container, width: 800, height: 480, background: '#0b1220' })

const gridLayer = stage.createLayer()    // created first → paints behind
const contentLayer = stage.createLayer()

function drawGrid(step = 32, color = '#1e293b') {
  gridLayer.removeChildren()             // clear old lines before redrawing
  const { width, height } = stage

  for (let x = 0; x <= width; x += step) {
    gridLayer.add(new Line({ points: [{ x, y: 0 }, { x, y: height }], stroke: color, strokeWidth: 1 }))
  }
  for (let y = 0; y <= height; y += step) {
    gridLayer.add(new Line({ points: [{ x: 0, y }, { x: width, y }], stroke: color, strokeWidth: 1 }))
  }
}

drawGrid()
```

For a ruler or HUD that stays put regardless of camera pan/zoom, use an `Overlay` instead: its
`drawOps()` are **screen-space** and drawn after the scene each frame.

```ts
import type { Overlay, DrawOp } from '@veyrajs/core'

const ruler: Overlay = {
  drawOps(): DrawOp[] {
    const ops: DrawOp[] = []
    for (let x = 0; x <= stage.width; x += 50) {
      ops.push({ type: 'text', x: x + 2, y: 2, text: String(x), font: '10px system-ui', fill: '#64748b' })
    }
    return ops
  },
}
stage.addOverlay(ruler)
```

The grid is part of the scene (it moves with the world); the overlay is fixed to the screen — pick by
whether the marks should track the content or the viewport. Remove the overlay later with
`stage.removeOverlay(ruler)`.

## Related

- [Shapes (API)](/Veyrajs/api/shapes/) — `Line` geometry.
- [Scene Graph (API)](/Veyrajs/api/scene/) — `Overlay`, `addOverlay`, layers.
- [Rendering (API)](/Veyrajs/api/rendering/) — the `DrawOp` vocabulary.
