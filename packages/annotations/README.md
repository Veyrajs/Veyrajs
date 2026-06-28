# `@veyrajs/annotations`

Vector annotation primitives for [Veyrajs](https://veyrajs.github.io/Veyrajs/) — **bounding boxes,
polygons, polylines, keypoints, skeletons, and cuboids** — plus the drawing tools and the vertex
editor to author them.

Everything here is built on `@veyrajs/core`'s public extension points (custom `Shape` nodes, the
`ClassRegistry` serializer, the `Overlay` controls API), with **zero changes to core** — the proof
that annotation logic stays out of the engine.

```ts
import { Stage, SelectionController, History } from '@veyrajs/core'
import { BoundingBox, registerAnnotations } from '@veyrajs/annotations'

const stage = new Stage({ container, width: 800, height: 480 })
const layer = stage.createLayer()
layer.add(new BoundingBox({ x: 60, y: 50, width: 180, height: 120, label: 'car', stroke: '#2563eb' }))

// Move / resize / rotate boxes with the core controller (undoable):
new SelectionController(stage, { history: new History() })
```

## What's inside

- **Nodes:** `BoundingBox` (axis-aligned + rotated), `PolygonAnnotation`, `PolylineAnnotation`,
  `PointAnnotation`, `Skeleton`, `Cuboid` — each a `Shape` subclass with a label chip.
- **Controls:** `VertexEditor` (an `Overlay`) for editing the vertices of polygons, polylines,
  skeletons, and cuboids. Boxes reuse the core `SelectionController`.
- **Tools:** `DrawBoxTool`, `DrawPolygonTool`, `DrawPolylineTool`, `PlacePointTool`,
  `DrawSkeletonTool`, `DrawCuboidTool` — pointer-driven authoring.
- **Labels:** `LabelSchema` — a configurable class/color palette.
- **Serialization:** `registerAnnotations(registry?)` so annotated scenes round-trip.

## Customize

Every node takes the usual style config (`fill`, `stroke`, `strokeWidth`, `lineDash`, …) plus
`label` / `labelColor` / `showLabel`. Define your own classes with `LabelSchema`, configure the
tools and `VertexEditor`, swap skeleton schemas — or add an entirely new annotation type by
subclassing `AnnotationNode` and registering it. See the docs site for the full guide.
