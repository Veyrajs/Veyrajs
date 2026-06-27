---
title: Styling
description: Fill, stroke, dashes, line caps/joins, opacity, and visibility.
sidebar:
  order: 3
---

Every `Shape` carries the same bundle of paint properties (the `FillStrokeStyle`), and every `Node`
carries `opacity` and `visible`. All are typed accessors you can read and assign at any time — a
paint change marks the node dirty (a repaint) but, unlike a transform change, does **not** move the
geometry.

## Fill & stroke

`fill` and `stroke` are **CSS color strings** (or `null` for "none"). Anything the Canvas 2D context
accepts works: named colors, `#rgb`/`#rrggbb`/`#rrggbbaa`, `rgb()/rgba()`, `hsl()/hsla()`.

```ts
new Rect({ width: 120, height: 80, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2 })
new Circle({ radius: 40, fill: 'rgba(244, 114, 182, 0.6)' })       // translucent fill
new Polygon({ points, fill: null, stroke: '#f59e0b', strokeWidth: 3 }) // outline only
```

- A shape with `fill` set is hit-testable on its interior; a shape with only a `stroke` is hit near
  its outline. See [Hit-Testing](/Veyrajs/concepts/hit-testing/).
- `Text` defaults `fill` to black when you provide neither fill nor stroke, so it's never invisible.

:::note[Gradients & patterns]
The MVP paints with solid CSS colors. Canvas gradients/patterns and per-shape blend modes are not
yet part of the `DrawOp` vocabulary — they'll arrive as the draw-op union grows (shared across
backends). For now, a gradient-filled bitmap via an [`Image`](/Veyrajs/concepts/shapes/) shape is the
escape hatch.
:::

## Stroke styling

| Property | Type | Notes |
| --- | --- | --- |
| `strokeWidth` | `number` | Width in **local** units (scales with the node). |
| `lineDash` | `number[] \| null` | Dash pattern, e.g. `[6, 4]`. `null`/`[]` = solid. |
| `lineCap` | `'butt' \| 'round' \| 'square'` | End-cap of open strokes. |
| `lineJoin` | `'miter' \| 'round' \| 'bevel'` | Corner style between segments. |

```ts
new Line({
  points: [{ x: 0, y: 0 }, { x: 120, y: 40 }, { x: 240, y: 0 }],
  stroke: '#fbbf24',
  strokeWidth: 4,
  lineDash: [10, 6],
  lineCap: 'round',
  lineJoin: 'round',
})
```

## Opacity & visibility

`opacity` (0–1) and `visible` (boolean) live on **every** `Node`, not just shapes.

```ts
rect.opacity = 0.5   // half-transparent
rect.visible = false // skipped entirely in the render walk (and in hit-testing)
```

- A node with `visible === false` (or `opacity <= 0`) is skipped in the render walk, and a
  non-`listening`/non-visible subtree is skipped in hit-testing too.

:::caution[Group opacity doesn't compound yet]
Today each shape applies **its own** opacity; a `Group`'s opacity does not yet multiply onto its
descendants (a planned refinement). To fade a group uniformly, set opacity on its shapes for now.
:::

## Z-order

Paint order is **child array order** — earlier children draw first (behind). Reorder with the
container's z-order methods (a visual change; transforms are untouched):

```ts
layer.moveToTop(rect)     // rect paints last → in front
layer.moveToBottom(rect)  // rect paints first → behind
layer.moveUp(rect)        // swap with the next sibling
layer.moveDown(rect)
```

## Related

- [Shapes](/Veyrajs/concepts/shapes/) — the geometry each style is applied to.
- [Rendering & the Frame Loop](/Veyrajs/concepts/rendering/) — how `fill`/`stroke` become draw ops.
