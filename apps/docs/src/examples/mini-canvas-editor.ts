import {
  AddNodeCommand,
  Circle,
  History,
  Rect,
  RemoveNodeCommand,
  SelectionController,
  SelectionManager,
  Text,
} from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, roles, toolbar } from './_kit'

// A tiny editor that stitches several engine pieces together: SelectionController for
// select/move/resize/rotate, History + Add/RemoveNodeCommand for undoable add/delete, and
// stage.canvas.toDataURL() to export a PNG. Each adds a layer with no new engine code.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const history = new History()
  const selection = new SelectionManager()
  new SelectionController(stage, { selection, history })

  let colorIndex = 0
  const nextColor = (): string => cycle[colorIndex++ % cycle.length] as string
  const spot = (): { x: number; y: number } => ({
    x: stage.width / 2 + (Math.random() - 0.5) * 160,
    y: stage.height / 2 + (Math.random() - 0.5) * 90,
  })

  const add = (make: () => Rect | Circle | Text): void => {
    history.run(new AddNodeCommand(layer, make()))
  }

  const bar = toolbar(host)
  const undo = button('Undo', () => history.undo())
  const redo = button('Redo', () => history.redo())
  undo.disabled = true
  redo.disabled = true
  bar.append(
    button('+ Rect', () =>
      add(() => {
        const s = spot()
        return new Rect({ x: s.x - 60, y: s.y - 40, width: 120, height: 80, fill: nextColor() })
      }),
    ),
    button('+ Circle', () =>
      add(() => {
        const s = spot()
        return new Circle({ x: s.x, y: s.y, radius: 44, fill: nextColor() })
      }),
    ),
    button('+ Text', () =>
      add(() => {
        const s = spot()
        return new Text({
          x: s.x - 36,
          y: s.y - 14,
          text: 'Label',
          fontSize: 24,
          fill: roles().ink,
        })
      }),
    ),
    button('Delete', () => {
      const targets = [...selection.nodes]
      selection.clear()
      for (const n of targets) history.run(new RemoveNodeCommand(n))
    }),
    undo,
    redo,
    button('Export PNG', () => {
      selection.clear()
      stage.render()
      const url = stage.canvas?.toDataURL('image/png')
      if (!url) return
      const a = document.createElement('a')
      a.href = url
      a.download = 'veyrajs-scene.png'
      a.click()
    }),
  )
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Add · select & transform · delete · undo/redo · export'
  bar.append(hint)

  // Seed two shapes directly (not through history) so the first Undo doesn't empty the canvas.
  layer.add(
    new Rect({
      x: 120,
      y: 90,
      width: 150,
      height: 96,
      fill: cycle[0],
      stroke: '#0f172a',
      strokeWidth: 1,
    }),
    new Circle({ x: 380, y: 160, radius: 52, fill: cycle[1] }),
  )

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
