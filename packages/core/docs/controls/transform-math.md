# `src/controls/transform-math.ts` — Resize/rotate geometry

> The gnarly transform math, as pure functions. Unit-tested independently of interaction.

## Purpose

Computes the new node transform for resize and rotate drags. Pure (no DOM, no state), so the
geometry is verified directly — see the transform-math tests.

## Exports

- `computeResize(ctx, pointerWorld): { x, y, scaleX, scaleY }`.
- `computeRotation(ctx, pointerWorld): { x, y, rotation }`.
- `pointerAngle(node, centerParent, pointerWorld): number` — radians, for capturing the
  start angle of a rotate drag.
- The `ResizeContext` / `RotateContext` input types.

## How it works

### Resize (anchored, rotation-aware)

The dragged handle follows the pointer while the **anchor** (opposite corner) stays fixed in
world space. Working in the node's parent frame, rotate the drag vector back by −θ so a
rotated resize becomes a simple per-axis scale:

```
pParent = parentWorld⁻¹ · pointer
q       = R(−θ) · (pParent − anchorParent)     // = S'·D
scaleX  = q.x / Dx     scaleY = q.y / Dy       // D = handleLocal − anchorLocal
x, y    = anchorParent − R(θ)·S'·anchorLocal   // re-anchor the position
```

When an axis of `D` is zero (an edge handle), that axis's scale is left unchanged.

### Rotate (center-fixed)

The pointer's angle around the bounds **center** (in parent space) drives `rotation`, and the
position is recomputed so the center stays put:

```
rotation = startRotation + (angle(pointer) − startAngle)
x, y     = centerParent − R(rotation)·S·centerLocal
```

## Conventions & gotchas

- **Offset/skew assumed zero.** The math targets `localMatrix = T·R·S` (the common case for
  the transformer). Shapes with a pivot offset or skew aren't handled by these helpers yet.
- **Captured-at-start inputs.** `anchorParent` / `centerParent` / `startAngle` /
  `startRotation` are snapshotted when the drag begins; the controller does that and feeds
  them in on every move.
- **Negative scale = flip.** A drag past the anchor yields a negative scale (a mirror), which
  is intentional; clamp it via the controller's `boundBox` if undesired.

## Relationships

- **Uses:** [`Matrix`](../math/matrix.md), [`Node`](../scene/node.md).
- **Used by:** [`SelectionController`](./selection-controller.md).
