# `src/scene/shapes/text.ts` — Text

> Single-line text with a top-left local origin.

## Purpose

Renders a single line of text. Local origin is top-left (default `textBaseline: 'top'`), so
the node's `x`/`y` is the text's top-left.

## Exports

- `interface TextConfig extends ShapeConfig` — adds `text?`, `fontSize?`, `fontFamily?`,
  `textAlign?`, `textBaseline?`.
- `class Text extends Shape` — `type = 'Text'`; accessors for each of the above plus a
  derived `font` getter (`"<fontSize>px <fontFamily>"`).

## Behaviour

- **`getLocalBounds()`** → an **approximation**: `width ≈ text.length × fontSize × 0.55`,
  `height ≈ fontSize × 1.2`.
- **`drawOps()`** → a `text` op carrying `text`, `font`, alignment, and paint.
- **`containsPoint(p)`** → inside the approximate bounds.

## Conventions & gotchas

- **Defaults to black.** If no `fill` (and no `stroke`) is provided, `fill` is set to
  `'#000'` so text is visible out of the box.
- **Bounds are coarse.** Without a measuring context, width is estimated from glyph count.
  This is fine for layout and rough hit-testing; precise measurement (via the renderer) is a
  later refinement. Provide your own layout if you need exact metrics now.
- MVP is **single-line, render-only** — no editing, wrapping, or rich text (those are out of
  core scope per the plan).

## Example

```ts
new Text({ x: 40, y: 320, text: 'AnnotaCanvas', fontSize: 20, fill: '#e2e8f0' })
```

See [shapes overview](./index.md), [`Shape`](../shape.md), and the
[`text` draw-op](../../render/draw-ops.md).
