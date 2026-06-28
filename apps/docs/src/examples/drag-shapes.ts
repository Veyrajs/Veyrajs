import { Circle, Rect, Shape } from '@veyrajs/core'
import { createStage, cycle, disposeStage } from './_kit'

// There's no built-in `draggable` flag — drag is a three-event handshake you wire yourself:
// pointerdown on a shape captures the grab offset, pointermove moves it in world space, and
// pointerup drops it. Working in world coordinates keeps it correct under any camera zoom/pan.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  layer.add(
    new Rect({ x: 80, y: 80, width: 130, height: 90, fill: cycle[0] }),
    new Circle({ x: 320, y: 140, radius: 56, fill: cycle[1] }),
    new Rect({ x: 470, y: 90, width: 110, height: 110, fill: cycle[2] }),
  )

  let dragging: Shape | null = null
  let dx = 0
  let dy = 0

  stage.on('pointerdown', (e) => {
    if (e.target instanceof Shape) {
      dragging = e.target
      dx = e.worldPoint.x - dragging.x
      dy = e.worldPoint.y - dragging.y
      host.style.cursor = 'grabbing'
    }
  })
  stage.on('pointermove', (e) => {
    if (dragging) {
      dragging.x = e.worldPoint.x - dx
      dragging.y = e.worldPoint.y - dy
    }
  })
  stage.on('pointerup', () => {
    dragging = null
    host.style.cursor = ''
  })

  return () => disposeStage(stage)
}
