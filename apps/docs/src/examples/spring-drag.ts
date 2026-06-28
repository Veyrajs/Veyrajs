import { Circle, Line } from '@veyrajs/core'
import { createStage, disposeStage, palette, toolbar } from './_kit'

// The blue dot chases the pointer with a simple spring — each frame, acceleration pulls it toward
// the target, velocity is damped, and the position integrates. A trailing line shows the lag.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const target = { x: 0, y: 0 }
  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  let primed = false

  const link = new Line({
    points: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    stroke: palette.slate,
    strokeWidth: 2,
  })
  const anchor = new Circle({ radius: 5, fill: palette.amber })
  const dot = new Circle({ radius: 16, fill: palette.blue })
  layer.add(link, anchor, dot)

  stage.on('pointermove', (e) => {
    target.x = e.worldPoint.x
    target.y = e.worldPoint.y
    if (!primed) {
      primed = true
      pos.x = target.x
      pos.y = target.y
    }
  })

  const stiffness = 0.08
  const damping = 0.78
  let raf = 0
  const tick = (): void => {
    vel.x = (vel.x + (target.x - pos.x) * stiffness) * damping
    vel.y = (vel.y + (target.y - pos.y) * stiffness) * damping
    pos.x += vel.x
    pos.y += vel.y
    dot.x = pos.x
    dot.y = pos.y
    anchor.x = target.x
    anchor.y = target.y
    link.points = [
      { x: target.x, y: target.y },
      { x: pos.x, y: pos.y },
    ]
    stage.requestRender()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Move the pointer — the dot springs toward it'
  bar.append(hint)

  return () => {
    cancelAnimationFrame(raf)
    disposeStage(stage)
  }
}
