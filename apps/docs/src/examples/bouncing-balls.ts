import { Circle } from '@veyrajs/core'
import { button, createStage, cycle, disposeStage, toolbar } from './_kit'

// Veyrajs ships no tween engine on purpose — you animate by mutating node properties inside a
// requestAnimationFrame loop and calling stage.requestRender(). Here: balls with velocity that
// bounce off the walls.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const R = 16
  const balls = Array.from({ length: 26 }, (_, i) => {
    const node = new Circle({
      x: R + Math.random() * (stage.width - 2 * R),
      y: R + Math.random() * (stage.height - 2 * R),
      radius: R,
      fill: cycle[i % cycle.length],
    })
    layer.add(node)
    const angle = Math.random() * Math.PI * 2
    const speed = 1.5 + Math.random() * 2
    return { node, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }
  })

  let running = true
  let raf = 0
  const tick = (): void => {
    const w = stage.width
    const h = stage.height
    for (const b of balls) {
      b.node.x += b.vx
      b.node.y += b.vy
      if (b.node.x < R) {
        b.node.x = R
        b.vx = Math.abs(b.vx)
      } else if (b.node.x > w - R) {
        b.node.x = w - R
        b.vx = -Math.abs(b.vx)
      }
      if (b.node.y < R) {
        b.node.y = R
        b.vy = Math.abs(b.vy)
      } else if (b.node.y > h - R) {
        b.node.y = h - R
        b.vy = -Math.abs(b.vy)
      }
    }
    stage.requestRender()
    if (running) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  const bar = toolbar(host)
  const toggle = button('Pause', () => {
    running = !running
    toggle.textContent = running ? 'Pause' : 'Play'
    if (running) raf = requestAnimationFrame(tick)
  })
  bar.append(toggle)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'No tween engine — just rAF + requestRender()'
  bar.append(hint)

  return () => {
    running = false
    cancelAnimationFrame(raf)
    disposeStage(stage)
  }
}
