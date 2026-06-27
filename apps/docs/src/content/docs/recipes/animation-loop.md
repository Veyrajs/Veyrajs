---
title: Animation Loop
description: Animate node properties with requestAnimationFrame, since there is no built-in tween system.
sidebar:
  order: 6
---

Veyrajs has no built-in tween or animation system. To animate, mutate node properties inside a
`requestAnimationFrame` loop — each setter schedules a coalesced frame, so the scene repaints
on its own. Use a time delta so motion is frame-rate independent, and keep the frame id so you
can stop the loop on teardown.

```ts
import { Stage, Rect } from '@veyrajs/core'

const stage = new Stage({
  container: document.getElementById('app')!,
  width: 800,
  height: 480,
  background: '#0b1220',
})
const layer = stage.createLayer()

// Pivot at the box center so it spins in place (offset is subtracted before rotation).
const box = new Rect({
  x: 400, y: 240, width: 120, height: 120,
  offsetX: 60, offsetY: 60,
  fill: '#38bdf8',
})
layer.add(box)

let rafId = 0
let last = performance.now()

function frame(now: number) {
  const dt = (now - last) / 1000 // seconds since the last frame
  last = now
  box.rotation += 90 * dt // 90 degrees per second (rotation is in degrees)
  box.x = 400 + Math.sin(now / 1000) * 120 // drift left/right
  rafId = requestAnimationFrame(frame)
}
rafId = requestAnimationFrame(frame)

// Teardown: stop the loop, then tear down the stage.
// cancelAnimationFrame(rafId)
// stage.destroy()
```

Setting `box.rotation` and `box.x` each frame is all that's needed — you never call
`render()`, because changing a property marks the node dirty and the stage coalesces one frame.
`rotation` is in degrees, so `90 * dt` is a steady 90 deg/sec spin; the `offsetX`/`offsetY`
pivot puts the rotation center at the box's middle. Always store the id from
`requestAnimationFrame` and `cancelAnimationFrame(rafId)` when tearing down, or the loop keeps
running after the stage is gone.

## Related

- [Scene Graph (API)](/Veyrajs/api/scene/)
- [Shapes (API)](/Veyrajs/api/shapes/)
- [Recipe: Pan & Zoom](/Veyrajs/recipes/pan-and-zoom/)
