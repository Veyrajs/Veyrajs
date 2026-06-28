import { Rect, Shape } from '@veyrajs/core'
import { createStage, cycle, disposeStage, toolbar } from './_kit'

// Drag the rectangles around; any that overlap turn red. Overlap is a cheap world-AABB test —
// `getWorldBounds().intersects(...)` — re-run on every drag move. (For many shapes you'd add a
// spatial index; here a quadratic pass is plenty.)
const COLLIDE = '#ef4444'

export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const rects = [
    new Rect({ x: 80, y: 70, width: 120, height: 90, fill: cycle[0] }),
    new Rect({ x: 250, y: 120, width: 120, height: 90, fill: cycle[1] }),
    new Rect({ x: 420, y: 80, width: 120, height: 90, fill: cycle[2] }),
    new Rect({ x: 300, y: 40, width: 120, height: 90, fill: cycle[3] }),
  ]
  for (const r of rects) layer.add(r)

  const check = (): void => {
    for (const r of rects) {
      r.stroke = null
      r.strokeWidth = 0
    }
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        if (rects[i].getWorldBounds().intersects(rects[j].getWorldBounds())) {
          for (const r of [rects[i], rects[j]]) {
            r.stroke = COLLIDE
            r.strokeWidth = 3
          }
        }
      }
    }
    stage.requestRender()
  }

  let dragging: Shape | null = null
  let dx = 0
  let dy = 0
  stage.on('pointerdown', (e) => {
    if (e.target instanceof Shape) {
      dragging = e.target
      dx = e.worldPoint.x - dragging.x
      dy = e.worldPoint.y - dragging.y
    }
  })
  stage.on('pointermove', (e) => {
    if (dragging) {
      dragging.x = e.worldPoint.x - dx
      dragging.y = e.worldPoint.y - dy
      check()
    }
  })
  stage.on('pointerup', () => {
    dragging = null
  })

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Drag the rectangles — overlaps turn red'
  bar.append(hint)

  check()
  return () => disposeStage(stage)
}
