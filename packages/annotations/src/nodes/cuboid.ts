import { Bounds, distanceToPolyline, pointInPolygon } from '@veyrajs/core'
import type { DrawOp, ShapeHitKind, ShapeHitOptions, Vec2 } from '@veyrajs/core'
import { type AnnotationConfig, AnnotationNode } from './annotation-node'

const FRONT = [0, 1, 2, 3]
const BACK = [4, 5, 6, 7]
const CONNECTORS: readonly (readonly [number, number])[] = [
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
]

export interface CuboidConfig extends AnnotationConfig {
  /** Eight corners: front face (indices 0–3) then the matching back face (4–7). */
  points?: Vec2[]
}

/**
 * A 3D-style box drawn in 2D: a front and back face joined by four edges. Eight editable vertices
 * (front 0–3, back 4–7); the front face is filled, the rest stroked.
 */
export class Cuboid extends AnnotationNode {
  readonly type = 'Cuboid'
  private _points: Vec2[]

  constructor(config: CuboidConfig = {}) {
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

  override getVertices(): readonly Vec2[] {
    return this._points
  }

  private face(indices: readonly number[]): Vec2[] {
    const out: Vec2[] = []
    for (const i of indices) {
      const p = this._points[i]
      if (p !== undefined) out.push(p)
    }
    return out
  }

  drawOps(): DrawOp[] {
    const stroke = this.stroke ?? '#2563eb'
    const ops: DrawOp[] = [
      {
        type: 'polygon',
        points: this.face(BACK),
        closed: true,
        fill: null,
        stroke,
        strokeWidth: this.strokeWidth,
      },
    ]
    for (const [a, b] of CONNECTORS) {
      const pa = this._points[a]
      const pb = this._points[b]
      if (pa !== undefined && pb !== undefined) {
        ops.push({
          type: 'polygon',
          points: [pa, pb],
          closed: false,
          fill: null,
          stroke,
          strokeWidth: this.strokeWidth,
        })
      }
    }
    ops.push({ type: 'polygon', points: this.face(FRONT), closed: true, ...this.fillStrokeStyle })
    ops.push(...this.labelOps(this.labelAnchor()))
    return ops
  }

  private labelAnchor(): Vec2 {
    if (this._points.length === 0) return { x: 0, y: 0 }
    return this._points.reduce((a, b) => (b.y < a.y || (b.y === a.y && b.x < a.x) ? b : a))
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    const front = this.face(FRONT)
    if ((options?.fill ?? true) && front.length === 4 && pointInPolygon(p, front)) return 'fill'
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + this.strokeWidth / 2
      for (const face of [front, this.face(BACK)]) {
        if (face.length >= 2 && distanceToPolyline(p, face, true) <= band) return 'stroke'
      }
      for (const [a, b] of CONNECTORS) {
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
    return { ...super.serializedExtras(), points: this._points.map((p) => ({ x: p.x, y: p.y })) }
  }
}
