import type { Vec2 } from '../math'

/** Common paint properties shared by vector draw operations. */
export interface FillStrokeStyle {
  fill?: string | null
  stroke?: string | null
  strokeWidth?: number
  lineDash?: readonly number[] | null
  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin
}

export interface RectOp extends FillStrokeStyle {
  type: 'rect'
  x: number
  y: number
  width: number
  height: number
}

export interface EllipseOp extends FillStrokeStyle {
  type: 'ellipse'
  x: number
  y: number
  radiusX: number
  radiusY: number
}

export interface PolygonOp extends FillStrokeStyle {
  type: 'polygon'
  points: readonly Vec2[]
  closed?: boolean
}

export interface ImageOp {
  type: 'image'
  image: CanvasImageSource
  x: number
  y: number
  width?: number
  height?: number
}

/**
 * Backend-neutral drawing primitive emitted by shapes. The renderer (Canvas 2D today,
 * WebGL later) is responsible for turning these into actual draw calls — shapes never
 * issue canvas calls themselves. This list grows as concrete shapes arrive in Phase 3.
 */
export type DrawOp = RectOp | EllipseOp | PolygonOp | ImageOp
