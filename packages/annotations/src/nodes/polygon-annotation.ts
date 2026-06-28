import { Bounds, distanceToPolyline, pointInPolygon } from '@veyrajs/core'
import type { DrawOp, ShapeHitKind, ShapeHitOptions, Vec2 } from '@veyrajs/core'
import { type AnnotationConfig, AnnotationNode } from './annotation-node'

export interface PolygonAnnotationConfig extends AnnotationConfig {
  points?: Vec2[]
}

/**
 * A closed polygon annotation with editable vertices (see `VertexEditor`). Points are in the
 * node's local space; the label chip anchors to the top-most vertex.
 */
export class PolygonAnnotation extends AnnotationNode {
  readonly type = 'PolygonAnnotation'
  private _points: Vec2[]

  constructor(config: PolygonAnnotationConfig = {}) {
    super({ stroke: '#2563eb', strokeWidth: 2, ...config })
    this._points = (config.points ?? []).map((p) => ({ x: p.x, y: p.y }))
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

  drawOps(): DrawOp[] {
    return [
      { type: 'polygon', points: this._points, closed: true, ...this.fillStrokeStyle },
      ...this.labelOps(this.labelAnchor()),
    ]
  }

  private labelAnchor(): Vec2 {
    if (this._points.length === 0) return { x: 0, y: 0 }
    return this._points.reduce((a, b) => (b.y < a.y || (b.y === a.y && b.x < a.x) ? b : a))
  }

  override getVertices(): readonly Vec2[] {
    return this._points
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    if ((options?.fill ?? true) && pointInPolygon(p, this._points)) return 'fill'
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      if (distanceToPolyline(p, this._points, true) <= band) return 'stroke'
    }
    return null
  }

  protected override serializedExtras(): Record<string, unknown> {
    return { ...super.serializedExtras(), points: this._points.map((p) => ({ x: p.x, y: p.y })) }
  }
}
