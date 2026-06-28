import { Circle, Rect } from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, onThemeChange, roles, toolbar } from './_kit'

// Z-order is simply the child order within a layer. Click a shape to select it, then
// moveToTop / moveToBottom / moveUp / moveDown reorder it among its siblings.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const shapes = [
    new Rect({ x: 90, y: 70, width: 150, height: 110, fill: cycle[0] }),
    new Circle({ x: 230, y: 150, radius: 78, fill: cycle[1] }),
    new Rect({ x: 320, y: 90, width: 150, height: 110, fill: cycle[2] }),
    new Circle({ x: 450, y: 150, radius: 78, fill: cycle[3] }),
  ]
  for (const s of shapes) layer.add(s)
  let selected = shapes[0]

  const refresh = (): void => {
    const ink = roles().ink
    for (const s of shapes) {
      s.stroke = s === selected ? ink : null
      s.strokeWidth = s === selected ? 3 : 0
    }
    stage.requestRender()
  }
  stage.on('click', (e) => {
    const hit = shapes.find((s) => s === e.target)
    if (hit) {
      selected = hit
      refresh()
    }
  })

  const bar = toolbar(host)
  bar.append(
    button('Bring to front', () => {
      layer.moveToTop(selected)
      stage.requestRender()
    }),
    button('Send to back', () => {
      layer.moveToBottom(selected)
      stage.requestRender()
    }),
    button('Forward', () => {
      layer.moveUp(selected)
      stage.requestRender()
    }),
    button('Backward', () => {
      layer.moveDown(selected)
      stage.requestRender()
    }),
  )
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Click a shape, then restack it'
  bar.append(hint)

  const off = onThemeChange(refresh)
  refresh()
  return () => {
    off()
    disposeStage(stage)
  }
}
