import { AddNodeCommand, History, Rect } from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, readout, toolbar } from './_kit'

// Every meaningful change can be a reversible Command. Wrapping `layer.add` in an AddNodeCommand
// and running it through History makes each square individually undoable and redoable.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const history = new History()
  let i = 0

  const bar = toolbar(host)
  const undo = button('Undo', () => history.undo())
  const redo = button('Redo', () => history.redo())
  undo.disabled = true
  redo.disabled = true
  bar.append(
    button('Add square', () => {
      const n = i++
      history.run(
        new AddNodeCommand(
          layer,
          new Rect({
            x: 30 + (n % 8) * 72,
            y: 40 + Math.floor(n / 8) * 72,
            width: 58,
            height: 58,
            fill: cycle[n % cycle.length],
          }),
        ),
      )
    }),
    undo,
    redo,
  )
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Each add is a reversible command'
  bar.append(hint)
  const out = readout(bar, '')

  const sync = (): void => {
    undo.disabled = !history.canUndo
    redo.disabled = !history.canRedo
    out.textContent = `undo ${history.canUndo ? '●' : '○'} · redo ${history.canRedo ? '●' : '○'}`
  }
  const off = history.onChange(sync)
  sync()
  return () => {
    off()
    disposeStage(stage)
  }
}
