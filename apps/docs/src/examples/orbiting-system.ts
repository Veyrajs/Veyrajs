import { Circle } from '@veyrajs/core'
import { createStage, disposeStage, palette, toolbar } from './_kit'

// Angle-driven motion: each planet's position is recomputed every frame from a growing time
// value and its orbit radius/rate. The small indigo moon orbits the second planet — its center
// is just the planet's position plus its own offset.
export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  const layer = stage.createLayer()
  const sun = new Circle({ radius: 22, fill: palette.amber })
  const planets = [
    { orbit: 72, rate: 1.7, node: new Circle({ radius: 10, fill: palette.blue }) },
    { orbit: 124, rate: 1.05, node: new Circle({ radius: 15, fill: palette.cyan }) },
    { orbit: 186, rate: 0.62, node: new Circle({ radius: 9, fill: palette.teal }) },
  ]
  const moon = new Circle({ radius: 5, fill: palette.indigo })
  layer.add(sun, ...planets.map((p) => p.node), moon)

  let t = 0
  let raf = 0
  const tick = (): void => {
    t += 0.016
    const cx = stage.width / 2
    const cy = stage.height / 2
    sun.x = cx
    sun.y = cy
    for (const p of planets) {
      p.node.x = cx + Math.cos(t * p.rate) * p.orbit
      p.node.y = cy + Math.sin(t * p.rate) * p.orbit
    }
    const earth = planets[1].node
    moon.x = earth.x + Math.cos(t * 4) * 30
    moon.y = earth.y + Math.sin(t * 4) * 30
    stage.requestRender()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  const bar = toolbar(host)
  const hint = document.createElement('span')
  hint.className = 'veyrajs-demo__hint'
  hint.textContent = 'Positions recomputed each frame from orbit angles'
  bar.append(hint)

  return () => {
    cancelAnimationFrame(raf)
    disposeStage(stage)
  }
}
