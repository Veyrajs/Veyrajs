# `src/controls/controls.ts` — Handle definitions

> Declarative control-handle descriptions (Fabric-inspired).

## Purpose

Describes the transform handles as data — position, cursor, and (for resize) the anchor —
so the controller can lay them out and hit-test them generically.

## Exports

- `type HandleKind` — `'resize' | 'rotate'`.
- `interface ControlDef`:
  - `key` — stable id (`tl`, `tr`, `mt`, `rotate`, …).
  - `nx` / `ny` — normalized position on the selection bounds (0 = left/top, 1 = right/bottom).
  - `offsetX` / `offsetY` — screen-pixel offset (the rotate handle floats above the top edge).
  - `kind`, `cursor`.
  - `anchorNx` / `anchorNy` — normalized position of the opposite (fixed) corner, for resizes.
- `const DEFAULT_CONTROLS` — the 8 resize handles (4 corners + 4 edge midpoints) plus a
  rotate handle.

## How it works

A handle's screen position is `bounds(nx, ny)` → world → screen, plus the pixel offset. Its
anchor (for resize) is `bounds(anchorNx, anchorNy)`. Edge handles share an axis with their
anchor, so only the perpendicular axis scales (the resize math detects the zero-length axis
automatically).

## Conventions & gotchas

- **Data, not behaviour.** `ControlDef` is pure description; the
  [`SelectionController`](./selection-controller.md) interprets it (lays out, hit-tests,
  drives the transform). This mirrors Fabric's data-driven `Control` design.
- **Cursors are fixed strings** for now; rotating them to match a rotated box is a later
  refinement.

## Relationships

- **Used by:** [`SelectionController`](./selection-controller.md).
