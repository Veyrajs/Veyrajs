import type { SceneEvent } from '../events/event-types'
import { Bounds, Matrix, type Vec2 } from '../math'
import type { DrawOp } from '../render/draw-ops'
import { Container } from '../scene/container'
import type { Node } from '../scene/node'
import { Shape } from '../scene/shape'
import type { Overlay, Stage } from '../scene/stage'
import { SelectionManager } from '../selection/selection-manager'
import { type ControlDef, DEFAULT_CONTROLS } from './controls'
import { type ResizeResult, computeResize, computeRotation, pointerAngle } from './transform-math'

export interface SelectionControllerOptions {
  /** Reuse an existing manager (defaults to a fresh one). */
  selection?: SelectionManager
  /** Handle square size in screen pixels. Default 9. */
  handleSize?: number
  /** Show the rotate handle. Default true. */
  rotateEnabled?: boolean
  /** Constrain a resize result (e.g. clamp min size / aspect). */
  boundBox?: (result: ResizeResult, node: Node) => ResizeResult
  /** Accent color for the box and handles. */
  color?: string
}

interface MoveState {
  mode: 'move'
  items: { node: Node; startX: number; startY: number; pStart: Vec2 }[]
}
interface ResizeState {
  mode: 'resize'
  node: Node
  handleLocal: Vec2
  anchorLocal: Vec2
  anchorParent: Vec2
}
interface RotateState {
  mode: 'rotate'
  node: Node
  centerLocal: Vec2
  centerParent: Vec2
  startAngle: number
  startRotation: number
}
interface MarqueeState {
  mode: 'marquee'
  start: Vec2
  current: Vec2
}
type DragState = MoveState | ResizeState | RotateState | MarqueeState | null

/**
 * Interactive selection + transform: click/shift-click/marquee to select, drag to move,
 * and resize/rotate handles for a single selection. Renders its box and handles as a
 * screen-space stage overlay (constant size at any zoom). Mutations are applied directly
 * for now; Phase 8 wraps them in undoable commands.
 */
export class SelectionController implements Overlay {
  readonly selection: SelectionManager
  private readonly stage: Stage
  private readonly handleSize: number
  private readonly rotateEnabled: boolean
  private readonly boundBox: ((result: ResizeResult, node: Node) => ResizeResult) | undefined
  private readonly color: string
  private drag: DragState = null
  private readonly disposers: (() => void)[] = []

  constructor(stage: Stage, options: SelectionControllerOptions = {}) {
    this.stage = stage
    this.selection = options.selection ?? new SelectionManager()
    this.handleSize = options.handleSize ?? 9
    this.rotateEnabled = options.rotateEnabled ?? true
    this.boundBox = options.boundBox
    this.color = options.color ?? '#3b82f6'

    this.disposers.push(this.stage.addOverlay(this))
    this.disposers.push(this.selection.onChange(() => this.stage.requestRender()))
    this.stage.on('pointerdown', this.onPointerDown, { capture: true })
    this.stage.on('pointermove', this.onPointerMove, { capture: true })
    this.stage.on('pointerup', this.onPointerUp, { capture: true })
    this.disposers.push(() => this.stage.off('pointerdown', this.onPointerDown))
    this.disposers.push(() => this.stage.off('pointermove', this.onPointerMove))
    this.disposers.push(() => this.stage.off('pointerup', this.onPointerUp))
  }

  destroy(): void {
    for (const dispose of this.disposers) dispose()
    this.stage.container.style.cursor = ''
  }

  // ── interaction ──────────────────────────────────────────────────────────

  private onPointerDown = (e: SceneEvent): void => {
    if (e.button !== 0) return
    const single = this.selection.single

    if (single !== null) {
      const control = this.controlAt(single, e.screenPoint)
      if (control !== undefined) {
        this.beginHandleDrag(single, control, e)
        e.stopPropagation()
        return
      }
    }

    const target = e.target
    if (target instanceof Shape) {
      if (e.shiftKey) this.selection.toggle(target)
      else if (!this.selection.has(target)) this.selection.select(target)
      if (this.selection.has(target)) this.beginMove(e)
      e.stopPropagation()
      return
    }

    if (!e.shiftKey) this.selection.clear()
    this.drag = { mode: 'marquee', start: e.screenPoint, current: e.screenPoint }
    e.stopPropagation()
  }

  private onPointerMove = (e: SceneEvent): void => {
    const drag = this.drag
    if (drag === null) {
      this.updateCursor(e)
      return
    }

    if (drag.mode === 'move') {
      for (const item of drag.items) {
        const p = parentInverse(item.node).applyToPoint(e.worldPoint)
        item.node.x = item.startX + (p.x - item.pStart.x)
        item.node.y = item.startY + (p.y - item.pStart.y)
      }
    } else if (drag.mode === 'resize') {
      let result = computeResize(drag, e.worldPoint)
      if (this.boundBox !== undefined) result = this.boundBox(result, drag.node)
      drag.node.x = result.x
      drag.node.y = result.y
      drag.node.scaleX = result.scaleX
      drag.node.scaleY = result.scaleY
    } else if (drag.mode === 'rotate') {
      const result = computeRotation(drag, e.worldPoint)
      drag.node.rotation = result.rotation
      drag.node.x = result.x
      drag.node.y = result.y
    } else {
      drag.current = e.screenPoint
      this.stage.requestRender()
    }
    e.stopPropagation()
  }

  private onPointerUp = (e: SceneEvent): void => {
    const drag = this.drag
    this.drag = null
    if (drag !== null && drag.mode === 'marquee') this.commitMarquee(drag, e.shiftKey)
  }

  private beginMove(e: SceneEvent): void {
    const items = this.selection.nodes.map((node) => {
      const pStart = parentInverse(node).applyToPoint(e.worldPoint)
      return { node, startX: node.x, startY: node.y, pStart }
    })
    this.drag = { mode: 'move', items }
  }

  private beginHandleDrag(node: Node, control: ControlDef, e: SceneEvent): void {
    const b = node.getLocalBounds()
    if (control.kind === 'rotate') {
      const centerLocal = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
      const centerParent = node.localMatrix().applyToPoint(centerLocal)
      this.drag = {
        mode: 'rotate',
        node,
        centerLocal,
        centerParent,
        startAngle: pointerAngle(node, centerParent, e.worldPoint),
        startRotation: node.rotation,
      }
      return
    }
    const handleLocal = { x: b.x + control.nx * b.width, y: b.y + control.ny * b.height }
    const anchorLocal = {
      x: b.x + (control.anchorNx ?? 0) * b.width,
      y: b.y + (control.anchorNy ?? 0) * b.height,
    }
    this.drag = {
      mode: 'resize',
      node,
      handleLocal,
      anchorLocal,
      anchorParent: node.localMatrix().applyToPoint(anchorLocal),
    }
  }

  private commitMarquee(drag: MarqueeState, additive: boolean): void {
    const a = this.stage.screenToWorld(drag.start)
    const b = this.stage.screenToWorld(drag.current)
    const rect = Bounds.fromPoints([a, b])
    if (rect.width < 2 && rect.height < 2) return
    const hits: Node[] = []
    collectShapes(this.stage, (shape) => {
      if (rect.intersects(shape.getWorldBounds())) hits.push(shape)
    })
    if (additive) this.selection.add(...hits)
    else this.selection.set(hits)
  }

  private updateCursor(e: SceneEvent): void {
    const single = this.selection.single
    let cursor = ''
    if (single !== null) {
      const control = this.controlAt(single, e.screenPoint)
      if (control !== undefined) cursor = control.cursor
    }
    if (cursor === '' && e.target instanceof Shape && this.selection.has(e.target)) cursor = 'move'
    this.stage.container.style.cursor = cursor
  }

  private controlAt(node: Node, screen: Vec2): ControlDef | undefined {
    for (const control of DEFAULT_CONTROLS) {
      if (control.kind === 'rotate' && !this.rotateEnabled) continue
      const pos = this.handlePos(node, control)
      if (Math.hypot(screen.x - pos.x, screen.y - pos.y) <= this.handleSize) return control
    }
    return undefined
  }

  private handlePos(node: Node, control: ControlDef): Vec2 {
    const b = node.getLocalBounds()
    const local = { x: b.x + control.nx * b.width, y: b.y + control.ny * b.height }
    const screen = this.stage.worldToScreen(node.worldMatrix().applyToPoint(local))
    return { x: screen.x + (control.offsetX ?? 0), y: screen.y + (control.offsetY ?? 0) }
  }

  // ── overlay rendering (screen space) ─────────────────────────────────────

  drawOps(): DrawOp[] {
    const ops: DrawOp[] = []
    const hs = this.handleSize

    if (this.drag?.mode === 'marquee') {
      const r = Bounds.fromPoints([this.drag.start, this.drag.current])
      ops.push({
        type: 'rect',
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        fill: 'rgba(59,130,246,0.12)',
        stroke: this.color,
        strokeWidth: 1,
      })
    }

    const nodes = this.selection.nodes
    if (nodes.length === 1) {
      const node = nodes[0]
      if (node === undefined) return ops
      const corners = DEFAULT_CONTROLS.filter((c) => ['tl', 'tr', 'br', 'bl'].includes(c.key)).map(
        (c) => this.handlePos(node, c),
      )
      ops.push({
        type: 'polygon',
        points: corners,
        closed: true,
        stroke: this.color,
        strokeWidth: 1,
      })

      if (this.rotateEnabled) {
        const rotate = DEFAULT_CONTROLS.find((c) => c.kind === 'rotate')
        const top = DEFAULT_CONTROLS.find((c) => c.key === 'mt')
        if (rotate !== undefined && top !== undefined) {
          const rp = this.handlePos(node, rotate)
          const tp = this.handlePos(node, top)
          ops.push({
            type: 'polygon',
            points: [tp, rp],
            closed: false,
            stroke: this.color,
            strokeWidth: 1,
          })
          ops.push({
            type: 'ellipse',
            x: rp.x,
            y: rp.y,
            radiusX: hs / 2,
            radiusY: hs / 2,
            fill: '#fff',
            stroke: this.color,
            strokeWidth: 1,
          })
        }
      }

      for (const control of DEFAULT_CONTROLS) {
        if (control.kind !== 'resize') continue
        const p = this.handlePos(node, control)
        ops.push({
          type: 'rect',
          x: p.x - hs / 2,
          y: p.y - hs / 2,
          width: hs,
          height: hs,
          fill: '#fff',
          stroke: this.color,
          strokeWidth: 1,
        })
      }
    } else if (nodes.length > 1) {
      let world = Bounds.empty()
      for (const node of nodes) world = world.union(node.getWorldBounds())
      const screen = Bounds.fromPoints(world.corners().map((c) => this.stage.worldToScreen(c)))
      ops.push({
        type: 'rect',
        x: screen.x,
        y: screen.y,
        width: screen.width,
        height: screen.height,
        stroke: this.color,
        strokeWidth: 1,
      })
    }

    return ops
  }
}

function parentInverse(node: Node): Matrix {
  return (node.parent !== null ? node.parent.worldMatrix() : Matrix.identity()).invert()
}

function collectShapes(node: Node, visit: (shape: Shape) => void): void {
  if (!node.visible) return
  if (node instanceof Shape) visit(node)
  if (node instanceof Container) {
    for (const child of node.children) collectShapes(child, visit)
  }
}
