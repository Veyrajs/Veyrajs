import { Circle, Polygon, Rect, Text } from '@veyrajs/core'
import {
  button,
  createStage,
  disposeStage,
  onThemeChange,
  palette,
  readout,
  roles,
  toolbar,
} from './_kit'

// Pan by dragging the background; zoom about the cursor with the wheel (or the buttons,
// which zoom about the stage center). World coordinates never move — only the camera does —
// which the live readout makes explicit.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const caption = new Text({
    x: 80,
    y: 210,
    text: 'World coordinates never move — only the view does.',
    fontSize: 14,
    fill: roles().muted,
  })
  layer.add(
    new Rect({ x: 80, y: 60, width: 150, height: 96, fill: palette.blue }),
    new Circle({ x: 360, y: 120, radius: 50, fill: palette.cyan }),
    new Polygon({
      x: 540,
      y: 120,
      points: [
        { x: 0, y: -54 },
        { x: 52, y: 40 },
        { x: -52, y: 40 },
      ],
      fill: palette.teal,
    }),
    caption,
  )
  const off = onThemeChange(() => {
    caption.fill = roles().muted
  })

  function update(wx?: number, wy?: number): void {
    const pct = Math.round(stage.camera.zoom * 100)
    out.textContent =
      wx === undefined
        ? `zoom ${pct}%`
        : `zoom ${pct}% · world (${Math.round(wx)}, ${Math.round(wy as number)})`
  }
  const center = (): { x: number; y: number } => ({ x: stage.width / 2, y: stage.height / 2 })

  const bar = toolbar(host)
  bar.append(
    button('Zoom in', () => {
      stage.camera.zoomAt(center(), 1.2)
      update()
    }),
    button('Zoom out', () => {
      stage.camera.zoomAt(center(), 1 / 1.2)
      update()
    }),
    button('Reset', () => {
      stage.camera.reset()
      update()
    }),
  )
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Drag to pan · scroll to zoom about the cursor'
  bar.append(hint)
  const out = readout(bar, 'zoom 100%')

  let panning = false
  let last = { x: 0, y: 0 }
  stage.on('pointerdown', (e) => {
    panning = true
    last = { x: e.screenPoint.x, y: e.screenPoint.y }
    host.style.cursor = 'grabbing'
  })
  stage.on('pointermove', (e) => {
    if (panning) {
      stage.camera.panBy(e.screenPoint.x - last.x, e.screenPoint.y - last.y)
      last = { x: e.screenPoint.x, y: e.screenPoint.y }
    }
    const w = stage.screenToWorld(e.screenPoint)
    update(w.x, w.y)
  })
  stage.on('pointerup', () => {
    panning = false
    host.style.cursor = ''
  })
  stage.on('wheel', (e) => {
    e.preventDefault()
    stage.camera.zoomAt(e.screenPoint, e.deltaY < 0 ? 1.1 : 1 / 1.1)
    const w = stage.screenToWorld(e.screenPoint)
    update(w.x, w.y)
  })
  update()

  return () => {
    off()
    disposeStage(stage)
  }
}
