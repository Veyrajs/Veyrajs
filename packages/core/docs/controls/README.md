# `src/controls/` + `src/selection/` — Selection & controls

> Click/marquee to select; move, resize, and rotate via handles. The engine's most
> interactive subsystem.

| File | Doc | Concern |
| --- | --- | --- |
| `selection/selection-manager.ts` | [selection-manager.md](../selection/selection-manager.md) | Selection *state* + change events |
| `controls/selection-controller.ts` | [selection-controller.md](./selection-controller.md) | Interaction + overlay rendering |
| `controls/controls.ts` | [controls.md](./controls.md) | Declarative handle definitions |
| `controls/transform-math.ts` | [transform-math.md](./transform-math.md) | Pure resize/rotate geometry |

## How it fits together

- **`SelectionManager`** holds *which* nodes are selected and emits changes. Pure state.
- **`SelectionController`** turns pointer input into selection + transforms, and draws the
  box and handles. It owns a `SelectionManager` (or shares one).
- **`ControlDef` / `DEFAULT_CONTROLS`** describe the handles declaratively (normalized
  position, cursor, anchor).
- **`transform-math`** contains the gnarly geometry as **pure functions**, unit-tested
  independently of the interaction glue.

## Two key design decisions

### Controls render as a screen-space overlay

Handles must stay a constant size (≈9px) at any zoom — if they were world-space scene
nodes they would scale with the camera. So the controller implements the `Stage`'s
[`Overlay`](../scene/stage.md) interface (`drawOps()`), which the stage draws **after** the
scene with an identity transform (screen space, DPR only). Handle hit-testing is done
manually in screen coordinates. This also keeps control UI out of the scene graph entirely.

### Resize is anchored and rotation-aware

Dragging a corner keeps the **opposite** corner pinned in world space while the dragged
corner follows the cursor. The math reduces a rotated resize to a per-axis scale by working
in the node's parent space and rotating the drag vector back by −θ:

```
S'·D = R(−θ)·(pointer − anchor)      then re-anchor the position
```

Rotation keeps the **bounds center** fixed. Both live in [transform-math.md](./transform-math.md)
as pure functions.

## Scope (MVP)

- Select: click (replace), shift-click (toggle), drag empty space (marquee).
- Move: drag the selection (single or multiple).
- Resize / rotate: handles for a **single** selection (multi-selection shows a box + move).
- `boundBox` constraint hook; per-handle cursors.
- Transforms mutate nodes **directly** for now; Phase 8 wraps them in undoable commands.
