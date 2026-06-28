import type { DrawOp, Node, Overlay, SceneEvent, Stage, Vec2 } from '@veyrajs/core'

/** A node whose vertices the editor can move: any annotation with a `points` accessor. */
export type VertexTarget = Node & { points: readonly Vec2[] }

export interface VertexEditorOptions {
  /** Handle size in screen pixels. Default `9`. */
  handleSize?: number
  /** Handle outline color. Default `#2563eb`. */
  handleColor?: string
  /** Handle fill color. Default `#ffffff`. */
  fillColor?: string
  /** Called after a vertex finishes moving — e.g. to record an undo entry. */
  onChange?: (target: VertexTarget) => void
}

/**
 * An `Overlay` that draws a draggable handle at each vertex of its target and edits the target's
 * `points` as you drag — the counterpart to the core `SelectionController` (which handles boxes).
 * Mirror this class to build your own custom handles. Configure handle size/colors, or swap it out
 * entirely.
 */
export class VertexEditor implements Overlay {
  private readonly stage: Stage
  private readonly handleSize: number
  private readonly handleColor: string
  private readonly fillColor: string
  private readonly onChange: ((target: VertexTarget) => void) | undefined
  private target: VertexTarget | null = null
  private dragIndex = -1
  private readonly disposers: Array<() => void> = []

  constructor(stage: Stage, options: VertexEditorOptions = {}) {
    this.stage = stage
    this.handleSize = options.handleSize ?? 9
    this.handleColor = options.handleColor ?? '#2563eb'
    this.fillColor = options.fillColor ?? '#ffffff'
    this.onChange = options.onChange

    this.disposers.push(stage.addOverlay(this))
    stage.on('pointerdown', this.onPointerDown, { capture: true })
    stage.on('pointermove', this.onPointerMove, { capture: true })
    stage.on('pointerup', this.onPointerUp, { capture: true })
    this.disposers.push(() => {
      stage.off('pointerdown', this.onPointerDown)
      stage.off('pointermove', this.onPointerMove)
      stage.off('pointerup', this.onPointerUp)
    })
  }

  /** Edit `node`'s vertices, or pass `null` to stop editing. */
  setTarget(node: VertexTarget | null): void {
    this.target = node
    this.dragIndex = -1
    this.stage.requestRender()
  }

  /** Unregister the overlay and pointer listeners. */
  destroy(): void {
    for (const dispose of this.disposers) dispose()
    this.target = null
    this.stage.requestRender()
  }

  drawOps(): DrawOp[] {
    const target = this.target
    if (target === null) return []
    const half = this.handleSize / 2
    return this.handleScreens(target).map((screen) => ({
      type: 'rect',
      x: screen.x - half,
      y: screen.y - half,
      width: this.handleSize,
      height: this.handleSize,
      fill: this.fillColor,
      stroke: this.handleColor,
      strokeWidth: 1.5,
    }))
  }

  private handleScreens(target: VertexTarget): Vec2[] {
    const world = target.worldMatrix()
    return target.points.map((vertex) => this.stage.worldToScreen(world.applyToPoint(vertex)))
  }

  private onPointerDown = (e: SceneEvent): void => {
    const target = this.target
    if (target === null) return
    for (const [index, screen] of this.handleScreens(target).entries()) {
      if (Math.hypot(e.screenPoint.x - screen.x, e.screenPoint.y - screen.y) <= this.handleSize) {
        this.dragIndex = index
        e.stopPropagation()
        return
      }
    }
  }

  private onPointerMove = (e: SceneEvent): void => {
    const target = this.target
    if (target === null || this.dragIndex < 0) return
    const local = e.getLocalPoint(target)
    const next = target.points.map((p) => ({ x: p.x, y: p.y }))
    next[this.dragIndex] = local
    target.points = next
    e.stopPropagation()
  }

  private onPointerUp = (e: SceneEvent): void => {
    if (this.dragIndex < 0) return
    this.dragIndex = -1
    if (this.target !== null && this.onChange !== undefined) this.onChange(this.target)
    e.stopPropagation()
  }
}
