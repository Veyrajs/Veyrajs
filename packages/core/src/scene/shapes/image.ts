import { Bounds, type Vec2, rectCorners } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig, type ShapeHitKind, type ShapeHitOptions } from '../shape'

export interface ImageConfig extends ShapeConfig {
  image?: CanvasImageSource | null
  width?: number
  height?: number
}

/**
 * Bitmap image with a top-left local origin. `image` is any `CanvasImageSource`
 * (an `HTMLImageElement`, `HTMLCanvasElement`, `ImageBitmap`, …). Loading the source is
 * the caller's responsibility; the shape only draws what it is given.
 */
export class Image extends Shape {
  readonly type = 'Image'
  private _image: CanvasImageSource | null
  private _width: number
  private _height: number

  constructor(config: ImageConfig = {}) {
    super(config)
    this._image = config.image ?? null
    this._width = config.width ?? 0
    this._height = config.height ?? 0
  }

  get image(): CanvasImageSource | null {
    return this._image
  }
  set image(v: CanvasImageSource | null) {
    this._image = v
    this.markDirty()
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

  override getLocalBounds(): Bounds {
    return Bounds.fromRect(0, 0, this._width, this._height)
  }

  protected override serializedExtras(): Record<string, unknown> {
    // The bitmap is an asset; serialize size only (re-attach `image` on load).
    return { width: this._width, height: this._height }
  }

  drawOps(): DrawOp[] {
    if (this._image === null) return []
    return [
      { type: 'image', image: this._image, x: 0, y: 0, width: this._width, height: this._height },
    ]
  }

  override getVertices(): Vec2[] {
    return rectCorners(this._width, this._height)
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
    return null
  }
}
