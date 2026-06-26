# `src/index.ts` — Public API barrel

> The single entry point consumers import from: `@annotacanvas/core`.

## Purpose

Defines the **public surface** of the package. Anything re-exported here is part of the
supported API; anything not exported is internal and may change freely. `tsup` bundles
starting from this file, so it also determines what ends up in `dist`.

## Exports (grouped)

- **Version:** `VERSION`.
- **Math:** `Vec2`, `Matrix`, `Bounds`, the type `MatrixComponents`, and the geometry
  helpers `pointInPolygon`, `distanceToSegment`, `distanceToPolyline`.
- **Scene graph:** `Node`, `Container`, `Group`, `Layer`, `Shape`, `Stage`, `Camera`, and
  the concrete shapes (`Rect`, `Circle`, `Ellipse`, `Line`, `Polygon`, `Image`, `Text`),
  plus config types (`NodeConfig`, `ShapeConfig`, `StageOptions`, `CameraOptions`, and each
  shape's `*Config`).
- **Events:** `SceneEvent`, `dispatchEvent`, `EventManager`, and the types `SceneEventType`,
  `SceneEventPhase`, `SceneEventListener`.
- **Rendering:** `Canvas2DRenderer` (+ `Canvas2DRendererOptions`); the types `Renderer`,
  `Renderable`, `FrameInfo`; and the draw-op types `DrawOp`, `RectOp`, `EllipseOp`,
  `PolygonOp`, `ImageOp`, `TextOp`, `FillStrokeStyle`.
- **Support:** `FrameScheduler`, `nextId`.

## How it works

Pure re-exports. Type-only symbols are re-exported with `export type { … }` so the build
(which uses `verbatimModuleSyntax`) can erase them cleanly and tree-shaking stays precise.

## Conventions & gotchas

- **Exported = supported.** Treat the contents of this file as the API contract. Internal
  helpers (e.g. `resetIdCounter`) are intentionally *not* exported and are imported by
  tests via their direct module path.
- **Barrel discipline.** New public symbols must be added here to be reachable by
  consumers and included in the build output.

## Relationships

- **Re-exports from:** every public module under `src/`.
- **Consumed by:** the demo app, future adapters (`@annotacanvas/vue`), and `@annotacanvas/tools`.

## Future / not yet

- As Phase 3+ lands (concrete shapes, camera, events, hit-testing, serialization), their
  public symbols are added here.
