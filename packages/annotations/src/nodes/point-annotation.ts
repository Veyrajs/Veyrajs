import { Bounds } from '@veyrajs/core'
import type { DrawOp, ShapeHitKind, ShapeHitOptions, Vec2 } from '@veyrajs/core'
import { type AnnotationConfig, AnnotationNode } from './annotation-node'

export interface PointAnnotationConfig extends AnnotationConfig {
  /** Marker radius in local units. Default `5`. */
  radius?: number
}

/**
 * A single keypoint / point annotation, drawn as a small ring at the node's origin. Move it by
 * dragging the node (e.g. via a `SelectionController`); the label sits just above the marker.
 */
export class PointAnnotation extends AnnotationNode {
  readonly type = 'PointAnnotation'
  private _radius: number

  constructor(config: PointAnnotationConfig = {}) {
    super({ stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff', ...config })
    this._radius = config.radius ?? 5
  }

  get radius(): number {
    return this._radius
  }
  set radius(v: number) {
    if (v !== this._radius) {
      this._radius = v
      this.markDirty()
    }
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromRect(-this._radius, -this._radius, this._radius * 2, this._radius * 2)
  }

  drawOps(): DrawOp[] {
    return [
      {
        type: 'ellipse',
        x: 0,
        y: 0,
        radiusX: this._radius,
        radiusY: this._radius,
        ...this.fillStrokeStyle,
      },
      ...this.labelOps({ x: 0, y: -this._radius }),
    ]
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    const d = Math.hypot(p.x, p.y)
    const band =
      (options?.tolerance ?? 0) + this._radius + (this.stroke !== null ? this.strokeWidth / 2 : 0)
    return d <= band ? 'fill' : null
  }

  protected override serializedExtras(): Record<string, unknown> {
    return { ...super.serializedExtras(), radius: this._radius }
  }
}
