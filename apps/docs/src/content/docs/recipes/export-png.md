---
title: Export to PNG
description: Export the stage canvas to a PNG with toDataURL and a temporary download link — and what device pixel ratio and a transparent background mean for the output.
sidebar:
  order: 8
---

The [`Stage`](/Veyrajs/api/scene/) exposes its `<canvas>` as `stage.canvas`, so exporting is just
`canvas.toDataURL('image/png')` fed to a temporary `<a download>`. Render synchronously first so the
canvas reflects the latest state — property changes normally schedule a *coalesced* (async) frame.

```ts
import { Stage, Rect } from '@veyrajs/core'

const container = document.querySelector('#app') as HTMLElement
// background unset → the canvas stays transparent → transparent PNG.
const stage = new Stage({ container, width: 800, height: 480 })
const layer = stage.createLayer()
layer.add(new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8' }))

function exportPng(filename = 'scene.png') {
  const canvas = stage.canvas
  if (!canvas) return                 // undefined when a renderer was injected

  stage.render()                      // force a synchronous frame so the canvas is current
  const url = canvas.toDataURL('image/png')

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()                           // triggers the download (no need to append it)
}
```

**Device pixel ratio:** the backing store is `width·dpr × height·dpr` device pixels, so on a 2× display
an 800×480 stage exports a crisp 1600×960 PNG — usually what you want. Pass `pixelRatio: 1` to the
`Stage` (or call `stage.setPixelRatio(1)`) for an export at the exact CSS size. **Transparent
background:** leave `background` unset so the renderer never paints a fill, and PNG alpha is preserved.
For very large canvases prefer `canvas.toBlob(cb, 'image/png')` with `URL.createObjectURL` over the
data URL.

## Related

- [Rendering (API)](/Veyrajs/api/rendering/) — how the backing store and DPR work.
- [Scene Graph (API)](/Veyrajs/api/scene/) — `stage.canvas`, `pixelRatio`, `render()`.
