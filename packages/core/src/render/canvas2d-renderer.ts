import type { Matrix } from '../math'
import type { DrawOp, FillStrokeStyle } from './draw-ops'
import type { FrameInfo, Renderable, Renderer } from './renderer'

export interface Canvas2DRendererOptions {
  /** Host element the canvas is appended to. */
  container: HTMLElement
  /** Background fill used to clear each frame. `null` = transparent (just clear). */
  background?: string | null
  /** Reuse an existing canvas instead of creating one. */
  canvas?: HTMLCanvasElement
}

/**
 * The MVP Canvas 2D backend. Owns the DOM `<canvas>`, applies the device-pixel-ratio
 * transform, and executes each node's {@link DrawOp}s under its world transform.
 *
 * The DPR factor lives only here — engine/scene math stays in CSS-pixel space.
 */
export class Canvas2DRenderer implements Renderer {
  readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D | null
  private readonly background: string | null
  private pixelRatio = 1
  private cssWidth = 0
  private cssHeight = 0

  constructor(options: Canvas2DRendererOptions) {
    this.background = options.background ?? null
    this.canvas = options.canvas ?? document.createElement('canvas')
    this.canvas.style.display = 'block'
    options.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.cssWidth = width
    this.cssHeight = height
    this.pixelRatio = pixelRatio
    this.canvas.width = Math.max(0, Math.round(width * pixelRatio))
    this.canvas.height = Math.max(0, Math.round(height * pixelRatio))
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
  }

  begin(_frame: FrameInfo): void {
    const ctx = this.ctx
    if (!ctx) return
    const dpr = this.pixelRatio
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, this.cssWidth, this.cssHeight)
    if (this.background !== null) {
      ctx.fillStyle = this.background
      ctx.fillRect(0, 0, this.cssWidth, this.cssHeight)
    }
  }

  renderNode(node: Renderable, world: Matrix): void {
    const ctx = this.ctx
    if (!ctx || node.opacity <= 0) return

    const dpr = this.pixelRatio
    ctx.save()
    // Combined transform = scale(dpr) · world, so DrawOps draw in node-local space.
    ctx.setTransform(
      dpr * world.a,
      dpr * world.b,
      dpr * world.c,
      dpr * world.d,
      dpr * world.e,
      dpr * world.f,
    )
    ctx.globalAlpha = node.opacity
    for (const op of node.drawOps()) {
      this.execOp(ctx, op)
    }
    ctx.restore()
  }

  end(): void {
    // No-op for the immediate Canvas 2D backend.
  }

  destroy(): void {
    this.canvas.parentElement?.removeChild(this.canvas)
  }

  private execOp(ctx: CanvasRenderingContext2D, op: DrawOp): void {
    switch (op.type) {
      case 'rect': {
        if (op.fill != null) {
          ctx.fillStyle = op.fill
          ctx.fillRect(op.x, op.y, op.width, op.height)
        }
        if (op.stroke != null) {
          applyStroke(ctx, op)
          ctx.strokeRect(op.x, op.y, op.width, op.height)
        }
        break
      }
      case 'ellipse': {
        ctx.beginPath()
        ctx.ellipse(op.x, op.y, op.radiusX, op.radiusY, 0, 0, Math.PI * 2)
        if (op.fill != null) {
          ctx.fillStyle = op.fill
          ctx.fill()
        }
        if (op.stroke != null) {
          applyStroke(ctx, op)
          ctx.stroke()
        }
        break
      }
      case 'polygon': {
        if (op.points.length < 2) break
        ctx.beginPath()
        const [first, ...rest] = op.points
        if (!first) break
        ctx.moveTo(first.x, first.y)
        for (const p of rest) ctx.lineTo(p.x, p.y)
        if (op.closed) ctx.closePath()
        if (op.fill != null) {
          ctx.fillStyle = op.fill
          ctx.fill()
        }
        if (op.stroke != null) {
          applyStroke(ctx, op)
          ctx.stroke()
        }
        break
      }
      case 'image': {
        if (op.width != null && op.height != null) {
          ctx.drawImage(op.image, op.x, op.y, op.width, op.height)
        } else {
          ctx.drawImage(op.image, op.x, op.y)
        }
        break
      }
    }
  }
}

function applyStroke(ctx: CanvasRenderingContext2D, style: FillStrokeStyle): void {
  ctx.strokeStyle = style.stroke ?? '#000'
  ctx.lineWidth = style.strokeWidth ?? 1
  ctx.lineCap = style.lineCap ?? 'butt'
  ctx.lineJoin = style.lineJoin ?? 'miter'
  ctx.setLineDash(style.lineDash ? [...style.lineDash] : [])
}
