# `src/controls/selection-controller.ts` — Interactive transformer

> Click/marquee select, drag to move, and resize/rotate handles — with a screen-space overlay.

## Purpose

Ties everything together: it listens to stage pointer events, drives a `SelectionManager`,
applies move/resize/rotate to the selected node(s), and renders the selection box + handles
as a screen-space [`Overlay`](../scene/stage.md).

## Exports

- `interface SelectionControllerOptions` — `selection?`, `handleSize?`, `rotateEnabled?`,
  `boundBox?`, `color?`.
- `class SelectionController implements Overlay`:
  - `selection` — the managed `SelectionManager`,
  - `drawOps()` — the overlay (box + handles + marquee),
  - `destroy()` — unbind listeners, remove the overlay, reset the cursor.

## How it works

### Input (capture phase)

It registers `pointerdown`/`move`/`up` on the stage in the **capture** phase and
`stopPropagation()`s when it acts — so it is authoritative over node-level handlers. On
`pointerdown` (left button):

1. **Handle?** For a single selection, if the pointer is within `handleSize` of a handle's
   screen position, begin a resize/rotate drag (snapshotting the anchor/center).
2. **Shape?** Otherwise, if a shape is hit, select it (shift toggles) and begin a move.
3. **Empty?** Otherwise clear (unless shift) and begin a marquee.

On `move` it applies the active drag (move/resize/rotate via [transform-math](./transform-math.md),
or grows the marquee). On `up` it commits a marquee by selecting shapes whose world bounds
intersect the marquee rect.

### Overlay (screen space)

`drawOps()` computes the box and handle positions by mapping the selected node's local-bounds
points through its world matrix and then `worldToScreen` — so the handles are constant size at
any zoom. A single selection shows the **oriented** box + 8 resize handles + rotate handle; a
multi-selection shows the combined world-AABB box (move only).

## Conventions & gotchas

- **Screen-space, not scene nodes.** Controls never enter the scene graph; they're an overlay
  and are hit-tested manually in screen coordinates. This is why they stay 9px at any zoom.
- **Left button only.** It ignores non-primary buttons, leaving e.g. middle-drag free for a
  pan tool.
- **Direct mutation today.** Move/resize/rotate set node properties directly; Phase 8 routes
  them through undoable commands.
- **Cursor feedback.** Hovering a handle sets the host element's CSS cursor; `destroy()`
  resets it.

## Relationships

- **Implements:** [`Overlay`](../scene/stage.md). **Owns:** a
  [`SelectionManager`](../selection/selection-manager.md).
- **Uses:** the [event system](../events/README.md), [hit-testing](../hit/README.md)
  (`stage.getIntersection`), the [camera](../scene/camera.md) (`worldToScreen`),
  [`DEFAULT_CONTROLS`](./controls.md), and [transform-math](./transform-math.md).

## Example

```ts
const controller = new SelectionController(stage, {
  boundBox: (r) => ({ ...r, scaleX: Math.max(0.1, r.scaleX), scaleY: Math.max(0.1, r.scaleY) }),
})
controller.selection.onChange((nodes) => updatePanel(nodes))
```
