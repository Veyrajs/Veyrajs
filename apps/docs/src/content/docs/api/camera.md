---
title: Camera
description: The Camera class — a zoom/pan view onto the world, applied at render time, with cursor-anchored zoom.
sidebar:
  order: 4
---

`Camera` is the viewport's view onto the world: a uniform `zoom` plus a pan offset (`x`, `y` in screen pixels) that produce the world → screen view matrix and its inverse. It powers zoom/pan, the `screenToWorld` / `worldToScreen` conversions, and cursor-anchored zoom.

The camera is a *view, not part of the world*. Nodes' `worldMatrix()` stays camera-independent; the [`Stage`](/Veyrajs/api/scene/) composes `view · world` only at render time, so selection bounds, hit-testing, and serialization (all in world space) are unaffected by zoom/pan.

## CameraOptions

```ts
interface CameraOptions {
  zoom?: number
  x?: number
  y?: number
  minZoom?: number   // default 0.02
  maxZoom?: number   // default 64
}
```

## Camera

`class Camera`

### State

Get/set accessors.

```ts
zoom: number      // clamped to [minZoom, maxZoom]
x: number         // pan offset, screen px
y: number
minZoom: number   // default 0.02
maxZoom: number   // default 64
```

### Matrix & conversions

```ts
viewMatrix(): Matrix        // cached [zoom, 0, 0, zoom, x, y]; screen = zoom·world + (x, y)
worldToScreen(point): Vec2
screenToWorld(point): Vec2  // inverse of viewMatrix
```

### Mutations

Each clears the cached matrix and fires `onChange` (one coalesced repaint).

```ts
setZoom(z: number)                  // clamped to [minZoom, maxZoom]
panBy(dx: number, dy: number)
panTo(x: number, y: number)
zoomAt(anchor: Vec2, factor: number) // cursor-anchored zoom about the screen point `anchor`
reset()
```

`zoomAt` finds the world point under the screen `anchor`, applies the clamped new zoom, then sets the pan so that world point maps back to the same `anchor` — the point under the cursor stays put while the scene scales around it.

### Callback

```ts
onChange: () => void   // fired on every mutation
```

```ts
stage.camera.zoomAt({ x: 200, y: 150 }, 1.1) // zoom in 10% about the cursor
stage.camera.panBy(40, 0)                     // pan right 40px
const world = stage.screenToWorld({ x: 200, y: 150 })
stage.camera.reset()
```

## Conventions

- **Camera ≠ world.** Zoom/pan change only what you *see*; world coordinates never move.
- **Zoom is clamped** to `[minZoom, maxZoom]` (defaults `0.02`–`64`).
- **Don't overwrite `onChange`.** The [`Stage`](/Veyrajs/api/scene/) owns it (`camera.onChange = () => this.requestRender()`); replacing it breaks coalesced repaint.
- **Screen origin** is the stage/host top-left — subtract the host's bounding-rect offset from raw pointer coordinates before calling `screenToWorld`.
- **DPR is separate** (it lives in the renderer; the two compose as `dpr · view · world`). **Rotation is reserved** — the matrix supports it, but the MVP exposes zoom + pan only.

Uses [`Matrix` and `Vec2`](/Veyrajs/api/math/).

## Related

- [Camera concepts](/Veyrajs/concepts/camera/)
- [Scene Graph API](/Veyrajs/api/scene/)
