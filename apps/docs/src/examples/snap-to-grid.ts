import { Line, Rect, type Shape } from '@veyrajs/core'
import { createStage, cycle, disposeStage, onThemeChange, roles, toolbar } from './_kit'

// Snapping is a one-line tweak to the drag math: round the world position to the nearest grid
// step before applying it. The faint grid is just a layer of Lines beneath the tiles.
const STEP = 32

export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const gridLayer = stage.createLayer()
  const layer = stage.createLayer()

  const lines: Line[] = []
  const drawGrid = (): void => {
    for (const l of lines) l.remove()
    lines.length = 0
    const color = roles().panelStroke
    for (let x = 0; x <= stage.width; x += STEP) {
      const l = new Line({
        points: [
          { x, y: 0 },
          { x, y: stage.height },
        ],
        stroke: color,
        strokeWidth: 1,
      })
      gridLayer.add(l)
      lines.push(l)
    }
    for (let y = 0; y <= stage.height; y += STEP) {
      const l = new Line({
        points: [
          { x: 0, y },
          { x: stage.width, y },
        ],
        stroke: color,
        strokeWidth: 1,
      })
      gridLayer.add(l)
      lines.push(l)
    }
  }
  drawGrid()

  for (const tile of [
    new Rect({ x: 2 * STEP, y: 2 * STEP, width: 3 * STEP, height: 2 * STEP, fill: cycle[0] }),
    new Rect({ x: 8 * STEP, y: 3 * STEP, width: 2 * STEP, height: 2 * STEP, fill: cycle[1] }),
  ]) {
    layer.add(tile)
  }

  let dragging: Shape | null = null
  let dx = 0
  let dy = 0
  stage.on('pointerdown', (e) => {
    if (e.target instanceof Rect) {
      dragging = e.target
      dx = e.worldPoint.x - dragging.x
      dy = e.worldPoint.y - dragging.y
    }
  })
  stage.on('pointermove', (e) => {
    if (dragging) {
      dragging.x = Math.round((e.worldPoint.x - dx) / STEP) * STEP
      dragging.y = Math.round((e.worldPoint.y - dy) / STEP) * STEP
    }
  })
  stage.on('pointerup', () => {
    dragging = null
  })

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Drag a tile — it snaps to the grid'
  bar.append(hint)

  const off = onThemeChange(() => {
    const color = roles().panelStroke
    for (const l of lines) l.stroke = color
  })
  return () => {
    off()
    disposeStage(stage)
  }
}
