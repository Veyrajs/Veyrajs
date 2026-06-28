import type { Layer, SceneEvent, Stage } from '@veyrajs/core'
import { Skeleton } from '../nodes/skeleton'
import type { SkeletonSchema } from '../skeletons/schema'
import type { DrawToolOptions, Tool } from './tool'

/**
 * Click once per keypoint, in schema order; the skeleton is created when the last keypoint is
 * placed. Read `nextKeypoint` / `remaining` to drive a prompt in your UI.
 */
export class DrawSkeletonTool implements Tool {
  private placed: { x: number; y: number }[] = []
  private enabled = false

  constructor(
    private readonly stage: Stage,
    private readonly layer: Layer,
    private readonly schema: SkeletonSchema,
    private readonly options: DrawToolOptions = {},
  ) {}

  /** Name of the keypoint to place next, or `undefined` when complete. */
  get nextKeypoint(): string | undefined {
    return this.schema.keypoints[this.placed.length]
  }

  /** How many keypoints are still to place. */
  get remaining(): number {
    return this.schema.keypoints.length - this.placed.length
  }

  enable(): void {
    if (this.enabled) return
    this.enabled = true
    this.stage.on('click', this.onClick)
  }

  disable(): void {
    if (!this.enabled) return
    this.enabled = false
    this.stage.off('click', this.onClick)
    this.placed = []
  }

  private onClick = (e: SceneEvent): void => {
    this.placed.push({ x: e.worldPoint.x, y: e.worldPoint.y })
    if (this.placed.length < this.schema.keypoints.length) return
    const skeleton = new Skeleton({
      schema: this.schema,
      points: this.placed,
      ...this.options.defaults,
    })
    this.layer.add(skeleton)
    this.options.onCreate?.(skeleton)
    this.placed = []
  }
}
