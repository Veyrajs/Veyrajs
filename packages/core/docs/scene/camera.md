# `src/scene/camera.ts` — Camera (zoom/pan)

> The viewport's view onto the world. Applied at render time; it never changes world
> coordinates.

## Purpose

`Camera` holds a uniform `zoom` and a pan offset (`x`, `y` in screen pixels) and produces
the **world → screen** view matrix and its inverse. It powers zoom/pan and the
`screenToWorld`/`worldToScreen` conversions, including **cursor-anchored zoom**.

The single most important property: the camera is a *view*, not part of the world. Nodes'
`worldMatrix()` stays camera-independent; the `Stage` composes `view · world` only at
render time. So selection bounds, hit-testing, and serialization (all in world space) are
unaffected by zoom/pan.

## Exports

- `interface CameraOptions { zoom?; x?; y?; minZoom?; maxZoom? }`.
- `class Camera`:
  - state: `zoom` (get/set), `x`, `y`, `minZoom`, `maxZoom`,
  - `viewMatrix()` — cached `[zoom, 0, 0, zoom, x, y]`,
  - `worldToScreen(point)`, `screenToWorld(point)`,
  - `setZoom(z)`, `panBy(dx, dy)`, `panTo(x, y)`, `zoomAt(anchor, factor)`, `reset()`,
  - `onChange` — a callback the `Stage` wires to `requestRender`.

## How it works

The view matrix maps `screen = zoom · world + (x, y)`. `screenToWorld` is its inverse.

**`zoomAt(anchor, factor)`** is the cursor-anchored zoom: it finds the world point under
the screen `anchor`, applies the (clamped) new zoom, then sets the pan so that world point
maps back to the same `anchor`. The result: the point under the cursor stays put while the
scene scales around it. (Proven both by unit test and in the demo.)

Every mutation clears the cached matrix and fires `onChange`, so the `Stage` schedules a
single coalesced repaint.

## Conventions & gotchas

- **Camera ≠ world.** Zoom/pan change only what you *see*; world coordinates never move.
- **Zoom is clamped** to `[minZoom, maxZoom]` (defaults `0.02`–`64`).
- **DPR is separate.** The camera works in CSS-pixel screen space; device-pixel-ratio
  scaling lives in the renderer. The two compose at draw time as `dpr · view · world`.
- **Rotation is reserved.** The matrix supports it, but the MVP exposes zoom + pan only.
- **Screen origin** is the stage/host top-left; convert raw pointer coordinates by
  subtracting the host's bounding-rect offset before calling `screenToWorld`.

## Relationships

- **Uses:** [`Matrix`](../math/matrix.md), [`Vec2`](../math/vec2.md).
- **Owned by:** [`Stage`](./stage.md), which sets `camera.onChange = () => this.requestRender()`
  and applies `camera.viewMatrix()` in the render walk. `Stage.screenToWorld` /
  `worldToScreen` delegate here.

## Example

```ts
stage.camera.zoomAt({ x: 200, y: 150 }, 1.1) // zoom in 10% about the cursor
stage.camera.panBy(40, 0)                     // pan right 40px
const world = stage.screenToWorld({ x: 200, y: 150 })
stage.camera.reset()
```
