import { Rect } from '@veyrajs/core'
import { createStage, disposeStage, palette, readout, stroke, toolbar } from './_kit'

// Every SceneEvent carries the pointer in three spaces: screen pixels, world coordinates, and
// — via getLocalPoint(node) — the local space of any node. Move the pointer to watch all three.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const box = new Rect({
    x: 200,
    y: 90,
    width: 200,
    height: 150,
    fill: palette.blue,
    stroke: stroke.blue,
    strokeWidth: 2,
  })
  layer.add(box)

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Local coordinates are relative to the blue box'
  bar.append(hint)
  const out = readout(bar, 'move the pointer…')

  stage.on('pointermove', (e) => {
    const s = e.screenPoint
    const w = e.worldPoint
    const l = e.getLocalPoint(box)
    out.textContent = `screen (${Math.round(s.x)}, ${Math.round(s.y)}) · world (${Math.round(w.x)}, ${Math.round(w.y)}) · box (${Math.round(l.x)}, ${Math.round(l.y)})`
  })

  return () => disposeStage(stage)
}
