import { Bounds, distanceToPolyline } from '@veyrajs/core'
import type { DrawOp, ShapeHitKind, ShapeHitOptions, Vec2 } from '@veyrajs/core'
import type { SkeletonSchema } from '../skeletons/schema'
import { type AnnotationConfig, AnnotationNode } from './annotation-node'

export interface SkeletonConfig extends AnnotationConfig {
  /** The keypoint/bone layout. Swap in your own or use a preset (e.g. `COCO_17`). Defaults to empty. */
  schema?: SkeletonSchema
  /** Keypoint positions in schema order (local space). Defaults to all-zero. */
  points?: Vec2[]
  /** Keypoint marker radius. Default `4`. */
  jointRadius?: number
}

/**
 * A keypoint skeleton: markers for each keypoint plus bones between them, driven by a
 * {@link SkeletonSchema}. Edit the keypoints with a `VertexEditor` (one handle per keypoint).
 */
export class Skeleton extends AnnotationNode {
  readonly type = 'Skeleton'
  private _schema: SkeletonSchema
  private _points: Vec2[]
  private _jointRadius: number

  constructor(config: SkeletonConfig = {}) {
    super({ stroke: '#2563eb', strokeWidth: 2, ...config })
    this._schema = config.schema ?? { keypoints: [], edges: [] }
    const fallback = this._schema.keypoints.map(() => ({ x: 0, y: 0 }))
    this._points = (config.points ?? fallback).map((p) => ({ x: p.x, y: p.y }))
    this._jointRadius = config.jointRadius ?? 4
  }

  get schema(): SkeletonSchema {
    return this._schema
  }
  set schema(v: SkeletonSchema) {
    if (v !== this._schema) {
      this._schema = v
      this.markDirty()
    }
  }

  get jointRadius(): number {
    return this._jointRadius
  }
  set jointRadius(v: number) {
    if (v !== this._jointRadius) {
      this._jointRadius = v
      this.markDirty()
    }
  }

  get points(): readonly Vec2[] {
    return this._points
  }
  set points(v: readonly Vec2[]) {
    this._points = v.map((p) => ({ x: p.x, y: p.y }))
    this.markDirty()
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromPoints(this._points)
  }

  override getVertices(): readonly Vec2[] {
    return this._points
  }

  drawOps(): DrawOp[] {
    const stroke = this.stroke ?? '#2563eb'
    const ops: DrawOp[] = []
    for (const [a, b] of this._schema.edges) {
      const pa = this._points[a]
      const pb = this._points[b]
      if (pa !== undefined && pb !== undefined) {
        ops.push({
          type: 'polygon',
          points: [pa, pb],
          closed: false,
          stroke,
          strokeWidth: this.strokeWidth,
          lineCap: 'round',
        })
      }
    }
    const r = this._jointRadius
    for (const kp of this._points) {
      ops.push({
        type: 'ellipse',
        x: kp.x,
        y: kp.y,
        radiusX: r,
        radiusY: r,
        fill: stroke,
        stroke: '#ffffff',
        strokeWidth: 1,
      })
    }
    ops.push(...this.labelOps(this.labelAnchor()))
    return ops
  }

  private labelAnchor(): Vec2 {
    if (this._points.length === 0) return { x: 0, y: 0 }
    return this._points.reduce((a, b) => (b.y < a.y || (b.y === a.y && b.x < a.x) ? b : a))
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    const tol = options?.tolerance ?? 0
    for (const kp of this._points) {
      if (Math.hypot(p.x - kp.x, p.y - kp.y) <= this._jointRadius + tol) return 'fill'
    }
    if (options?.stroke ?? true) {
      const band = tol + this.strokeWidth / 2
      for (const [a, b] of this._schema.edges) {
        const pa = this._points[a]
        const pb = this._points[b]
        if (
          pa !== undefined &&
          pb !== undefined &&
          distanceToPolyline(p, [pa, pb], false) <= band
        ) {
          return 'stroke'
        }
      }
    }
    return null
  }

  protected override serializedExtras(): Record<string, unknown> {
    return {
      ...super.serializedExtras(),
      schema: {
        keypoints: [...this._schema.keypoints],
        edges: this._schema.edges.map((e) => [e[0], e[1]]),
      },
      points: this._points.map((p) => ({ x: p.x, y: p.y })),
      jointRadius: this._jointRadius,
    }
  }
}
