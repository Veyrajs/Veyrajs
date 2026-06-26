import { Matrix, type Vec2 } from '../math'
import type { Node } from '../scene/node'

const RAD = Math.PI / 180

function parentWorldOf(node: Node): Matrix {
  return node.parent !== null ? node.parent.worldMatrix() : Matrix.identity()
}

export interface ResizeContext {
  node: Node
  /** Local-bounds point being dragged. */
  handleLocal: Vec2
  /** Opposite local-bounds point (stays fixed). */
  anchorLocal: Vec2
  /** Anchor position in the node's parent space, captured at drag start. */
  anchorParent: Vec2
}

export interface ResizeResult {
  x: number
  y: number
  scaleX: number
  scaleY: number
}

/**
 * Transform for a resize drag: the dragged handle follows the pointer while the opposite
 * (anchor) corner stays fixed. Rotation-aware.
 *
 * Reduces a rotated resize to a per-axis scale by rotating the parent-space drag vector
 * back by −θ: `S'·D = R(−θ)·(pointer − anchor)`, then re-anchors the position.
 */
export function computeResize(ctx: ResizeContext, pointerWorld: Vec2): ResizeResult {
  const { node } = ctx
  const pParent = parentWorldOf(node).invert().applyToPoint(pointerWorld)
  const q = Matrix.rotation(-node.rotation).applyToPoint({
    x: pParent.x - ctx.anchorParent.x,
    y: pParent.y - ctx.anchorParent.y,
  })
  const dx = ctx.handleLocal.x - ctx.anchorLocal.x
  const dy = ctx.handleLocal.y - ctx.anchorLocal.y
  const scaleX = dx === 0 ? node.scaleX : q.x / dx
  const scaleY = dy === 0 ? node.scaleY : q.y / dy
  const ra = Matrix.rotation(node.rotation)
    .multiply(Matrix.scaling(scaleX, scaleY))
    .applyToPoint(ctx.anchorLocal)
  return { x: ctx.anchorParent.x - ra.x, y: ctx.anchorParent.y - ra.y, scaleX, scaleY }
}

export interface RotateContext {
  node: Node
  /** Bounds center in local coordinates. */
  centerLocal: Vec2
  /** Bounds center in parent space, captured at drag start (kept fixed). */
  centerParent: Vec2
  /** Pointer angle (radians, parent space) at drag start. */
  startAngle: number
  /** Node rotation (degrees) at drag start. */
  startRotation: number
}

export interface RotateResult {
  x: number
  y: number
  rotation: number
}

/** Transform for a rotate drag, keeping the bounds center fixed. */
export function computeRotation(ctx: RotateContext, pointerWorld: Vec2): RotateResult {
  const { node } = ctx
  const pParent = parentWorldOf(node).invert().applyToPoint(pointerWorld)
  const angle = Math.atan2(pParent.y - ctx.centerParent.y, pParent.x - ctx.centerParent.x)
  const rotation = ctx.startRotation + (angle - ctx.startAngle) / RAD
  const rc = Matrix.rotation(rotation)
    .multiply(Matrix.scaling(node.scaleX, node.scaleY))
    .applyToPoint(ctx.centerLocal)
  return { rotation, x: ctx.centerParent.x - rc.x, y: ctx.centerParent.y - rc.y }
}

/** Pointer angle (radians, parent space) from a parent-space center — for the start angle. */
export function pointerAngle(node: Node, centerParent: Vec2, pointerWorld: Vec2): number {
  const p = parentWorldOf(node).invert().applyToPoint(pointerWorld)
  return Math.atan2(p.y - centerParent.y, p.x - centerParent.x)
}
