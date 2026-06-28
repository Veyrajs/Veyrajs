import { Circle, type Layer, Rect, SceneSerializer } from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, readout, toolbar } from './_kit'

// SceneSerializer round-trips the scene through plain JSON: `stringify` walks the stage to a
// document, `parse` rebuilds it. Add shapes, Save, Clear, then Load to restore the saved state.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  let layer = stage.createLayer()
  const serializer = new SceneSerializer()
  let saved: string | null = null
  let colorIndex = 0

  layer.add(
    new Rect({ x: 60, y: 60, width: 130, height: 80, fill: cycle[0] }),
    new Circle({ x: 330, y: 120, radius: 48, fill: cycle[1] }),
  )

  const bar = toolbar(host)
  const load = button('Load', () => {
    if (!saved) return
    serializer.parse(stage, saved)
    layer = stage.children[0] as Layer
  })
  load.disabled = true
  bar.append(
    button('+ Shape', () => {
      const color = cycle[colorIndex++ % cycle.length]
      if (Math.random() < 0.5) {
        const w = 60 + Math.random() * 110
        layer.add(
          new Rect({
            x: 30 + Math.random() * (stage.width - w - 60),
            y: 30 + Math.random() * (stage.height - 130),
            width: w,
            height: 50 + Math.random() * 60,
            fill: color,
          }),
        )
      } else {
        const r = 26 + Math.random() * 38
        layer.add(
          new Circle({
            x: 50 + Math.random() * (stage.width - 100),
            y: 50 + Math.random() * (stage.height - 100),
            radius: r,
            fill: color,
          }),
        )
      }
    }),
    button('Save', () => {
      saved = serializer.stringify(stage)
      out.textContent = `saved ${new Blob([saved]).size} bytes`
      load.disabled = false
    }),
    button('Clear', () => layer.removeChildren()),
    load,
  )
  const out = readout(bar, 'nothing saved')

  return () => disposeStage(stage)
}
