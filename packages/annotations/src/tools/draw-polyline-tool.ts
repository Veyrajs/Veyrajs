import type { Layer, SceneEvent, Stage } from '@veyrajs/core'
import { PolylineAnnotation } from '../nodes/polyline-annotation'
import type { DrawToolOptions, Tool } from './tool'

/**
 * Click to drop polyline vertices; double-click — or call `finish()` — to end the line. (The
 * double-click's extra near-duplicate vertex is dropped on finish.)
 */
export class DrawPolylineTool implements Tool {
  private current: PolylineAnnotation | null = null
  private enabled = false

  constructor(
    private readonly stage: Stage,
    private readonly layer: Layer,
    private readonly options: DrawToolOptions = {},
  ) {}

  enable(): void {
    if (this.enabled) return
    this.enabled = true
    this.stage.on('click', this.onClick)
    this.stage.on('dblclick', this.onDblClick)
  }

  disable(): void {
    if (!this.enabled) return
    this.enabled = false
    this.stage.off('click', this.onClick)
    this.stage.off('dblclick', this.onDblClick)
    this.current?.remove()
    this.current = null
  }

  /** Commit the in-progress polyline (if it has ≥2 vertices). */
  finish(): void {
    const line = this.current
    if (line === null) return
    this.current = null
    if (line.points.length >= 2) this.options.onCreate?.(line)
    else line.remove()
  }

  private onClick = (e: SceneEvent): void => {
    const p = { x: e.worldPoint.x, y: e.worldPoint.y }
    if (this.current === null) {
      this.current = new PolylineAnnotation({ points: [p], ...this.options.defaults })
      this.layer.add(this.current)
    } else {
      this.current.points = [...this.current.points, p]
    }
  }

  private onDblClick = (): void => {
    // The dblclick fired two clicks first; drop the near-duplicate last vertex, then finish.
    if (this.current !== null && this.current.points.length > 2) {
      this.current.points = this.current.points.slice(0, -1)
    }
    this.finish()
  }
}
