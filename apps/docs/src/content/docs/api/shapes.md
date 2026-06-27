---
title: Shapes
description: The Shape base class, its paint config and hit contract, plus the seven concrete drawable leaves and their local origins.
sidebar:
  order: 5
---

Drawable leaf nodes. Each concrete shape extends [`Shape`](#shape) (which extends
[`Node`](/Veyrajs/api/scene/)) and implements `getLocalBounds()`, `drawOps()`, and `hitTest()`.
The node transform (`x`, `y`, `scale`, `rotation`, …) places the shape; geometry is authored around
the shape's **local origin**, which differs by shape.

| Shape | Config | Local origin | Drawn via |
| --- | --- | --- | --- |
| `Rect` | `RectConfig` | top-left `(0,0)` | `rect` op |
| `Circle` | `CircleConfig` | center `(0,0)` | `ellipse` op |
| `Ellipse` | `EllipseConfig` | center `(0,0)` | `ellipse` op |
| `Line` | `LineConfig` | explicit points | `polygon` op (open) |
| `Polygon` | `PolygonConfig` | explicit points | `polygon` op (closed) |
| `Image` | `ImageConfig` | top-left `(0,0)` | `image` op |
| `Text` | `TextConfig` | top-left `(0,0)` | `text` op |

All are named exports of `@veyrajs/core`, each alongside its `*Config` type.

## Shape

`abstract class Shape extends Node implements Renderable` — base for all drawable leaves, where
[`Renderable`](/Veyrajs/api/rendering/) is the renderer-facing contract. It is the bridge between the
scene graph and the renderer: it carries paint style, emits [`DrawOp`s](/Veyrajs/api/rendering/), and
answers point queries. Setting a paint property calls
`markDirty()` (a repaint) but does **not** invalidate the transform — paint doesn't move geometry.

### ShapeConfig

`interface ShapeConfig extends NodeConfig` — adds paint props (all optional):

- `fill` — fill paint
- `stroke` — stroke paint
- `strokeWidth` — stroke width
- `lineDash` — dash pattern
- `lineCap` — line cap style
- `lineJoin` — line join style

### Hit types

- `type ShapeHitKind = 'fill' | 'stroke'` — which part of a shape was hit.
- `interface ShapeHitOptions` — `tolerance`, `fill`, `stroke`.

### Methods

- `abstract getLocalBounds(): Bounds` — extent in local space (used for world bounds and the
  hit-test broad phase).
- `abstract drawOps(): DrawOp[]` — backend-neutral ops in **local** coordinates (usually spreading
  the paint style).
- `abstract hitTest(localPoint, options?): ShapeHitKind | null` — local-space hit test; `tolerance`
  (local units) is additive to the geometry.
- `containsPoint(localPoint, tolerance?): boolean` — boolean convenience over `hitTest`.
- `getVertices()` — local corners/points for vertex hit-testing (default `null`).
- `protected get fillStrokeStyle` — the style bundle subclasses spread into their ops. **Protected
  implementation helper, not public API.**

A concrete shape never sees a `CanvasRenderingContext2D` and must emit only local-space geometry; the
renderer applies the world transform.

```ts
class Rect extends Shape {
  readonly type = 'Rect'
  width = 0; height = 0
  getLocalBounds() { return Bounds.fromRect(0, 0, this.width, this.height) }
  drawOps() { return [{ type: 'rect', x: 0, y: 0, width: this.width, height: this.height, ...this.fillStrokeStyle }] }
  hitTest(p) { return p.x >= 0 && p.y >= 0 && p.x <= this.width && p.y <= this.height ? 'fill' : null }
}
```

## Rect

`interface RectConfig extends ShapeConfig` — adds `width?`, `height?`.
`class Rect extends Shape` — `type = 'Rect'`; accessors `width`, `height`. **Local origin top-left
`(0,0)`** — geometry spans `(0,0)` to `(width, height)`.

- `getLocalBounds()` → `Bounds(0, 0, width, height)`.
- `drawOps()` → one `rect` op at `(0,0)` with the shape's paint style.
- `containsPoint(p)` → `0 ≤ p.x ≤ width && 0 ≤ p.y ≤ height`.

```ts
new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2 })
```

## Circle

`interface CircleConfig extends ShapeConfig` — adds `radius?`.
`class Circle extends Shape` — `type = 'Circle'`; accessor `radius`. **Local origin center `(0,0)`** —
the node's `x`/`y` is the center. A `Circle` is an `Ellipse` with equal radii (convenience).

- `getLocalBounds()` → `Bounds(-r, -r, 2r, 2r)`.
- `drawOps()` → an `ellipse` op with `radiusX = radiusY = radius`.
- `containsPoint(p)` → `p.x² + p.y² ≤ r²`.

```ts
new Circle({ x: 300, y: 95, radius: 52, fill: '#f472b6' })
```

## Ellipse

`interface EllipseConfig extends ShapeConfig` — adds `radiusX?`, `radiusY?`.
`class Ellipse extends Shape` — `type = 'Ellipse'`; accessors `radiusX`, `radiusY`. **Local origin
center `(0,0)`**; rotation comes from the node, not the op.

- `getLocalBounds()` → `Bounds(-rx, -ry, 2rx, 2ry)`.
- `drawOps()` → an `ellipse` op centered at `(0,0)`.
- `containsPoint(p)` → `(p.x/rx)² + (p.y/ry)² ≤ 1` (returns `false` for non-positive radii).

```ts
new Ellipse({ x: 480, y: 95, radiusX: 80, radiusY: 48, fill: '#a78bfa' })
```

## Line

`interface LineConfig extends ShapeConfig` — adds `points?: Vec2[]`, `closed?: boolean`.
`class Line extends Shape` — `type = 'Line'`; accessors `points`, `closed`. An **open polyline**
through explicit local-space points; set `closed` to join the last point back to the first.

- `getLocalBounds()` → `Bounds.fromPoints(points)`.
- `drawOps()` → a `polygon` op with `closed` reflecting the flag.
- `containsPoint(p)` → near the stroke: `distanceToPolyline(p, points, closed) ≤ tol`, where
  `tol = max(strokeWidth / 2, 2)`.

Points are **copied** on set/construction; the getter returns a `readonly` view. Stroke-oriented —
for a filled closed shape prefer [`Polygon`](#polygon). (`Vec2` and the geometry helpers live in
[Math](/Veyrajs/api/math/).)

```ts
new Line({
  x: 40, y: 230,
  points: [{ x: 0, y: 0 }, { x: 110, y: 50 }, { x: 220, y: 0 }],
  stroke: '#fbbf24', strokeWidth: 3,
})
```

## Polygon

`interface PolygonConfig extends ShapeConfig` — adds `points?: Vec2[]`.
`class Polygon extends Shape` — `type = 'Polygon'`; accessor `points`. A **closed, fillable** shape
through explicit points — the fillable counterpart to [`Line`](#line).

- `getLocalBounds()` → `Bounds.fromPoints(points)`.
- `drawOps()` → a `polygon` op with `closed: true`.
- `containsPoint(p)` → inside the fill **or** near an edge:
  - if `fill` is set and `pointInPolygon(p, points)` → hit;
  - else `distanceToPolyline(p, points, true) ≤ max(strokeWidth / 2, 2)`.

Points are **copied**; the getter returns a `readonly` view. The fill hit test applies only when
`fill` is set, so an unfilled polygon is hit only near its outline.

```ts
new Polygon({
  x: 470, y: 205,
  points: [{ x: 0, y: -48 }, { x: 46, y: 34 }, { x: -46, y: 34 }],
  fill: '#34d399', stroke: '#059669', strokeWidth: 2,
})
```

## Image

`interface ImageConfig extends ShapeConfig` — adds `image?`, `width?`, `height?`.
`class Image extends Shape` — `type = 'Image'`; accessors `image`, `width`, `height`. Draws any
`CanvasImageSource` (`HTMLImageElement`, `HTMLCanvasElement`, `ImageBitmap`, video, …) at a given
`width × height`. **Local origin top-left `(0,0)`**; loading the source is the caller's job.

- `getLocalBounds()` → `Bounds(0, 0, width, height)`.
- `drawOps()` → an `image` op — **or `[]` when `image` is `null`** (nothing to draw).
- `containsPoint(p)` → inside the `width × height` box.

`width`/`height` default to `0`; set them so the image is visible. Assigning `image` later marks the
node dirty and triggers a repaint.

:::caution[Name shadowing]
This `Image` is the engine's shape, not the DOM `Image` (`HTMLImageElement`) constructor. Import it
as `import { Image } from '@veyrajs/core'`; to construct a DOM image use `new globalThis.Image()`.
:::

```ts
const img = new Image({ x: 20, y: 20, width: 256, height: 256 })
const el = new globalThis.Image()
el.onload = () => { img.image = el }
el.src = '/photo.jpg'
```

## Text

`interface TextConfig extends ShapeConfig` — adds `text?`, `fontSize?`, `fontFamily?`, `textAlign?`,
`textBaseline?`.
`class Text extends Shape` — `type = 'Text'`; accessors for each of the above plus a derived `font`
getter (`"<fontSize>px <fontFamily>"`). Single line; **local origin top-left** (default
`textBaseline: 'top'`).

- `getLocalBounds()` → an **approximation**: `width ≈ text.length × fontSize × 0.55`,
  `height ≈ fontSize × 1.2`.
- `drawOps()` → a `text` op carrying `text`, `font`, alignment, and paint.
- `containsPoint(p)` → inside the approximate bounds.

**Defaults to black:** if no `fill` (and no `stroke`) is provided, `fill` is set to `'#000'` so text
is visible. Metrics are coarse (estimated from glyph count); the MVP is single-line, render-only — no
editing, wrapping, or rich text.

```ts
new Text({ x: 40, y: 320, text: 'Veyrajs', fontSize: 20, fill: '#e2e8f0' })
```

## Related

- [Shapes (concept)](/Veyrajs/concepts/shapes/)
- [Styling](/Veyrajs/concepts/styling/)
- [Rendering API](/Veyrajs/api/rendering/)
