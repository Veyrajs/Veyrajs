import { Circle } from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, readout, toolbar } from './_kit'

// A stress test: thousands of tiny circles sharing ONE tooltip. The trick (the same one Konva
// uses) is delegation — a single pointermove handler hit-tests the layer and updates one DOM
// tooltip, instead of attaching a listener or a text node to every circle. The canvas draws the
// shapes once and then stays static; hover only runs a hit-test and repositions the tooltip.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()

  host.style.position = 'relative'
  const tip = document.createElement('div')
  tip.className = 'vy-tooltip'
  host.append(tip)

  const populate = (count: number): void => {
    layer.removeChildren()
    const w = stage.width
    const h = stage.height
    for (let i = 0; i < count; i++) {
      layer.add(
        new Circle({
          name: String(i),
          x: 6 + Math.random() * (w - 12),
          y: 6 + Math.random() * (h - 12),
          radius: 3,
          fill: cycle[i % cycle.length],
        }),
      )
    }
  }

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Hover the dots'
  bar.append(hint)
  const out = readout(bar, '')
  const setCount = (n: number): void => {
    populate(n)
    out.textContent = `${n.toLocaleString()} shapes`
  }
  bar.insertBefore(
    button('2k', () => setCount(2000)),
    hint,
  )
  bar.insertBefore(
    button('5k', () => setCount(5000)),
    hint,
  )
  bar.insertBefore(
    button('10k', () => setCount(10000)),
    hint,
  )
  setCount(2000)

  // rAF-throttle hover so a fast pointer can't outrun the O(n) hit-test on a big scene.
  let queued: { sx: number; sy: number; wx: number; wy: number } | null = null
  let frame = 0
  let lastHit = ''
  const run = (): void => {
    frame = 0
    if (!queued) return
    const q = queued
    queued = null
    const hit = stage.getIntersection({ x: q.wx, y: q.wy }, { tolerance: 2 })
    if (hit) {
      tip.style.display = 'block'
      tip.style.left = `${q.sx + 12}px`
      tip.style.top = `${q.sy + 12}px`
      if (hit.id !== lastHit) {
        lastHit = hit.id
        tip.textContent = `node #${hit.name} · ${(hit as Circle).fill}`
      }
    } else {
      lastHit = ''
      tip.style.display = 'none'
    }
  }
  stage.on('pointermove', (e) => {
    queued = { sx: e.screenPoint.x, sy: e.screenPoint.y, wx: e.worldPoint.x, wy: e.worldPoint.y }
    if (!frame) frame = requestAnimationFrame(run)
  })
  stage.on('pointerleave', () => {
    queued = null
    lastHit = ''
    tip.style.display = 'none'
  })

  return () => {
    if (frame) cancelAnimationFrame(frame)
    disposeStage(stage)
  }
}
