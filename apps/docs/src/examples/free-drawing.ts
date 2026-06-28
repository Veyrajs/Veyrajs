import { Line } from '@veyrajs/core'
import { button, createStage, disposeStage, palette, toolbar } from './_kit'

// Free drawing builds a Line incrementally: pointerdown starts one, pointermove appends a point
// (the points setter clones, so each stroke stays its own undoable, selectable node), pointerup
// ends it. The eraser hit-tests under the pointer and removes whatever line it finds.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  let mode: 'brush' | 'eraser' = 'brush'
  let color: string = palette.blue
  let current: Line | null = null

  function setMode(m: 'brush' | 'eraser'): void {
    mode = m
    brushBtn.classList.toggle('is-active', m === 'brush')
    eraserBtn.classList.toggle('is-active', m === 'eraser')
  }

  stage.on('pointerdown', (e) => {
    if (mode === 'eraser') {
      stage.getIntersection(e.worldPoint, { tolerance: 10 })?.remove()
      return
    }
    current = new Line({
      points: [{ x: e.worldPoint.x, y: e.worldPoint.y }],
      stroke: color,
      strokeWidth: 4,
      lineCap: 'round',
      lineJoin: 'round',
    })
    layer.add(current)
  })
  stage.on('pointermove', (e) => {
    if (mode === 'eraser') {
      if (e.buttons) stage.getIntersection(e.worldPoint, { tolerance: 10 })?.remove()
      return
    }
    if (current) current.points = [...current.points, { x: e.worldPoint.x, y: e.worldPoint.y }]
  })
  stage.on('pointerup', () => {
    current = null
  })

  const bar = toolbar(host)
  const brushBtn = button('Brush', () => setMode('brush'))
  const eraserBtn = button('Eraser', () => setMode('eraser'))
  bar.append(brushBtn, eraserBtn)
  for (const c of [palette.blue, palette.cyan, palette.amber, palette.teal]) {
    const sw = button('', () => {
      color = c
      setMode('brush')
    })
    sw.className = 'vy-swatch'
    sw.style.background = c
    sw.setAttribute('aria-label', `brush color ${c}`)
    bar.append(sw)
  }
  bar.append(button('Clear', () => layer.removeChildren()))
  setMode('brush')

  return () => disposeStage(stage)
}
