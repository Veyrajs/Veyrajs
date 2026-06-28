import type { Layer, SceneEvent, Stage } from '@veyrajs/core'
import { BoundingBox } from '../nodes/bounding-box'
import type { DrawToolOptions, Tool } from './tool'

export interface DrawBoxToolOptions extends DrawToolOptions {
  /** Minimum width/height (world units) for a box to be kept on pointerup. Default `4`. */
  minSize?: number
}

/** Drag on the background to draw a {@link BoundingBox}. */
export class DrawBoxTool implements Tool {
  private start: { x: number; y: number } | null = null
  private preview: BoundingBox | null = null
  private enabled = false

  constructor(
    private readonly stage: Stage,
    private readonly layer: Layer,
    private readonly options: DrawBoxToolOptions = {},
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

  private onDown = (e: SceneEvent): void => {
    this.start = { x: e.worldPoint.x, y: e.worldPoint.y }
    this.preview = new BoundingBox({
      x: this.start.x,
      y: this.start.y,
      width: 0,
      height: 0,
      ...this.options.defaults,
    })
    this.layer.add(this.preview)
  }

  private onMove = (e: SceneEvent): void => {
    if (this.start === null || this.preview === null) return
    this.preview.x = Math.min(this.start.x, e.worldPoint.x)
    this.preview.y = Math.min(this.start.y, e.worldPoint.y)
    this.preview.width = Math.abs(e.worldPoint.x - this.start.x)
    this.preview.height = Math.abs(e.worldPoint.y - this.start.y)
  }

  private onUp = (): void => {
    const box = this.preview
    this.preview = null
    this.start = null
    if (box === null) return
    const min = this.options.minSize ?? 4
    if (box.width >= min && box.height >= min) {
      this.options.onCreate?.(box)
    } else {
      box.remove()
    }
  }
}
