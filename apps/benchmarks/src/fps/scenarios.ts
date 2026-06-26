import type { Shape, Stage, Vec2 } from '@veyrajs/core'

export interface ScenarioContext {
  stage: Stage
  shapes: Shape[]
  width: number
  height: number
}

export interface Scenario {
  id: string
  label: string
  /**
   * Per-frame work. Either mutates the scene (the engine's scheduler auto-renders on the next
   * frame) or calls `stage.render()` directly for a pure redraw. Exactly one render happens
   * per frame either way, so the harness's rAF-interval FPS stays honest.
   */
  update(ctx: ScenarioContext, now: number): void
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'static',
    label: 'Static redraw',
    update(ctx) {
      // Nothing is dirty → measures raw draw throughput of an unchanging scene.
      ctx.stage.render()
    },
  },
  {
    id: 'move',
    label: 'Translate all',
    update(ctx, now) {
      const t = now / 1000
      const shapes = ctx.shapes
      for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i]
        if (s === undefined) continue
        s.x += Math.sin(t + i) * 0.5
        s.y += Math.cos(t + i) * 0.5
      }
    },
  },
  {
    id: 'rotate',
    label: 'Rotate all',
    update(ctx, now) {
      const d = now / 16
      const shapes = ctx.shapes
      for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i]
        if (s !== undefined) s.rotation = (d + i) % 360
      }
    },
  },
  {
    id: 'zoompan',
    label: 'Zoom + pan',
    update(ctx, now) {
      const t = now / 1000
      ctx.stage.camera.setZoom(1 + Math.sin(t) * 0.4)
      ctx.stage.camera.panTo(Math.sin(t * 0.7) * 120, Math.cos(t * 0.7) * 120)
    },
  },
  {
    id: 'hittest',
    label: 'Hit-test moving point',
    update(ctx, now) {
      const t = now / 1000
      const screen: Vec2 = {
        x: (Math.sin(t) * 0.5 + 0.5) * ctx.width,
        y: (Math.cos(t * 1.3) * 0.5 + 0.5) * ctx.height,
      }
      ctx.stage.getIntersection(ctx.stage.screenToWorld(screen), { tolerance: 4 })
      ctx.stage.render() // hit-test does not dirty; redraw so the frame does real work
    },
  },
]
