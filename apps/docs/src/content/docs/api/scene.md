---
title: Scene Graph
description: Node, Container, Group, Layer, and Stage — the classes that hold transforms, hierarchy, and the frame loop.
sidebar:
  order: 3
---

The scene graph is a tree of `Node`s. `Container` adds children; `Group`, `Layer`, and `Stage` are the concrete containers, with `Stage` as the root and engine entry point.

## Node

`abstract class Node` — base of every scene-graph element. Owns the local transform, visual state, hierarchy linkage, and the lazy, version-counted world-matrix cache. It knows nothing about rendering (there is no `draw()`).

### NodeConfig

Optional constructor props (transform + visual + identity).

```ts
interface NodeConfig {
  x?: number; y?: number
  scaleX?: number; scaleY?: number
  rotation?: number
  skewX?: number; skewY?: number
  offsetX?: number; offsetY?: number
  opacity?: number
  visible?: boolean
  listening?: boolean
  id?: string
  name?: string
}
```

### Properties

Each is a real typed getter/setter (not a stringly-typed `attrs` bag); a transform setter only invalidates when the value actually changes.

```ts
// transform (get/set, all numbers)
x  y  scaleX  scaleY  rotation  skewX  skewY  offsetX  offsetY
// visual
opacity: number
visible: boolean
listening: boolean   // reserved for the event system; does not affect rendering
// identity / hierarchy
parent               // managed by the container — attach via add(), detach via remove()
id: string
name: string
type: string         // read-only discriminant
```

### Methods

```ts
position(x: number, y: number)   // set x and y together
move(dx: number, dy: number)     // translate by a delta
localMatrix(): Matrix            // cached local transform (Matrix.compose)
worldMatrix(): Matrix            // lazy, version-counted world transform
getLocalBounds(): Bounds         // abstract — bounds in local space
getWorldBounds(): Bounds         // bounds in world space
markDirty()                      // flag a visual/transform change; walks to the root
remove()                         // detach from parent
destroy()                        // tear down
toObject()                       // serialize to a plain object
```

### Events

```ts
on(type, handler, options?)    // register a listener; options: { capture }
once(type, handler, options?)  // one-shot listener
off(type, handler?)            // remove a listener (or all for the type)
hasListeners(type): boolean    // any listeners for the type/phase?
```

```ts
const group = new Group({ x: 100 })
const child = new TestRect({ x: 10 })
group.add(child)
child.worldMatrix().applyToPoint({ x: 0, y: 0 }) // { x: 110, y: 0 }
group.x = 200
child.worldMatrix().applyToPoint({ x: 0, y: 0 }) // { x: 210, y: 0 } (recomputed lazily)
```

The world matrix is cached against a version counter, so changing one node never eagerly walks its subtree — a descendant recomputes only when its own transform changes or an ancestor's world matrix actually moves. See [`Matrix` and `Bounds`](/Veyrajs/api/math/).

## Container

`abstract class Container extends Node` — branch node holding children, z-order, traversal, and a derived bounds union. Concrete containers: `Group`, `Layer`, `Stage`.

### Children

```ts
children                    // readonly view — mutate via the methods, not the array
childCount: number
add(...nodes)               // attach; re-parents and throws on cycles
removeChild(node)
removeChildren()
getChildIndex(node): number
```

### Z-order

Child array order **is** paint order (earlier = drawn first = visually behind).

```ts
moveToTop(node)
moveToBottom(node)
moveUp(node)      // swap with the next neighbor
moveDown(node)    // swap with the previous neighbor
```

### Traversal

All depth-first, in child order.

```ts
find(predicate)            // first matching descendant
traverse(visitor)          // visit each descendant
getDescendants()           // flat DFS list
isAncestorOf(node): boolean
getLocalBounds(): Bounds   // overrides Node — union of child bounds
```

```ts
const g = new Group()
g.add(a, b, c)
g.moveToTop(a)      // a now paints last (front)
g.traverse((n) => console.log(n.type))
g.getLocalBounds()  // tight box around a, b, c
```

## Group

`class Group extends Container` — `type = 'Group'`. The everyday grouping primitive: transform it and its children follow. Adds nothing beyond `Container` except a concrete type.

```ts
new Group(config?: NodeConfig)
```

```ts
const g = new Group({ x: 50, rotation: 15 })
g.add(rect, label)   // both move/rotate with the group
```

Use a `Group` for logical grouping anywhere in the tree; reach for a `Layer` only for top-level render partitions.

## Layer

`class Layer extends Container` — `type = 'Layer'`. A top-level partition directly under the `Stage`; the Stage's direct children must be Layers. Create via `stage.createLayer()`.

```ts
new Layer(config?: NodeConfig)
```

```ts
const layer = stage.createLayer()
layer.add(rect, group)
```

Today every layer renders to the stage's single canvas in order; the per-layer offscreen canvas is a later, opt-in caching optimization. Use layers sparingly — they are partitions, not the grouping mechanism.

## Stage

`class Stage extends Container` — root of the scene graph and engine entry point. Owns the [renderer](/Veyrajs/api/rendering/) (defaults to the Canvas2D renderer), the frame scheduler, the [camera](/Veyrajs/api/camera/), and the viewport. Turns "a property changed" into "one frame rendered."

### StageOptions

```ts
interface StageOptions {
  container: HTMLElement
  width?: number
  height?: number
  pixelRatio?: number
  background?: string
  renderer?: Renderer
  camera?: Camera
  hitTester?: HitTester
}
```

### Overlay

```ts
interface Overlay {
  drawOps(): DrawOp[]   // a screen-space overlay drawn after the scene
}
```

### Getters

```ts
get width(): number
get height(): number
get pixelRatio(): number
get canvas(): HTMLCanvasElement | undefined  // reflects the renderer's canvas (may be undefined when injected)
get camera(): Camera
```

### Coordinates

Delegate to the camera.

```ts
screenToWorld(point): Vec2
worldToScreen(point): Vec2
```

### Hit testing

Zoom-aware, options-driven. See [hit testing](/Veyrajs/api/hit-testing/).

```ts
hitTest(worldPoint, options?): HitResult | null
getIntersection(worldPoint, options?): Node | null  // convenience — just the node
```

### Tree & layers

```ts
add(...layers)               // Layer-only; throws TypeError on a non-Layer child
createLayer(config?): Layer  // make and attach a layer in one call
```

### Viewport & rendering

```ts
setSize(w: number, h: number)
setPixelRatio(dpr: number)
requestRender()              // coalesced (async) — the normal path
render()                     // synchronous; for explicit needs and tests
```

### Overlays & teardown

```ts
addOverlay(overlay: Overlay)
removeOverlay(overlay: Overlay)
destroy()                    // cancel scheduler → remove children → destroy renderer
```

```ts
import { Stage } from '@veyrajs/core'

const stage = new Stage({ container: el, width: 800, height: 480, background: '#0b1220' })
const layer = stage.createLayer()
layer.add(myShape)        // schedules a coalesced render automatically
// ...
stage.destroy()
```

You don't normally call `render()` — mutating properties schedules a coalesced frame. The camera is applied at render time as `screen = view · world`, so world coordinates stay camera-independent.

## Related

- [Scene-graph concepts](/Veyrajs/concepts/scene-graph/)
- [Camera API](/Veyrajs/api/camera/)
- [Shapes API](/Veyrajs/api/shapes/)
