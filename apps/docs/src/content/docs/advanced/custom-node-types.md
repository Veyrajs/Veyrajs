---
title: Custom Node Types & Plugins
description: Subclass Shape for a new drawable, register a factory for serialization, and wrap it as a component in every framework adapter — the zero-core-change plugin path.
sidebar:
  order: 3
---

Custom node types are how you extend Veyrajs **without touching `@veyrajs/core`**. Subclass
[`Shape`](/Veyrajs/api/shapes/) for a drawable leaf (or [`Node`](/Veyrajs/api/scene/) / `Container`
for a non-drawable one), register a factory so it round-trips through
[serialization](/Veyrajs/api/serialization/), and each framework adapter can wrap it as a declarative
component. This is the `@veyrajs/annotations` path: every annotation primitive (bounding box, polygon,
keypoint, …) is just a custom node built on these public seams, with **zero core changes**.

## Subclassing Shape

A concrete shape implements three methods — `getLocalBounds()`, `drawOps()` (backend-neutral ops in
**local** space), and `hitTest()` (local-space, tolerance additive) — and may override
`getVertices()` (for vertex editing) and `serializedExtras()` (for serialization). Geometry is
authored around the shape's local origin; the node transform places it. Here is a complete `Star`:

```ts
import { Bounds, Shape, distanceToPolyline, pointInPolygon } from '@veyrajs/core'
import type { DrawOp, ShapeConfig, ShapeHitKind, ShapeHitOptions, Vec2 } from '@veyrajs/core'

export interface StarConfig extends ShapeConfig {
  numPoints?: number
  innerRadius?: number
  outerRadius?: number
}

/** A regular star, centered on its local origin (0, 0). */
export class Star extends Shape {
  readonly type = 'Star' // the discriminant the registry keys on
  private _numPoints: number
  private _innerRadius: number
  private _outerRadius: number

  constructor(config: StarConfig = {}) {
    super(config)
    this._numPoints = config.numPoints ?? 5
    this._innerRadius = config.innerRadius ?? 20
    this._outerRadius = config.outerRadius ?? 50
  }

  // Guarded setters call markDirty() so a change schedules exactly one frame.
  get numPoints(): number { return this._numPoints }
  set numPoints(v: number) { if (v !== this._numPoints) { this._numPoints = v; this.markDirty() } }
  get innerRadius(): number { return this._innerRadius }
  set innerRadius(v: number) { if (v !== this._innerRadius) { this._innerRadius = v; this.markDirty() } }
  get outerRadius(): number { return this._outerRadius }
  set outerRadius(v: number) { if (v !== this._outerRadius) { this._outerRadius = v; this.markDirty() } }

  /** Local-space points, computed from the config. */
  private points(): Vec2[] {
    const pts: Vec2[] = []
    const step = Math.PI / this._numPoints
    for (let i = 0; i < this._numPoints * 2; i++) {
      const r = i % 2 === 0 ? this._outerRadius : this._innerRadius
      const a = i * step - Math.PI / 2
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
    }
    return pts
  }

  override getLocalBounds(): Bounds {
    return Bounds.fromPoints(this.points())
  }

  drawOps(): DrawOp[] {
    return [{ type: 'polygon', points: this.points(), closed: true, ...this.fillStrokeStyle }]
  }

  override getVertices(): Vec2[] {
    return this.points()
  }

  hitTest(p: Vec2, options?: ShapeHitOptions): ShapeHitKind | null {
    const pts = this.points()
    if ((options?.fill ?? true) && this.fill !== null && pointInPolygon(p, pts)) return 'fill'
    if (options?.stroke ?? true) {
      const band = (options?.tolerance ?? 0) + (this.stroke !== null ? this.strokeWidth / 2 : 0)
      if (distanceToPolyline(p, pts, true) <= band) return 'stroke'
    }
    return null
  }

  protected override serializedExtras(): Record<string, unknown> {
    return {
      ...super.serializedExtras(),
      numPoints: this._numPoints,
      innerRadius: this._innerRadius,
      outerRadius: this._outerRadius,
    }
  }
}
```

The key moves: `drawOps()` returns backend-neutral ops (here one `polygon`) spread with the inherited
`this.fillStrokeStyle`; `hitTest()` works in local units and reuses the math helpers `pointInPolygon`
/ `distanceToPolyline`; and `serializedExtras()` adds the type-specific props on top of the base
node + paint props.

## It renders and hit-tests for free

Because the shape only emits `DrawOp`s and answers `hitTest`, the existing `Canvas2DRenderer` draws it
and the `GeometricHitTester` picks it — **no renderer or hit-tester changes**. Returning points from
`getVertices()` makes them draggable through the selection/vertex layer. The same data-only contract
is what lets a [custom renderer](/Veyrajs/advanced/custom-renderers/) or
[custom hit-tester](/Veyrajs/advanced/custom-hit-testers/) consume your shape unmodified.

## Registering for serialization

Deserialization looks up a factory by the `type` string. Register yours on a `ClassRegistry` (start
from `createDefaultRegistry()` so the built-ins stay registered) and pass it to the serializer:

```ts
import { createDefaultRegistry, SceneSerializer } from '@veyrajs/core'
import { Star } from './star'

const registry = createDefaultRegistry().register('Star', (d) => new Star(d as never))
const serializer = new SceneSerializer({ registry })

serializer.parse(stage, json) // 'Star' nodes now rebuild as Star instances
```

Because `serializedExtras()` mirrors the constructor config, the factory is just `(d) => new Star(d)`.
The registered key **must equal** the node's `type` (`'Star'`). Unknown types **throw** rather than
silently dropping nodes, so a missing plugin is loud.

## Non-drawable nodes

Not every node paints. For grouping or logic, extend `Container` or `Node` and implement only
`getLocalBounds()` — there is no `drawOps`/`hitTest` to write, since only `Shape`s are rendered and
picked.

## Wrapping it as a component

Each adapter turns a node class into a declarative component using its own factory or base, so your
custom type slots in next to the built-ins (`<ACRect>`, `<ACCircle>`, …). The wrappers all share one
lifecycle: create the node once, attach it to the parent via context, mirror prop changes onto it,
re-emit its events, and remove it on unmount.

**React** — `createNodeComponent` from `@veyrajs/react`:

```ts
import { createNodeComponent } from '@veyrajs/react'
import { Star } from './star'

export const ACStar = createNodeComponent({
  name: 'ACStar',
  NodeClass: Star,
  isShape: true, // adds the style props (fill, stroke, ...)
  props: ['numPoints', 'innerRadius', 'outerRadius'], // your type-specific props
})
// <ACStar x={120} y={120} numPoints={6} outerRadius={60} fill="#fbbf24" />
```

The common transform props are always included; `props` lists the extras.

**Vue** — `defineNodeComponent` from `@veyrajs/vue`, same config shape:

```ts
import { defineNodeComponent } from '@veyrajs/vue'
import { Star } from './star'

export const ACStar = defineNodeComponent({
  name: 'ACStar',
  NodeClass: Star,
  isShape: true,
  props: ['numPoints', 'innerRadius', 'outerRadius'],
})
```

**Angular** — extend the `AcShapeBase` directive (or `AcNodeBase` for non-shapes), declare your
`@Input()`s, list them in `mirrorKeys`, and build the node in `createNode()`:

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import type { Node } from '@veyrajs/core'
import { AcShapeBase } from '@veyrajs/angular'
import { Star } from './star'

@Component({ selector: 'ac-star', standalone: true, template: '', changeDetection: ChangeDetectionStrategy.OnPush })
export class AcStarComponent extends AcShapeBase {
  @Input() numPoints?: number
  @Input() innerRadius?: number
  @Input() outerRadius?: number

  // mirrorKeys drives both the initial config and prop sync — list every key you want mirrored:
  protected override readonly mirrorKeys = [
    'x', 'y', 'scaleX', 'scaleY', 'rotation', 'skewX', 'skewY',
    'offsetX', 'offsetY', 'opacity', 'visible', 'listening',
    'fill', 'stroke', 'strokeWidth', 'lineDash', 'lineCap', 'lineJoin',
    'numPoints', 'innerRadius', 'outerRadius',
  ]

  protected override createNode(): Node {
    return new Star(this.buildConfig() as never)
  }
}
```

**Svelte** — wrap the exported `ACNode` in a single-file component, passing your node class and the
prop keys to mirror (include the common transform/style keys you use, plus your own):

```svelte
<script lang="ts">
import { ACNode, type ShapeProps } from '@veyrajs/svelte'
import { Star } from './star'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<ACNode
  nodeClass={Star}
  keys={['x', 'y', 'rotation', 'opacity', 'fill', 'stroke', 'strokeWidth', 'numPoints', 'innerRadius', 'outerRadius']}
  {props}
  bind:node
/>
```

## Related

- [Shapes (concept)](/Veyrajs/concepts/shapes/)
- [Shapes API](/Veyrajs/api/shapes/) — the `Shape` contract you implement.
- [Serialization API](/Veyrajs/api/serialization/) — `ClassRegistry` and the factory pattern.
- [Recipe: Custom shape](/Veyrajs/recipes/custom-shape/)
- [Custom Renderers](/Veyrajs/advanced/custom-renderers/) · [Custom Hit-Testers](/Veyrajs/advanced/custom-hit-testers/)
