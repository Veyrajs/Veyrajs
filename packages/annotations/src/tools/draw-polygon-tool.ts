import type { Layer, SceneEvent, Stage } from '@veyrajs/core'
import { PolygonAnnotation } from '../nodes/polygon-annotation'
import type { DrawToolOptions, Tool } from './tool'

export interface DrawPolygonToolOptions extends DrawToolOptions {
  /** Click within this many screen pixels of the first vertex to close. Default `12`. */
  closeDistance?: number
}

/**
 * Click to drop polygon vertices; click near the first vertex (with ≥3 points) — or call
 * `finish()` — to close the polygon.
 */
export class DrawPolygonTool implements Tool {
  private current: PolygonAnnotation | null = null
  private enabled = false

  constructor(
    private readonly stage: Stage,
    private readonly layer: Layer,
    private readonly options: DrawPolygonToolOptions = {},
  ) {}

  enable(): void {
    if (this.enabled) return
    this.enabled = true
    this.stage.on('click', this.onClick)
  }

  disable(): void {
    if (!this.enabled) return
    this.enabled = false
    this.stage.off('click', this.onClick)
    this.current?.remove()
    this.current = null
  }

  /** Commit the in-progress polygon (if it has ≥3 vertices). */
  finish(): void {
    const poly = this.current
    if (poly === null) return
    this.current = null
    if (poly.points.length >= 3) this.options.onCreate?.(poly)
    else poly.remove()
  }

  private onClick = (e: SceneEvent): void => {
    const p = { x: e.worldPoint.x, y: e.worldPoint.y }
    if (this.current === null) {
      this.current = new PolygonAnnotation({ points: [p], ...this.options.defaults })
      this.layer.add(this.current)
      return
    }
    const points = this.current.points
    const first = points[0]
    const closePx = (this.options.closeDistance ?? 12) / this.stage.camera.zoom
    if (
      points.length >= 3 &&
      first !== undefined &&
      Math.hypot(p.x - first.x, p.y - first.y) <= closePx
    ) {
      this.finish()
    } else {
      this.current.points = [...points, p]
    }
  }
}
