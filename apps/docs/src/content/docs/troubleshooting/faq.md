---
title: Troubleshooting & FAQ
description: Common setup, rendering, event, adapter, and serialization gotchas — and their fixes.
sidebar:
  order: 1
  label: Troubleshooting & FAQ
---

Quick answers to the issues people hit most. If something here doesn't cover your case, check the
relevant [Core Concept](/Veyrajs/concepts/scene-graph/) or [API](/Veyrajs/api/overview/) page.

## Setup & rendering

### Nothing shows up on the canvas

The most common cause: **shapes were added straight to the `Stage`.** A `Stage`'s only legal
children are `Layer`s — `stage.add()` throws on anything else. Shapes go on a layer:

```ts
const stage = new Stage({ container, width: 800, height: 480 })
const layer = stage.createLayer() // or: const layer = new Layer(); stage.add(layer)
layer.add(new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8' }))
```

Also check: the `container` element is in the DOM and has a size, and you passed `width`/`height`.

### Do I need to call `render()`?

**No.** Mutating a node (`rect.x = 60`) marks the scene dirty and schedules **one** coalesced
redraw on the next animation frame. `render()` exists for synchronous needs and tests;
`requestRender()` is the async path. See [Rendering & the Frame Loop](/Veyrajs/concepts/rendering/).

### My `Image` shape is blank

Two things: `Image` defaults `width`/`height` to `0` (set them), and **you** must load the source —
the shape only draws what it's given. Also, `Image` from `@veyrajs/core` is the engine shape, not
the DOM constructor — use `new globalThis.Image()` for the latter:

```ts
const img = new Image({ x: 0, y: 0, width: 256, height: 256 })
const el = new globalThis.Image()
el.onload = () => { img.image = el }
el.src = '/photo.jpg'
```

### My `Text` is invisible

If you set neither `fill` nor `stroke`, `Text` defaults to black (`#000`) — which disappears on a
dark background. Set a `fill`. Note text bounds are approximate (estimated from glyph count).

### The canvas looks blurry

Device-pixel-ratio scaling is handled inside the renderer — you should not do DPR math in scene
code. If it's still blurry, ensure you didn't CSS-resize the canvas; let the `Stage`/`setSize` own
the dimensions, and use `pixelRatio` only to override the device default.

## Events & interaction

### A node doesn't receive events

- Check `listening` and `visible` — a non-listening or non-visible subtree is skipped in
  hit-testing.
- A shape with only a `stroke` (no `fill`) is hit **near its outline**, not its interior. Add a
  `fill`, or click closer to the edge. Hit tolerance is in **screen pixels** (zoom-invariant).
- Bind the handler on the right node — `click` fires on the resolved target and bubbles to ancestors
  and the `Stage`.

### Events on the empty canvas don't fire

They do — when nothing is hit, the **`Stage`** becomes the target. A stage-level `wheel` or
`pointermove` handler fires anywhere. See [Events](/Veyrajs/concepts/events/).

### Wheel zoom also scrolls the page

Call `event.preventDefault()` in your `wheel` handler — the listener is bound non-passive precisely
so this works:

```ts
stage.on('wheel', (e) => { e.preventDefault(); stage.camera.zoomAt(e.screenPoint, e.deltaY < 0 ? 1.1 : 1 / 1.1) })
```

### Drag moves the wrong node after a fast flick

That's by design: `dragstart`/`dragmove`/`dragend` target the **press** node, not whatever is
under the pointer mid-drag — so a fast drag that outruns the cursor still moves the right node.

### Screen vs. world coordinates

Pointer math is in **screen** space; the scene is in **world** space. Convert with
`stage.screenToWorld(point)` / `worldToScreen(point)`. Every `SceneEvent` already carries both
`screenPoint` and `worldPoint`, so you rarely convert by hand. See
[Camera & Coordinate Spaces](/Veyrajs/concepts/camera/).

### Selection handles stay the same size when I zoom

Intended — the `SelectionController` overlay is drawn in **screen space**, so handles are a constant
size at any zoom (the behaviour an editor wants).

## Framework adapters

### A hook/composable returns `null`

The `Stage` is created in an effect / `onMount`, so a component mounting in the same commit as
`<ACStage>` sees `null` on the first render, then the real value. Guard it: `if (!stage) return`.
`useSelection()`/`useHistory()` are non-null only under `<ACStage selectable>`.

### My props and events seem to loop

They won't. The engine's setters are **guarded** — assigning an unchanged value is a no-op — so the
prop → node → event → state → prop round-trip ends quietly. Just set state from events when you let
users edit; no echo-suppression needed.

### The UI doesn't update when I mutate a node imperatively

Hooks/composables return live engine objects; mutating a node does not re-render your framework
tree. Drive the UI from props, or subscribe to engine events / `onChange` listeners and lift the
state yourself.

## Serialization & undo

### After `load`/`parse`, undo is broken or shapes are gone

`load`/`parse` **replace** the stage — the old node instances are gone. Clear your selection and
**call `history.clear()`** around a load, and re-acquire references (e.g. the layer via
`stage.children[0]`). See [Serialization](/Veyrajs/concepts/serialization/).

### My image didn't survive save/load

Only an image's **size** round-trips (assets are by-reference). Reassign its `image` source after
loading.

### My camera zoom/pan wasn't saved

Stage size, pixel ratio, and camera zoom/pan are **viewport** state and are intentionally not
serialized — persist them separately if you need them.

### Loading an old scene throws "no migration"

Register a one-step `MigrationRunner` migration for each version bump (`0→1`, `1→2`, …) and pass it
to the `SceneSerializer`. A missing step throws rather than guessing — see
[Schema Migrations](/Veyrajs/advanced/migrations/).

## Performance

For large scenes, see [Performance](/Veyrajs/advanced/performance/): rely on coalesced redraws, cull
with `visible`/`listening`, keep layers few, and consider a spatial-index `HitTester` for very large
node counts.

## Related

- [Getting Started](/Veyrajs/guides/getting-started/)
- [Core Concepts](/Veyrajs/concepts/scene-graph/)
- [API Reference](/Veyrajs/api/overview/)
