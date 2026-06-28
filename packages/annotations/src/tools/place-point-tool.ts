import type { Layer, SceneEvent, Stage } from '@veyrajs/core'
import { PointAnnotation } from '../nodes/point-annotation'
import type { DrawToolOptions, Tool } from './tool'

/** Click to place a {@link PointAnnotation} (keypoint) at the pointer. */
export class PlacePointTool implements Tool {
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
  }

  disable(): void {
    if (!this.enabled) return
    this.enabled = false
    this.stage.off('click', this.onClick)
  }

  private onClick = (e: SceneEvent): void => {
    const point = new PointAnnotation({
      x: e.worldPoint.x,
      y: e.worldPoint.y,
      ...this.options.defaults,
    })
    this.layer.add(point)
    this.options.onCreate?.(point)
  }
}
