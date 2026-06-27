---
title: Custom Renderers
description: Implement the Renderer seam to draw the scene with any backend — a minimal counting renderer, an SVG-emitting sketch, and the reserved WebGL/WebGPU path.
sidebar:
  order: 1
---

The `Renderer` interface is the seam between *what* to draw (the scene graph) and *how* to draw it
(a backend). The [`Stage`](/Veyrajs/api/scene/) drives the lifecycle each frame — `begin` →
`renderNode` for every visible shape in depth-first z-order → `end` — and a renderer is a **pure
consumer**: it reads each node's `drawOps()` plus its world matrix and never mutates the scene. Every
draw op is in **local space**; the renderer applies the world transform (and device-pixel-ratio)
itself. Inject one with `new Stage({ renderer })`.

## The interface

```ts
interface Renderer {
  readonly canvas?: HTMLCanvasElement
  setSize(width: number, height: number, pixelRatio: number): void
  begin(frame: FrameInfo): void
  renderNode(node: Renderable, worldMatrix: Matrix): void
  end(): void
  destroy(): void
}

interface Renderable { readonly opacity: number; drawOps(): DrawOp[] }
interface FrameInfo { width: number; height: number; pixelRatio: number }
```

`Renderable` is the *entire* surface a renderer sees of a node — deliberately tiny, so the render
layer never depends on `Shape` or the scene graph. `canvas` is optional: a backend that doesn't own a
`<canvas>` (SVG, headless) simply omits it, and `stage.canvas` is then `undefined`.

## A minimal renderer

The smallest useful renderer does the engine-side per-node work a real backend does — it pulls
`node.drawOps()` — but performs no rasterization. This is exactly the benchmark harness's
`CountingRenderer`:

```ts
import type { FrameInfo, Matrix, Renderable, Renderer } from '@veyrajs/core'

export class CountingRenderer implements Renderer {
  nodeCount = 0
  opCount = 0

  setSize(): void {}

  begin(_frame: FrameInfo): void {
    this.nodeCount = 0
    this.opCount = 0
  }

  renderNode(node: Renderable, _world: Matrix): void {
    this.nodeCount += 1
    this.opCount += node.drawOps().length
  }

  end(): void {}

  destroy(): void {}
}
```

Inject it like any backend. The `Stage` calls `setSize` for you and drives `begin`/`renderNode`/`end`
— you never call them directly:

```ts
import { Stage } from '@veyrajs/core'
import { CountingRenderer } from './counting-renderer'

const renderer = new CountingRenderer()
const stage = new Stage({ container: el, width: 800, height: 480, renderer })
// ... build a scene, then force a synchronous frame:
stage.render()
console.log(renderer.nodeCount, renderer.opCount)
```

## Consuming draw ops

A rasterizing backend switches over the `DrawOp` discriminated union. Each op is plain, local-space
data; `worldMatrix` (a [`Matrix`](/Veyrajs/api/math/)) places it and `node.opacity` is the per-node
alpha:

```ts
renderNode(node: Renderable, world: Matrix): void {
  for (const op of node.drawOps()) {
    switch (op.type) {
      case 'rect': /* op.x, op.y, op.width, op.height, op.fill, ... */ break
      case 'ellipse': /* op.x, op.y, op.radiusX, op.radiusY, ... */ break
      case 'polygon': /* op.points, op.closed, ... */ break
      case 'image': /* op.image, op.x, op.y, op.width, op.height */ break
      case 'text': /* op.text, op.font, op.x, op.y, op.fill, ... */ break
    }
  }
}
```

Because the union is closed, adding an op member is a type-checked change every backend must handle —
there is no silent fallthrough.

## Sketch: an SVG-emitting renderer

A non-canvas backend builds markup instead of pixels. It leaves `canvas` undefined, accumulates one
group per node each frame, and turns each op into an SVG element positioned by the world matrix —
`Matrix.toArray()` is already in SVG's `matrix(a, b, c, d, e, f)` order:

```ts
import type { DrawOp, FillStrokeStyle, FrameInfo, Matrix, Renderable, Renderer } from '@veyrajs/core'

/** Sketch: a Renderer that emits SVG markup instead of rasterizing. */
export class SvgRenderer implements Renderer {
  // No `canvas` field — this backend produces an <svg> string, so `stage.canvas` is undefined.
  private width = 0
  private height = 0
  private body: string[] = []

  setSize(width: number, height: number): void {
    this.width = width
    this.height = height
    // SVG is resolution-independent, so the device-pixel-ratio argument is ignored here.
  }

  begin(_frame: FrameInfo): void {
    this.body = []
  }

  renderNode(node: Renderable, world: Matrix): void {
    const [a, b, c, d, e, f] = world.toArray()
    const els = node.drawOps().map(opToSvg).join('')
    this.body.push(`<g transform="matrix(${a},${b},${c},${d},${e},${f})" opacity="${node.opacity}">${els}</g>`)
  }

  end(): void {}

  destroy(): void {
    this.body = []
  }

  /** The accumulated frame as an <svg> document. */
  markup(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">${this.body.join('')}</svg>`
  }
}

function paint(style: FillStrokeStyle): string {
  return `fill="${style.fill ?? 'none'}" stroke="${style.stroke ?? 'none'}" stroke-width="${style.strokeWidth ?? 1}"`
}

function opToSvg(op: DrawOp): string {
  switch (op.type) {
    case 'rect':
      return `<rect x="${op.x}" y="${op.y}" width="${op.width}" height="${op.height}" ${paint(op)} />`
    case 'ellipse':
      return `<ellipse cx="${op.x}" cy="${op.y}" rx="${op.radiusX}" ry="${op.radiusY}" ${paint(op)} />`
    case 'polygon': {
      const pts = op.points.map((p) => `${p.x},${p.y}`).join(' ')
      return `<${op.closed ? 'polygon' : 'polyline'} points="${pts}" ${paint(op)} />`
    }
    case 'text':
      return `<text x="${op.x}" y="${op.y}" style="font:${op.font}" fill="${op.fill ?? '#000'}">${op.text}</text>`
    case 'image':
      return '' // <image href=...> is analogous; elided for brevity
  }
}
```

This is illustrative — a production SVG backend would reuse DOM nodes across frames and map `textAlign`
/ `textBaseline` to `text-anchor` / `dominant-baseline`. The point is that a shape's geometry comes
through unchanged as data; only the consumer differs.

## The WebGL/WebGPU seam is reserved

The same property that makes the SVG sketch possible reserves a GPU future: **nodes never touch a
`CanvasRenderingContext2D`** — they only emit backend-neutral `DrawOp`s. The dependency points one
way (`scene → render → math`), so a WebGL or WebGPU renderer can replace `Canvas2DRenderer` with
**zero changes to nodes**. Device-pixel-ratio also lives only inside the renderer (the third argument
to `setSize` / the `pixelRatio` on `FrameInfo`); every other module works in CSS-pixel/world space, so
you never thread `dpr` through scene math.

## Related

- [Rendering & the Frame Loop (concept)](/Veyrajs/concepts/rendering/)
- [Rendering API](/Veyrajs/api/rendering/) — `Renderer`, `DrawOp`, `FrameInfo`.
- [Math API](/Veyrajs/api/math/) — the `Matrix` passed to `renderNode`.
- [Custom Node Types & Plugins](/Veyrajs/advanced/custom-node-types/) — what produces the draw ops.
