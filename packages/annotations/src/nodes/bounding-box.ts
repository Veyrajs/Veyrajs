import { Bounds, distanceToPolyline } from '@veyrajs/core'
import type { DrawOp, ShapeHitKind, ShapeHitOptions, Vec2 } from '@veyrajs/core'
import { type AnnotationConfig, AnnotationNode } from './annotation-node'

export interface BoundingBoxConfig extends AnnotationConfig {
  width?: number
  height?: number
  /** Whether the box may be rotated (a SelectionController shows the rotate handle). Default `true`. */
  rotatable?: boolean
}

/**
 * A rectangular annotation. Local geometry spans `(0,0)` → `(width,height)`; set the node's
 * `rotation` for an oriented / rotated box (a `SelectionController` exposes move + resize + rotate).
 */
export class BoundingBox extends AnnotationNode {
  readonly type = 'BoundingBox'
  private _width: number
  private _height: number
  private _rotatable: boolean

  constructor(config: BoundingBoxConfig = {}) {
    // Sensible visual default so a freshly-drawn box is visible; config overrides.
    super({ stroke: '#2563eb', strokeWidth: 2, ...config })
    this._width = config.width ?? 0
    this._height = config.height ?? 0
    this._rotatable = config.rotatable ?? true
  }

  get width(): number {
    return this._width
  }
  set width(v: number) {
    if (v !== this._width) {
      this._width = v
      this.markDirty()
    }
  }

  get height(): number {
    return this._height
  }
  set height(v: number) {
    if (v !== this._height) {
      this._height = v
      this.markDirty()
    }
  }

  get rotatable(): boolean {
    return this._rotatable
  }
  set rotatable(v: boolean) {
    this._rotatable = v
  }

  private corners(): Vec2[] {
    return [
      { x: 0, y: 0 },
      { x: this._width, y: 0 },
      { x: this._width, y: this._height },
      { x: 0, y: this._height },
    ]
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromRect(0, 0, this._width, this._height)
  }

  drawOps(): DrawOp[] {
    return [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: this._width,
        height: this._height,
        ...this.fillStrokeStyle,
      },
      ...this.labelOps({ x: 0, y: 0 }),
    ]
  }

  override getVertices(): Vec2[] {
    return this.corners()
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    if (
      (options?.fill ?? true) &&
      p.x >= 0 &&
      p.y >= 0 &&
      p.x <= this._width &&
      p.y <= this._height
    ) {
      return 'fill'
    }
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      if (distanceToPolyline(p, this.corners(), true) <= band) return 'stroke'
    }
    return null
  }

  protected override serializedExtras(): Record<string, unknown> {
    return {
      ...super.serializedExtras(),
      width: this._width,
      height: this._height,
      rotatable: this._rotatable,
    }
  }
}
