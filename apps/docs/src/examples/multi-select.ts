import { Circle, Rect, SelectionController, SelectionManager } from '@veyrajs/core'
import { createStage, cycle, disposeStage, readout, toolbar } from './_kit'

// SelectionController already handles multi-selection: drag a marquee across shapes, or
// shift-click to add and remove. Passing it our own SelectionManager lets us read the live
// selection — here, just to show the count.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const selection = new SelectionManager()
  new SelectionController(stage, { selection })

  for (let i = 0; i < 8; i++) {
    const x = 70 + (i % 4) * 140
    const y = 80 + Math.floor(i / 4) * 130
    layer.add(
      i % 2 === 0
        ? new Rect({ x: x - 45, y: y - 35, width: 90, height: 70, fill: cycle[i % cycle.length] })
        : new Circle({ x, y, radius: 40, fill: cycle[i % cycle.length] }),
    )
  }

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Drag a marquee · shift-click to add/remove'
  bar.append(hint)
  const out = readout(bar, '0 selected')

  const off = selection.onChange(() => {
    out.textContent = `${selection.size} selected`
  })
  return () => {
    off()
    disposeStage(stage)
  }
}
