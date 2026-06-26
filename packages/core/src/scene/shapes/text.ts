import { Bounds, type Vec2 } from '../../math'
import type { DrawOp } from '../../render/draw-ops'
import { Shape, type ShapeConfig, type ShapeHitKind, type ShapeHitOptions } from '../shape'

export interface TextConfig extends ShapeConfig {
  text?: string
  fontSize?: number
  fontFamily?: string
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
}

// Coarse factors used to approximate text extent without a 2D measuring context.
// Precise measurement (via the renderer) is a later refinement.
const AVG_GLYPH_WIDTH_FACTOR = 0.55
const LINE_HEIGHT_FACTOR = 1.2

/**
 * Single-line text with a top-left local origin (default `textBaseline: 'top'`).
 *
 * Bounds are **approximated** from glyph count × font size; this is good enough for layout
 * and coarse hit-testing in the MVP. Defaults `fill` to black when no paint is given.
 */
export class Text extends Shape {
  readonly type = 'Text'
  private _text: string
  private _fontSize: number
  private _fontFamily: string
  private _textAlign: CanvasTextAlign
  private _textBaseline: CanvasTextBaseline

  constructor(config: TextConfig = {}) {
    super(config)
    this._text = config.text ?? ''
    this._fontSize = config.fontSize ?? 16
    this._fontFamily = config.fontFamily ?? 'sans-serif'
    this._textAlign = config.textAlign ?? 'start'
    this._textBaseline = config.textBaseline ?? 'top'
    if (config.fill === undefined) this.fill = '#000'
  }

  get text(): string {
    return this._text
  }
  set text(v: string) {
    if (v !== this._text) {
      this._text = v
      this.markDirty()
    }
  }

  get fontSize(): number {
    return this._fontSize
  }
  set fontSize(v: number) {
    if (v !== this._fontSize) {
      this._fontSize = v
      this.markDirty()
    }
  }

  get fontFamily(): string {
    return this._fontFamily
  }
  set fontFamily(v: string) {
    if (v !== this._fontFamily) {
      this._fontFamily = v
      this.markDirty()
    }
  }

  get textAlign(): CanvasTextAlign {
    return this._textAlign
  }
  set textAlign(v: CanvasTextAlign) {
    this._textAlign = v
    this.markDirty()
  }

  get textBaseline(): CanvasTextBaseline {
    return this._textBaseline
  }
  set textBaseline(v: CanvasTextBaseline) {
    this._textBaseline = v
    this.markDirty()
  }

  /** CSS font shorthand for this text, e.g. `"16px sans-serif"`. */
  get font(): string {
    return `${this._fontSize}px ${this._fontFamily}`
  }

  override getLocalBounds(): Bounds {
    const width = this._text.length * this._fontSize * AVG_GLYPH_WIDTH_FACTOR
    return Bounds.fromRect(0, 0, width, this._fontSize * LINE_HEIGHT_FACTOR)
  }

  drawOps(): DrawOp[] {
    return [
      {
        type: 'text',
        x: 0,
        y: 0,
        text: this._text,
        font: this.font,
        textAlign: this._textAlign,
        textBaseline: this._textBaseline,
        fill: this.fill,
        stroke: this.stroke,
        strokeWidth: this.strokeWidth,
      },
    ]
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    if ((options?.fill ?? true) && this.getLocalBounds().contains(p)) return 'fill'
    return null
  }
}
