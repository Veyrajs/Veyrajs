import { Shape } from '@veyrajs/core'
import type { DrawOp, ShapeConfig, Vec2 } from '@veyrajs/core'

export interface AnnotationConfig extends ShapeConfig {
  /** Free-text label / class name shown in a chip above the annotation. */
  label?: string
  /** Chip background color. Defaults to the node's stroke (then a neutral blue). */
  labelColor?: string | null
  /** Whether to draw the label chip. Default `true`. */
  showLabel?: boolean
  /** Label font size in local units. Default `12`. */
  labelFontSize?: number
}

/**
 * Base class for every annotation primitive. On top of the core {@link Shape} it adds a label
 * chip and the shared style model. To add your own annotation type, subclass this and implement
 * `getLocalBounds()`, `drawOps()` (spread `this.labelOps(anchor)` to include the chip), `hitTest()`,
 * and — if the shape is vertex-editable — `getVertices()` plus a `points` setter.
 */
export abstract class AnnotationNode extends Shape {
  private _label: string
  private _labelColor: string | null
  private _showLabel: boolean
  private _labelFontSize: number

  constructor(config: AnnotationConfig = {}) {
    super(config)
    this._label = config.label ?? ''
    this._labelColor = config.labelColor ?? null
    this._showLabel = config.showLabel ?? true
    this._labelFontSize = config.labelFontSize ?? 12
  }

  get label(): string {
    return this._label
  }
  set label(v: string) {
    if (v !== this._label) {
      this._label = v
      this.markDirty()
    }
  }

  get labelColor(): string | null {
    return this._labelColor
  }
  set labelColor(v: string | null) {
    if (v !== this._labelColor) {
      this._labelColor = v
      this.markDirty()
    }
  }

  get showLabel(): boolean {
    return this._showLabel
  }
  set showLabel(v: boolean) {
    if (v !== this._showLabel) {
      this._showLabel = v
      this.markDirty()
    }
  }

  get labelFontSize(): number {
    return this._labelFontSize
  }
  set labelFontSize(v: number) {
    if (v !== this._labelFontSize) {
      this._labelFontSize = v
      this.markDirty()
    }
  }

  /**
   * Draw ops for the label chip — a filled background plus white text — anchored just above
   * `anchor` (local space). Returns `[]` when there's no label or it's hidden. Concrete nodes
   * spread this into their own `drawOps()`.
   */
  protected labelOps(anchor: Vec2): DrawOp[] {
    if (!this._showLabel || this._label === '') return []
    const size = this._labelFontSize
    const pad = 3
    const width = this._label.length * size * 0.55 + pad * 2
    const height = size + pad * 2
    const bg = this._labelColor ?? this.stroke ?? '#2563eb'
    return [
      {
        type: 'rect',
        x: anchor.x,
        y: anchor.y - height,
        width,
        height,
        fill: bg,
        stroke: null,
        strokeWidth: 0,
      },
      {
        type: 'text',
        x: anchor.x + pad,
        y: anchor.y - height + pad,
        text: this._label,
        font: `${size}px sans-serif`,
        textAlign: 'left',
        textBaseline: 'top',
        fill: '#ffffff',
      },
    ]
  }

  protected override serializedExtras(): Record<string, unknown> {
    return {
      ...super.serializedExtras(),
      label: this._label,
      labelColor: this._labelColor,
      showLabel: this._showLabel,
      labelFontSize: this._labelFontSize,
    }
  }
}
