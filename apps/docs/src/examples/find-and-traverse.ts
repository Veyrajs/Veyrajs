import { Circle, Rect, type Shape } from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, onThemeChange, roles, toolbar } from './_kit'

// Query the scene graph: `find` returns the first matching node, `traverse` visits every
// descendant. Here we match shapes by type (instanceof) and by name, then outline the results.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  layer.add(
    new Rect({ name: 'hero', x: 60, y: 60, width: 120, height: 80, fill: cycle[0] }),
    new Circle({ name: 'orbit', x: 260, y: 96, radius: 44, fill: cycle[1] }),
    new Rect({ name: 'panel', x: 360, y: 60, width: 120, height: 80, fill: cycle[2] }),
    new Circle({ name: 'orbit', x: 520, y: 96, radius: 44, fill: cycle[3] }),
    new Rect({ name: 'panel', x: 170, y: 188, width: 120, height: 70, fill: cycle[4] }),
  )

  let current: Shape[] = []
  const setMatches = (next: Shape[]): void => {
    for (const s of current) {
      s.stroke = null
      s.strokeWidth = 0
    }
    current = next
    const ink = roles().ink
    for (const s of current) {
      s.stroke = ink
      s.strokeWidth = 3
    }
    stage.requestRender()
  }
  const collect = (match: (n: import('@veyrajs/core').Node) => boolean): Shape[] => {
    const out: Shape[] = []
    layer.traverse((n) => {
      if (match(n)) out.push(n as Shape)
    })
    return out
  }

  const bar = toolbar(host)
  bar.append(
    button('All Rects', () => setMatches(collect((n) => n instanceof Rect))),
    button('All Circles', () => setMatches(collect((n) => n instanceof Circle))),
    button('find "hero"', () => {
      const hit = layer.find((n) => n.name === 'hero')
      setMatches(hit ? [hit as Shape] : [])
    }),
    button('name = "orbit"', () => setMatches(collect((n) => n.name === 'orbit'))),
    button('Clear', () => setMatches([])),
  )
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Match shapes by type or name'
  bar.append(hint)

  const off = onThemeChange(() => {
    const ink = roles().ink
    for (const s of current) s.stroke = ink
  })
  return () => {
    off()
    disposeStage(stage)
  }
}
