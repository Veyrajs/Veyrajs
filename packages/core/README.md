# @veyrajs/core

[![npm version](https://img.shields.io/npm/v/@veyrajs/core.svg)](https://www.npmjs.com/package/@veyrajs/core)
[![license](https://img.shields.io/npm/l/@veyrajs/core.svg)](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE)
[![types](https://img.shields.io/npm/types/@veyrajs/core.svg)](https://www.npmjs.com/package/@veyrajs/core)

A **framework-agnostic, TypeScript-first 2D canvas engine** — a typed, mutable
retained-mode scene graph with a renderer abstraction, camera, federated events,
geometric hit-testing, transform controls, versioned serialization, and a day-one
command/undo layer.

Use it imperatively, or declaratively through the first-class
[**Vue**](https://www.npmjs.com/package/@veyrajs/vue),
[**React**](https://www.npmjs.com/package/@veyrajs/react),
[**Svelte**](https://www.npmjs.com/package/@veyrajs/svelte), and
[**Angular**](https://www.npmjs.com/package/@veyrajs/angular) adapters.

> **Zero runtime dependencies.** The math and geometry are written in-house.

---

## Installation

```bash
npm install @veyrajs/core
# or
pnpm add @veyrajs/core
# or
yarn add @veyrajs/core
```

## Quick start

Build a scene with shapes, events, zoom, selection, and undo — in a few lines:

```ts
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Vec2,
  History,
  SelectionController,
} from '@veyrajs/core'

// 1. Create a stage bound to a DOM element (DPR-correct canvas under the hood).
const stage = new Stage({
  container: document.querySelector('#app')!,
  width: 800,
  height: 480,
})

// 2. Add a layer, then shapes.
const layer = new Layer()
stage.add(layer)

const rect = new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8' })
layer.add(rect)
layer.add(new Circle({ x: 300, y: 100, radius: 50, fill: '#f472b6' }))

// 3. Mutate properties directly — the engine re-renders on the next frame.
rect.x = 60

// 4. Listen to federated (DOM-style) events.
rect.on('click', () => { rect.x += 20 })

// 5. Camera: zoom about a point, pan, screen ↔ world conversion.
stage.camera.zoomAt(new Vec2(300, 100), 1.2)

// 6. Selection + transform handles + undo/redo, day one.
const history = new History()
const controller = new SelectionController(stage, { history })
// ...user drags a resize handle...
history.undo()
history.redo()
```

## Save & load a scene

Scenes round-trip through versioned JSON, so a document saved today survives future
schema changes via registered migrations:

```ts
import { SceneSerializer } from '@veyrajs/core'

const serializer = new SceneSerializer()

const json = serializer.toObject(stage)   // → plain, versioned SceneDocument
localStorage.setItem('scene', JSON.stringify(json))

// later…
serializer.fromObject(stage, JSON.parse(localStorage.getItem('scene')!))
```

---

## Features

- **Typed mutable scene graph** — `Stage → Layer → Group/Shape → Node`. Real classes
  you mutate (`rect.x = 10`) with guarded setters, lazy **version-counted** world
  transforms, and typed config objects instead of a stringly-typed attribute bag.
- **Renderer abstraction** — nodes emit backend-neutral `DrawOp[]`; `Canvas2DRenderer`
  is the default backend, but no node ever touches a raw 2D context — a WebGL/WebGPU/
  Offscreen seam is reserved.
- **Camera & coordinate spaces** — explicit screen / world / local spaces via one affine
  `Matrix`. Zoom-about-cursor, pan, and a single `devicePixelRatio` source of truth.
- **Federated events** — DOM-style **capture → target → bubble** with `stopPropagation`,
  plus derived `click` / `dblclick` / `dragstart|move|end` / `pointerenter|leave` /
  `wheel`.
- **Geometric hit-testing** — reverse-z traversal with a world-AABB prefilter, per-shape
  `containsPoint`, and **zoom-invariant tolerance** (a "5px grab" stays 5px at any zoom).
- **Selection & controls** — `SelectionManager` (single + multi) and a data-driven
  `SelectionController`: bounds box, resize handles, rotation, custom cursors. Drags emit
  undoable commands.
- **Versioned serialization** — `toObject` / `fromObject` round-trips through a
  `ClassRegistry`, with a schema `version` and a `MigrationRunner`.
- **Command / undo from day one** — every meaningful mutation is a reversible,
  serializable `Command`; `History` gives undo/redo.

## Shapes

`Rect`, `Circle`, `Ellipse`, `Line`, `Polygon`, `Text`, `Image` — each is geometry
expressed as `DrawOp[]` plus a per-shape `containsPoint`. Add your own by extending
`Shape` and registering it with the `ClassRegistry`.

## API at a glance

| Subsystem | Key exports |
| --- | --- |
| **Math** | `Vec2`, `Matrix`, `Bounds`, `pointInPolygon`, `distanceToSegment` |
| **Scene graph** | `Stage`, `Layer`, `Group`, `Container`, `Shape`, `Node` |
| **Shapes** | `Rect`, `Circle`, `Ellipse`, `Line`, `Polygon`, `Text`, `Image` |
| **Rendering** | `Canvas2DRenderer`, `FrameScheduler`, `DrawOp` |
| **Camera** | `Camera` (`zoomAt`, `screenToWorld`, `worldToScreen`) |
| **Events** | `EventManager`, `SceneEvent`, `dispatchEvent` |
| **Hit testing** | `GeometricHitTester` (`HitTester` interface) |
| **Selection** | `SelectionManager`, `SelectionController`, `DEFAULT_CONTROLS` |
| **Serialization** | `SceneSerializer`, `ClassRegistry`, `MigrationRunner` |
| **Commands** | `History`, `SetPropsCommand`, `AddNodeCommand`, `RemoveNodeCommand`, `CompositeCommand` |

## Conventions

- Top-left origin, **y-down**, rotation in **degrees clockwise**.
- Scale target: one large image + hundreds of vector shapes at 60fps.
- Every mutation is a reversible, serializable command (undo/redo day 1).

---

## Using a framework?

Reach for a declarative adapter — same engine, idiomatic components, with an escape hatch
back to the underlying node whenever you need it:

| Framework | Package |
| --- | --- |
| Vue 3 | [`@veyrajs/vue`](https://www.npmjs.com/package/@veyrajs/vue) |
| React | [`@veyrajs/react`](https://www.npmjs.com/package/@veyrajs/react) |
| Svelte 5 | [`@veyrajs/svelte`](https://www.npmjs.com/package/@veyrajs/svelte) |
| Angular 18 | [`@veyrajs/angular`](https://www.npmjs.com/package/@veyrajs/angular) |

## Documentation

📖 **Full docs, concepts, and live demos:** <https://github.com/Veyrajs/Veyrajs>

The repository hosts an Astro + Starlight documentation site with guides, concept pages
(scene graph, camera, events, hit-testing, serialization…), and copy-paste recipes
(pan & zoom, free drawing, snapping guides, export to PNG, save/load, and more).

## Requirements

- Any modern browser with Canvas 2D.
- TypeScript types ship with the package — no `@types` needed.

## License

[MIT](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE) © Veyrajs
