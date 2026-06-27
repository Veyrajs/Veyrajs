---
title: A Custom Shape
description: Define a Triangle by extending Shape — getLocalBounds, drawOps via a polygon op, and hitTest — then add it to a layer like any built-in shape.
sidebar:
  order: 10
---

When the built-ins don't fit, subclass [`Shape`](/Veyrajs/api/shapes/) and implement its three
abstract methods: `getLocalBounds()` (local extent), `drawOps()` (backend-neutral
[draw ops](/Veyrajs/api/rendering/) in **local** space), and `hitTest()` (`'fill' | 'stroke' | null`).
Here a `Triangle` emits a single closed `polygon` op and hit-tests its fill with `pointInPolygon`.

```ts
import { Shape, Bounds, pointInPolygon } from '@veyrajs/core'
import type { DrawOp, ShapeConfig, ShapeHitKind, Vec2 } from '@veyrajs/core'

interface TriangleConfig extends ShapeConfig {
  width?: number
  height?: number
}

class Triangle extends Shape {
  readonly type = 'Triangle'
  width: number
  height: number

  constructor(config: TriangleConfig = {}) {
    super(config)
    this.width = config.width ?? 100
    this.height = config.height ?? 80
  }

  // Three corners in LOCAL space: apex centered on top, base along the bottom.
  private get points(): Vec2[] {
    return [
      { x: this.width / 2, y: 0 },
      { x: this.width, y: this.height },
      { x: 0, y: this.height },
    ]
  }

  getLocalBounds(): Bounds {
    return Bounds.fromRect(0, 0, this.width, this.height)
  }

  drawOps(): DrawOp[] {
    return [{ type: 'polygon', points: this.points, closed: true, ...this.fillStrokeStyle }]
  }

  hitTest(p: Vec2): ShapeHitKind | null {
    return pointInPolygon(p, this.points) ? 'fill' : null
  }
}

// Use it like any built-in shape (layer comes from stage.createLayer()):
layer.add(new Triangle({ x: 120, y: 80, width: 140, height: 110, fill: '#34d399' }))
```

`drawOps()` spreads the protected `fillStrokeStyle` bundle, so `fill`/`stroke`/`strokeWidth` from the
config just work; the node transform (`x`, `y`, `rotation`, …) places the shape, so geometry stays in
local space. To make the shape **persist**, override `toObject()` to emit `width`/`height` and register
a factory on a `ClassRegistry` — see Advanced → Custom Node Types.

## Related

- [Shapes (API)](/Veyrajs/api/shapes/) — the `Shape` contract.
- [Rendering (API)](/Veyrajs/api/rendering/) — the `DrawOp` vocabulary.
- [Math (API)](/Veyrajs/api/math/) — `Bounds`, `pointInPolygon`.
- [Advanced → Custom Node Types](/Veyrajs/advanced/custom-node-types/) — serialization for your shape.
