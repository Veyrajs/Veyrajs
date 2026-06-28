import { Circle, Rect } from '@veyrajs/core'
import { createStage, cycle, disposeStage, onThemeChange, roles, toolbar } from './_kit'

// pointerenter / pointerleave fire per shape and do NOT bubble, which makes them ideal for
// hover affordances: outline the shape under the pointer and switch the cursor.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const shapes = [
    new Rect({ x: 70, y: 80, width: 150, height: 100, fill: cycle[0] }),
    new Circle({ x: 320, y: 130, radius: 62, fill: cycle[1] }),
    new Rect({ x: 440, y: 80, width: 150, height: 100, fill: cycle[2] }),
  ]
  let hovered: Rect | Circle | null = null
  for (const s of shapes) {
    layer.add(s)
    s.on('pointerenter', () => {
      hovered = s
      s.stroke = roles().ink
      s.strokeWidth = 3
      host.style.cursor = 'pointer'
    })
    s.on('pointerleave', () => {
      hovered = null
      s.stroke = null
      s.strokeWidth = 0
      host.style.cursor = ''
    })
  }

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Hover a shape — enter/leave do not bubble'
  bar.append(hint)

  // Keep the hover outline legible if the theme flips mid-hover.
  const off = onThemeChange(() => {
    if (hovered) hovered.stroke = roles().ink
  })
  return () => {
    off()
    disposeStage(stage)
  }
}
