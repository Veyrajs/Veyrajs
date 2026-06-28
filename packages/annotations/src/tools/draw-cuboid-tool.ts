import type { Layer, SceneEvent, Stage, Vec2 } from '@veyrajs/core'
import { Cuboid } from '../nodes/cuboid'
import type { DrawToolOptions, Tool } from './tool'

export interface DrawCuboidToolOptions extends DrawToolOptions {
  /** Minimum front-face size (world units) to keep the cuboid. Default `8`. */
  minSize?: number
}

/**
 * Drag to draw the front face; a default depth offset gives the box its third dimension. The
 * eight corners can then be fine-tuned with a `VertexEditor`.
 */
export class DrawCuboidTool implements Tool {
  private start: Vec2 | null = null
  private preview: Cuboid | null = null
  private enabled = false

  constructor(
    private readonly stage: Stage,
    private readonly layer: Layer,
    private readonly options: DrawCuboidToolOptions = {},
  ) {}

  enable(): void {
    if (this.enabled) return
    this.enabled = true
    this.stage.on('pointerdown', this.onDown)
    this.stage.on('pointermove', this.onMove)
    this.stage.on('pointerup', this.onUp)
  }

  disable(): void {
    if (!this.enabled) return
    this.enabled = false
    this.stage.off('pointerdown', this.onDown)
    this.stage.off('pointermove', this.onMove)
    this.stage.off('pointerup', this.onUp)
    this.preview?.remove()
    this.preview = null
    this.start = null
  }

  private cornersFor(a: Vec2, b: Vec2): Vec2[] {
    const x1 = Math.min(a.x, b.x)
    const y1 = Math.min(a.y, b.y)
    const x2 = Math.max(a.x, b.x)
    const y2 = Math.max(a.y, b.y)
    const depth = Math.max(12, (x2 - x1) * 0.3)
    const front: Vec2[] = [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 },
      { x: x1, y: y2 },
    ]
    const back = front.map((p) => ({ x: p.x + depth, y: p.y - depth }))
    return [...front, ...back]
  }

  private onDown = (e: SceneEvent): void => {
    this.start = { x: e.worldPoint.x, y: e.worldPoint.y }
    this.preview = new Cuboid({
      points: this.cornersFor(this.start, this.start),
      ...this.options.defaults,
    })
    this.layer.add(this.preview)
  }

  private onMove = (e: SceneEvent): void => {
    if (this.start === null || this.preview === null) return
    this.preview.points = this.cornersFor(this.start, e.worldPoint)
  }

  private onUp = (e: SceneEvent): void => {
    const cuboid = this.preview
    const start = this.start
    this.preview = null
    this.start = null
    if (cuboid === null || start === null) return
    const min = this.options.minSize ?? 8
    if (Math.abs(e.worldPoint.x - start.x) >= min && Math.abs(e.worldPoint.y - start.y) >= min) {
      this.options.onCreate?.(cuboid)
    } else {
      cuboid.remove()
    }
  }
}
