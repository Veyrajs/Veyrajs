# `src/scene/shapes/image.ts` — Image

> Bitmap image with a top-left local origin.

## Purpose

Draws any `CanvasImageSource` (`HTMLImageElement`, `HTMLCanvasElement`, `ImageBitmap`,
video, …) at a given `width × height`. **Loading** the source is the caller's job — the
shape only draws what it is given.

## Exports

- `interface ImageConfig extends ShapeConfig` — adds `image?`, `width?`, `height?`.
- `class Image extends Shape` — `type = 'Image'`; accessors `image`, `width`, `height`.

## Behaviour

- **`getLocalBounds()`** → `Bounds(0, 0, width, height)`.
- **`drawOps()`** → an `image` op — **or `[]` when `image` is `null`** (nothing to draw).
- **`containsPoint(p)`** → inside the `width × height` box.

## Conventions & gotchas

- **Name shadowing.** This `Image` is the engine's shape, not the DOM `Image`
  (`HTMLImageElement`) constructor. Import it as `import { Image } from '@annotacanvas/core'`;
  to construct a DOM image use `new globalThis.Image()`.
- **Explicit size.** `width`/`height` default to `0`; set them (e.g. to the source's natural
  size) so the image is visible.
- Set the source asynchronously: create the shape, then assign `image` once it has loaded;
  the assignment marks the node dirty and triggers a repaint.

## Example

```ts
const img = new Image({ x: 20, y: 20, width: 256, height: 256 })
const el = new globalThis.Image()
el.onload = () => { img.image = el }
el.src = '/photo.jpg'
```

See [shapes overview](./index.md) and [`Shape`](../shape.md).
