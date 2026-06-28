import { Circle, History, Rect, SelectionController } from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, palette, stroke, toolbar } from './_kit'

// SelectionController wires click-to-select, drag-to-move, and resize/rotate handles. Because
// we hand it a History, every drag/resize/rotate becomes an undoable command for free.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const history = new History()
  new SelectionController(stage, { history })

  layer.add(
    new Rect({
      x: 90,
      y: 80,
      width: 160,
      height: 96,
      fill: palette.blue,
      stroke: stroke.blue,
      strokeWidth: 2,
    }),
    new Circle({ x: 360, y: 150, radius: 56, fill: palette.cyan }),
  )

  let colorIndex = 0
  const nextColor = (): string => cycle[colorIndex++ % cycle.length] as string
  const rand = (max: number): number => Math.random() * Math.max(1, max)

  const bar = toolbar(host)
  const addRect = button('+ Rect', () => {
    const w = 70 + Math.random() * 130
    const h = 50 + Math.random() * 90
    layer.add(
      new Rect({
        x: 30 + rand(stage.width - w - 60),
        y: 30 + rand(stage.height - h - 60),
        width: w,
        height: h,
        fill: nextColor(),
      }),
    )
  })
  const addCircle = button('+ Circle', () => {
    const r = 28 + Math.random() * 44
    layer.add(
      new Circle({
        x: 30 + r + rand(stage.width - 2 * r - 60),
        y: 30 + r + rand(stage.height - 2 * r - 60),
        radius: r,
        fill: nextColor(),
      }),
    )
  })
  const undo = button('Undo', () => history.undo())
  const redo = button('Redo', () => history.redo())
  undo.disabled = true
  redo.disabled = true
  bar.append(
    addRect,
    addCircle,
    undo,
    redo,
    button('Reset view', () => stage.camera.reset()),
  )
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Click a shape · drag the handles · scroll to zoom'
  bar.append(hint)

  stage.on('wheel', (e) => {
    e.preventDefault()
    stage.camera.zoomAt(e.screenPoint, e.deltaY < 0 ? 1.1 : 1 / 1.1)
  })

  const sync = (): void => {
    undo.disabled = !history.canUndo
    redo.disabled = !history.canRedo
  }
  const offHist = history.onChange(sync)
  sync()

  return () => {
    offHist()
    disposeStage(stage)
  }
}
