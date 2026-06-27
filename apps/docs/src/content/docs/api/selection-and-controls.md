---
title: Selection & Controls
description: SelectionManager state, the interactive SelectionController, handle definitions, and resize/rotate transform math.
sidebar:
  order: 9
---

[`SelectionManager`](#selectionmanager) is pure selection state. [`SelectionController`](#selectioncontroller)
is the interactive transformer — click/marquee select, drag to move, resize/rotate handles —
rendered as a screen-space overlay. Handles are described declaratively by
[`ControlDef`](#controldef); the geometry lives in pure [transform-math](#transform-math) functions.

## `SelectionManager`

Tracks the selected-node set and notifies listeners. Pure state — no rendering or input.
`type SelectionChangeListener = (selected: readonly Node[]) => void`.

```ts
class SelectionManager {
  // reads
  get nodes(): readonly Node[]   // selected nodes, in insertion order (readonly view)
  get size(): number
  get isEmpty(): boolean
  get single(): Node | null      // the lone node, or null
  has(node: Node): boolean

  // writes  — set/select replace; add/remove/toggle mutate; all de-duplicate
  select(...nodes: Node[]): void
  set(list: readonly Node[]): void
  add(...nodes: Node[]): void
  remove(...nodes: Node[]): void
  toggle(node: Node): void
  clear(): void

  onChange(listener: SelectionChangeListener): () => void  // subscribe; returns unsubscribe
}
```

Mutators **only emit when the set actually changes** (so `select(a)` twice fires once).

```ts
const sel = new SelectionManager()
const off = sel.onChange((nodes) => console.log('selected', nodes.length))
sel.select(rect)
sel.add(circle)
sel.toggle(rect) // now just the circle
off()
```

## `SelectionController`

```ts
class SelectionController implements Overlay {
  constructor(stage: Stage, options?: SelectionControllerOptions)
  selection: SelectionManager   // the managed selection state
  drawOps()                     // the overlay: box + handles + marquee
  destroy(): void               // unbind listeners, remove the overlay, reset the cursor
}
```

Registers `pointerdown`/`move`/`up` on the stage in the **capture** phase and
`stopPropagation()`s when it acts. On `pointerdown` (left button only): hit a **handle** of a
single selection → begin a resize/rotate drag; hit a **shape** → select it (shift toggles)
and begin a move; **empty** → clear (unless shift) and begin a marquee. Controls live in
screen space (never in the scene graph), so handles stay constant-size at any zoom.

### `SelectionControllerOptions`

- `selection?: SelectionManager` — reuse an existing manager instead of creating one.
- `handleSize?: number` — handle hit radius in screen pixels.
- `rotateEnabled?: boolean` — show the rotate handle.
- `boundBox?` — clamp/transform the resize result (e.g. enforce a minimum scale).
- `color?` — overlay color.
- `history?` — a [command history](/Veyrajs/api/commands/); move/resize/rotate are recorded
  as a `SetPropsCommand` (a `CompositeCommand` for multi-move) on release, for undo.

```ts
const controller = new SelectionController(stage, {
  boundBox: (r) => ({ ...r, scaleX: Math.max(0.1, r.scaleX), scaleY: Math.max(0.1, r.scaleY) }),
})
controller.selection.onChange((nodes) => updatePanel(nodes))
```

## Control handles

```ts
type HandleKind = 'resize' | 'rotate'

interface ControlDef {
  key: string         // stable id: 'tl', 'tr', 'mt', 'rotate', …
  nx: number          // normalized X on bounds (0 = left, 1 = right)
  ny: number          // normalized Y on bounds (0 = top, 1 = bottom)
  offsetX: number     // screen-pixel offset (the rotate handle floats above the top edge)
  offsetY: number
  kind: HandleKind
  cursor: string
  anchorNx?: number   // normalized position of the opposite (fixed) corner, for resizes
  anchorNy?: number
}
```

`const DEFAULT_CONTROLS` — the 8 resize handles (4 corners + 4 edge midpoints) plus a rotate
handle. `ControlDef` is pure data; the `SelectionController` lays it out, hit-tests it, and
drives the transform.

## transform-math

Pure functions (no DOM, no state) that compute the new node transform for resize and rotate
drags.

```ts
// anchored, rotation-aware resize — the opposite corner (anchor) stays fixed in world space
function computeResize(ctx: ResizeContext, pointerWorld: Vec2): { x: number; y: number; scaleX: number; scaleY: number }

// center-fixed rotation — the bounds center stays put
function computeRotation(ctx: RotateContext, pointerWorld: Vec2): { x: number; y: number; rotation: number }

// angle in radians of the pointer around centerParent — capture the rotate start angle
function pointerAngle(node: Node, centerParent: Vec2, pointerWorld: Vec2): number
```

`ResizeContext` / `RotateContext` are the input types: their fields (anchor or center in
parent & local space, start angle, start rotation) are **snapshotted when the drag begins**
and fed in on every move. The math targets `localMatrix = T·R·S` (no pivot offset/skew). A
drag past the anchor yields a negative scale (a flip) — clamp it via `boundBox` if undesired.

## Related

- [Selection (concept)](/Veyrajs/concepts/selection/)
- [Commands (API)](/Veyrajs/api/commands/)
