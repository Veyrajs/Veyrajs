---
title: Annotations
description: The @veyrajs/annotations package — six vector node types, the VertexEditor overlay, draw tools, LabelSchema styling, skeleton schemas, and serialization.
sidebar:
  order: 13
---

`@veyrajs/annotations` is the labeling toolkit built on the engine's public extension points — every
type is a [`Shape`](/Veyrajs/api/shapes/) subclass, so it lives entirely outside `@veyrajs/core` (the
[custom-node-types](/Veyrajs/advanced/custom-node-types/) path, applied in full). It ships six vector
node types, an editing overlay, pointer-driven draw tools, a label-class palette, and serialization
wiring. See the [interactive demos](/Veyrajs/examples/annotations/) for the imperative authoring flow,
and the [framework adapters](/Veyrajs/adapters/) for declarative `AC*` components.

```bash
npm install @veyrajs/annotations @veyrajs/core
```

## `AnnotationNode`

The abstract base every annotation extends. It adds a **label chip** and the shared visual-style
surface on top of `Shape` — the one place all label customization lives.

```ts
interface AnnotationConfig extends ShapeConfig {
  label?: string              // text shown in a chip above the annotation
  labelColor?: string | null  // chip color; defaults to the node's stroke, then a neutral blue
  showLabel?: boolean         // draw the chip at all. Default true
  labelFontSize?: number      // label size in local units. Default 12
}

abstract class AnnotationNode extends Shape {
  label: string
  labelColor: string | null
  showLabel: boolean
  labelFontSize: number
  protected labelOps(anchor: Vec2): DrawOp[]  // emit the chip at a local anchor (for subclasses)
}
```

Because `AnnotationConfig` extends [`ShapeConfig`](/Veyrajs/concepts/styling/), every node also takes
`fill`, `stroke`, `strokeWidth`, `lineDash`, and `opacity`. All are live setters — assign to restyle
and the stage re-renders.

## Node types

Each node is a `Shape`: it has a `type` string, exposes its editable geometry, and renders a label
chip. The vertex-based types (polygon, polyline, skeleton, cuboid) all expose a `points` accessor, so
a single [`VertexEditor`](#vertexeditor) edits any of them.

### `BoundingBox`

A rectangle — axis-aligned, or rotated via the node's `rotation`. Reuses the core
[`SelectionController`](/Veyrajs/api/selection-and-controls/) for move / resize / rotate.

```ts
interface BoundingBoxConfig extends AnnotationConfig {
  width?: number
  height?: number
  rotatable?: boolean   // show the rotate handle under a SelectionController. Default true
}
class BoundingBox extends AnnotationNode {
  width: number
  height: number
  rotatable: boolean
}
```

```ts
layer.add(new BoundingBox({ x: 60, y: 50, width: 180, height: 120, label: 'car', stroke: '#2563eb' }))
```

### `PolygonAnnotation` & `PolylineAnnotation`

A closed region and an open path. Same shape of API; the polyline simply does not close or fill.

```ts
interface PolygonAnnotationConfig extends AnnotationConfig { points?: Vec2[] }
interface PolylineAnnotationConfig extends AnnotationConfig { points?: Vec2[] }

class PolygonAnnotation extends AnnotationNode { points: readonly Vec2[] }   // assign to reshape
class PolylineAnnotation extends AnnotationNode { points: readonly Vec2[] }
```

### `PointAnnotation`

A single keypoint, drawn as a ring marker.

```ts
interface PointAnnotationConfig extends AnnotationConfig { radius?: number } // marker radius. Default 5
class PointAnnotation extends AnnotationNode { radius: number }
```

### `Skeleton`

Keypoints joined by bones. The layout is a [`SkeletonSchema`](#skeletonschema); `points` are the
keypoint positions in schema order.

```ts
interface SkeletonConfig extends AnnotationConfig {
  schema?: SkeletonSchema   // keypoint/bone layout. Defaults to empty; use a preset or your own
  points?: Vec2[]           // keypoint positions in schema order. Defaults to all-zero
  jointRadius?: number      // keypoint marker radius. Default 4
}
class Skeleton extends AnnotationNode {
  schema: SkeletonSchema
  points: readonly Vec2[]
  jointRadius: number
}
```

### `Cuboid`

A 3D box drawn as a front face plus a depth-offset back face, with the connecting edges.

```ts
interface CuboidConfig extends AnnotationConfig {
  points?: Vec2[]   // eight corners: front face (0–3) then matching back face (4–7)
}
class Cuboid extends AnnotationNode { points: readonly Vec2[] }
```

## `VertexEditor`

An [`Overlay`](/Veyrajs/api/selection-and-controls/) that puts a draggable handle on every vertex of
its target and edits the target's `points` as you drag — the counterpart to `SelectionController`, but
for point geometry. It listens on capture-phase pointer events and early-returns without a target, so
it composes with the draw tools (which listen on `click`).

```ts
interface VertexEditorOptions {
  handleSize?: number   // handle size in screen px. Default 9
  handleColor?: string  // handle outline. Default '#2563eb'
  fillColor?: string    // handle fill. Default '#ffffff'
  onChange?: (target: VertexTarget) => void  // after a vertex finishes moving — e.g. record undo
}
type VertexTarget = Node & { points: readonly Vec2[] }

class VertexEditor implements Overlay {
  constructor(stage: Stage, options?: VertexEditorOptions)
  setTarget(node: VertexTarget | null): void  // edit a node, or null to stop
  destroy(): void                             // unregister the overlay + pointer listeners
}
```

```ts
const editor = new VertexEditor(stage, { handleColor: '#16a34a' })
editor.setTarget(polygon) // handles appear on every vertex; drag to reshape
```

## Draw tools

Pointer-driven authoring. Every tool implements `Tool` (`enable()` / `disable()`) and takes
`DrawToolOptions` — a `defaults` style merged into each new node, and an `onCreate` callback fired
with the finished node (already added to the layer).

```ts
interface Tool { enable(): void; disable(): void }
interface DrawToolOptions {
  defaults?: AnnotationConfig          // style + label for every new annotation
  onCreate?: (node: Node) => void      // called with each finished annotation
}
```

| Tool | Gesture | Extra options / API |
| --- | --- | --- |
| `DrawBoxTool(stage, layer, opts?)` | drag a rectangle | `minSize?` (default `4`) |
| `DrawPolygonTool(stage, layer, opts?)` | click vertices; click the first to close | `closeDistance?` (default `12`); `finish()` |
| `DrawPolylineTool(stage, layer, opts?)` | click vertices; double-click to end | `finish()` |
| `PlacePointTool(stage, layer, opts?)` | click to drop a keypoint | — |
| `DrawSkeletonTool(stage, layer, schema, opts?)` | click each keypoint in order | `nextKeypoint`, `remaining` |
| `DrawCuboidTool(stage, layer, opts?)` | drag the front face | `minSize?` (default `8`) |

```ts
const tool = new DrawBoxTool(stage, layer, {
  defaults: { stroke: '#2563eb', label: 'car' },
  onCreate: (box) => console.log('drew', box),
})
tool.enable()
```

## `LabelSchema`

A configurable palette of annotation classes — your set of labels, each with a color. Tools use it to
style new annotations consistently. The schema itself is **not** serialized into nodes (each node
stores its own resolved label + color), so it stays pure app config.

```ts
interface LabelClass { id: string; name: string; color: string }
interface AnnotationStyle { stroke: string; fill: string | null; labelColor: string }

class LabelSchema {
  constructor(classes?: readonly LabelClass[])
  readonly classes: readonly LabelClass[]
  get(id: string): LabelClass | undefined
  styleFor(id: string): AnnotationStyle | undefined  // stroke/fill/labelColor for class `id`
}
```

```ts
const schema = new LabelSchema([
  { id: 'car', name: 'Car', color: '#2563eb' },
  { id: 'person', name: 'Person', color: '#16a34a' },
])
const style = schema.styleFor('car') // → { stroke: '#2563eb', fill: null, labelColor: '#2563eb' }
```

## Skeleton schemas

A `SkeletonSchema` names the keypoints (in placement order) and the bones connecting them. `COCO_17`
(17-keypoint person pose) and `FACE_5` ship as presets; pass any `{ keypoints, edges }` for your own
topology.

```ts
interface SkeletonSchema {
  keypoints: readonly string[]                      // names, in placement order
  edges: readonly (readonly [number, number])[]     // bones as index pairs into keypoints
}
import { COCO_17, FACE_5 } from '@veyrajs/annotations'
```

## Serialization

`registerAnnotations()` registers every node factory on a [`ClassRegistry`](/Veyrajs/api/serialization/)
so scenes containing annotations round-trip through `SceneSerializer`. Pass your own registry (e.g. one
that already has custom types) or omit it to start from the core defaults.

```ts
import { SceneSerializer } from '@veyrajs/core'
import { registerAnnotations } from '@veyrajs/annotations'

const serializer = new SceneSerializer({ registry: registerAnnotations() })
const json = serializer.stringify(stage)
serializer.parse(stage, json) // boxes, polygons, skeletons… all restored
```

To persist a **custom** annotation type, register its factory on the same registry:

```ts
const registry = registerAnnotations()
registry.register('StarAnnotation', (data) => new StarAnnotation(data))
```

## Customization at a glance

- **Visual** — per-node `stroke` / `fill` / `strokeWidth` / `lineDash` / `opacity` (from `ShapeConfig`)
  plus `label` / `labelColor` / `showLabel` / `labelFontSize`. Group them into reusable classes with
  [`LabelSchema`](#labelschema).
- **Controls** — configure [`VertexEditor`](#vertexeditor) handles, or reuse the core
  `SelectionController` for boxes. Each [draw tool](#draw-tools) takes a `defaults` style + `onCreate`.
- **Extensibility** — subclass [`AnnotationNode`](#annotationnode), describe geometry as draw ops,
  implement bounds + hit-testing, and `register` a factory. See
  [Custom Node Types](/Veyrajs/advanced/custom-node-types/) and the
  [custom-type demo](/Veyrajs/examples/annotations/).
