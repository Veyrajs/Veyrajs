import { type AnnotationConfig, AnnotationNode, registerAnnotations } from '@veyrajs/annotations'
import {
  Bounds,
  type DrawOp,
  type Layer,
  SceneSerializer,
  type ShapeHitKind,
  type ShapeHitOptions,
  type Vec2,
  distanceToPolyline,
  pointInPolygon,
} from '@veyrajs/core'
import { button, createStage, disposeStage, readout, toolbar } from './_kit'

interface StarConfig extends AnnotationConfig {
  radius?: number
  spikes?: number
}

// A custom annotation type — proof that new shapes live entirely outside @veyrajs/core. The whole
// extension contract: subclass AnnotationNode, describe geometry as DrawOps, implement bounds +
// hit-test, and (for persistence) serialize your extra fields. A factory registered below lets it
// round-trip through JSON like any built-in.
class StarAnnotation extends AnnotationNode {
  readonly type = 'StarAnnotation'
  private _radius: number
  private _spikes: number

  constructor(config: StarConfig = {}) {
    super({ stroke: '#e11d48', fill: 'rgba(225, 29, 72, 0.16)', strokeWidth: 2, ...config })
    this._radius = config.radius ?? 36
    this._spikes = config.spikes ?? 5
  }

  private vertices(): Vec2[] {
    const points: Vec2[] = []
    const count = this._spikes * 2
    for (let i = 0; i < count; i++) {
      const r = i % 2 === 0 ? this._radius : this._radius * 0.45
      const angle = (Math.PI * i) / this._spikes - Math.PI / 2
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r })
    }
    return points
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromPoints(this.vertices())
  }

  override getVertices(): readonly Vec2[] {
    return this.vertices()
  }

  drawOps(): DrawOp[] {
    return [
      { type: 'polygon', points: this.vertices(), closed: true, ...this.fillStrokeStyle },
      ...this.labelOps({ x: 0, y: -this._radius }),
    ]
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    const verts = this.vertices()
    if ((options?.fill ?? true) && pointInPolygon(p, verts)) return 'fill'
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      if (distanceToPolyline(p, verts, true) <= band) return 'stroke'
    }
    return null
  }

  protected override serializedExtras(): Record<string, unknown> {
    return { ...super.serializedExtras(), radius: this._radius, spikes: this._spikes }
  }
}

export function init(host: HTMLElement): () => void {
  const stage = createStage(host)
  let layer = stage.createLayer()

  // Register the built-in annotations, then add the custom type to the SAME registry so the entire
  // scene — stars included — survives `stringify` → `parse`.
  const registry = registerAnnotations()
  registry.register('StarAnnotation', (data) => new StarAnnotation(data as unknown as StarConfig))
  const serializer = new SceneSerializer({ registry })

  const colors = ['#e11d48', '#7c3aed', '#0891b2', '#ea580c']
  let count = 0
  const addStar = (x: number, y: number): void => {
    const color = colors[count % colors.length] as string
    layer.add(
      new StarAnnotation({
        x,
        y,
        radius: 24 + (count % 3) * 8,
        stroke: color,
        fill: `${color}28`,
        labelColor: color,
        label: `Star ${count + 1}`,
      }),
    )
    count++
  }

  addStar(120, 130)
  addStar(290, 160)
  addStar(430, 120)

  stage.on('pointerdown', (e) => {
    addStar(e.worldPoint.x, e.worldPoint.y)
    updateReadout()
  })

  const bar = toolbar(host)
  bar.append(
    button('Save + Load JSON', () => {
      const json = serializer.stringify(stage)
      serializer.parse(stage, json) // rebuilds the scene from JSON — custom stars included
      layer = stage.children[0] as Layer
      out.textContent = `round-tripped ${new Blob([json]).size} bytes`
    }),
    button('Clear', () => {
      layer.removeChildren()
      count = 0
      updateReadout()
    }),
  )
  const out = readout(bar, '')
  function updateReadout(): void {
    out.textContent = `${layer.children.length} stars`
  }
  updateReadout()

  return () => disposeStage(stage)
}
