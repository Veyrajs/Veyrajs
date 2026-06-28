# Veyrajs

A framework-agnostic, TypeScript-first **2D canvas engine** — a typed, mutable retained-mode
scene graph with a renderer abstraction, camera, federated events, geometric hit-testing,
data-driven transform controls, versioned serialization, and a day-one command/undo layer.
Use it imperatively, or declaratively through first-class **Vue, React, Svelte, and Angular**
adapters.

Veyrajs is built as a clean engine foundation first; it is designed to later host annotation
workflows (bounding boxes, polygons, keypoints, masks, …) as **optional plugins**, without
baking any annotation logic into the core.

> **Status:** core engine (MVP) complete, all four framework adapters shipped, micro + FPS
> benchmarks in place. **108 tests** green across the monorepo. Every package builds.

---

## Highlights

- **Typed mutable scene graph** — `Stage → Layer → Group/Shape → Node`. Real classes you
  mutate (`rect.x = 10`), with guarded setters, lazy **version-counted** world transforms, and
  typed config objects instead of a stringly-typed attribute bag.
- **Renderer abstraction** — nodes emit backend-neutral `DrawOp[]`; the `Canvas2DRenderer` is
  the MVP backend, but no node ever touches a raw 2D context, reserving a WebGL/WebGPU/Offscreen
  seam.
- **Camera & coordinate spaces** — explicit screen / world / local spaces, all via one affine
  `Matrix`. Zoom-about-cursor, pan, and one `devicePixelRatio` source of truth.
- **Federated events** — DOM-style **capture → target → bubble** with `stopPropagation`, plus
  derived `click` / `dblclick` / `dragstart|move|end` / `pointerenter|leave` / `wheel`.
- **Geometric hit-testing** — reverse-z traversal with a world-AABB prefilter, per-shape
  `containsPoint`, Paper-style options, and **zoom-invariant tolerance** (a "5px grab" stays
  5px at any zoom). The `HitTester` interface is a swap-in seam.
- **Selection & controls** — `SelectionManager` (single + multi) and a data-driven
  `SelectionController`: bounds box, resize handles, rotation, custom cursors — drags emit
  undoable commands.
- **Versioned serialization** — `toObject`/`fromObject` round-trips through a `ClassRegistry`,
  with a schema `version` and a `MigrationRunner` so scenes saved today survive future changes.
- **Command / undo from day one** — every meaningful mutation is a reversible, serializable
  `Command`; `History` gives undo/redo, and the op-log is the seam for future collaboration.
- **Four framework adapters, zero core changes** — Vue, React, Svelte, and Angular each wrap
  the imperative engine declaratively, and always expose the underlying node as an escape hatch.
- **Zero runtime dependencies in core** — the math and geometry are written in-house.

---

## Packages

| Package | Status | Build | Description |
| --- | --- | --- | --- |
| [`@veyrajs/core`](./packages/core) | ✅ MVP | tsup | The engine. Zero runtime deps. The product. |
| [`@veyrajs/vue`](./packages/vue) | ✅ | tsup | Vue 3 adapter — components + composables. |
| [`@veyrajs/react`](./packages/react) | ✅ | tsup | React adapter — components + hooks. |
| [`@veyrajs/svelte`](./packages/svelte) | ✅ | svelte-package | Svelte 5 adapter — rune-powered components. |
| [`@veyrajs/angular`](./packages/angular) | ✅ | ng-packagr | Angular 18 adapter — standalone components. |
| [`@veyrajs/tools`](./packages/tools) | placeholder | tsup | Reusable interaction tools (pan/select/transform/marquee). |
| [`@veyrajs/annotations`](./packages/annotations) | ✅ | tsup | Vector annotations — boxes, polygons, polylines, keypoints, skeletons, cuboids — plus draw tools, a vertex editor, and label schemas. The boundary proof, realized. |
| `@veyrajs/demo` (`apps/`) | ✅ | Vite | Imperative demo: shapes, zoom/pan, selection, export/import, undo/redo. Private. |
| `@veyrajs/benchmarks` (`apps/`) | ✅ | Vite | tinybench micro-benchmarks + a manual canvas FPS harness. Private. |
| `@veyrajs/docs` (`apps/`) | ✅ | Astro | Docs & demo site (Astro + Starlight) with live interactive demos. Private. |

Each package keeps a per-file English doc set under its own `docs/` folder (mirroring `src/`),
so every source file has a companion explainer.

---

## Quick start

```bash
corepack enable          # provides pnpm 10
pnpm install
pnpm dev                 # run the demo app (Vite)

pnpm build               # build every package (tsup / svelte-package / ng-packagr)
pnpm test                # run all unit tests (Vitest)
pnpm typecheck           # typecheck every package
pnpm check               # Biome lint + format
```

---

## Usage

### Imperative (the engine directly)

```ts
import { Stage, Layer, Rect, Circle, Vec2, History, SelectionController } from '@veyrajs/core'

const stage = new Stage({ container: document.querySelector('#app')!, width: 800, height: 480 })
const layer = new Layer()
stage.add(layer)

const rect = new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8' })
layer.add(rect)
layer.add(new Circle({ x: 300, y: 100, radius: 50, fill: '#f472b6' }))

rect.on('click', () => { rect.x += 20 })           // federated events
stage.camera.zoomAt(new Vec2(300, 100), 1.2)        // zoom about a point

// Selection + transform handles + undo/redo:
const history = new History()
const controller = new SelectionController(stage, { history })
history.undo()
```

### Declarative (framework adapters)

The same scene in each framework — props drive the node, events come back as callbacks, and a
`ref` / `bind:node` / public field hands you the underlying engine node when you need it.

```tsx
// React
import { ACStage, ACLayer, ACRect, ACCircle } from '@veyrajs/react'

<ACStage width={800} height={480} selectable>
  <ACLayer>
    <ACRect x={40} y={40} width={150} height={90} fill="#38bdf8" onClick={…} />
    <ACCircle x={300} y={100} radius={50} fill="#f472b6" />
  </ACLayer>
</ACStage>
```

```svelte
<!-- Svelte 5 -->
<script>import { ACStage, ACLayer, ACRect } from '@veyrajs/svelte'</script>
<ACStage width={800} height={480} selectable>
  <ACLayer><ACRect x={40} y={40} width={150} height={90} fill="#38bdf8" /></ACLayer>
</ACStage>
```

```html
<!-- Angular -->
<ac-stage [width]="800" [height]="480" selectable>
  <ac-layer><ac-rect [x]="40" [y]="40" [width]="150" [height]="90" fill="#38bdf8" /></ac-layer>
</ac-stage>
```

Vue mirrors the same shape with `<ACStage :width="800">`. See each adapter's README for details.

---

## Architecture

The engine is a deliberately un-clever Canvas-2D retained-mode scene graph, with four pieces of
disciplined future-proofing that are cheap now and expensive later: a **renderer seam**, a
**hit-tester seam**, a **day-1 command/serialization layer**, and a **hard boundary** that
keeps every annotation concept out of core.

| Subsystem | Key types | What it does |
| --- | --- | --- |
| **Math** | `Vec2`, `Matrix`, `Bounds` | 2×3 affine transforms, points, AABBs; the single transform primitive. |
| **Scene graph** | `Stage`, `Layer`, `Group`, `Shape`, `Node` | Containment, z-order, lazy version-counted world transforms & bounds. |
| **Shapes** | `Rect`, `Circle`, `Ellipse`, `Line`, `Polygon`, `Text`, `Image` | Geometry-as-`DrawOp[]` + per-shape `containsPoint`. |
| **Rendering** | `Renderer`, `Canvas2DRenderer`, `DrawOp`, `FrameScheduler` | Backend-neutral draw ops; one coalesced rAF redraw per frame. |
| **Camera** | `Camera` | Zoom/pan, view matrix + inverse, `screenToWorld`/`worldToScreen`, DPR. |
| **Events** | `EventManager`, `SceneEvent`, `dispatchEvent` | Pointer normalization, capture/target/bubble, derived gestures. |
| **Hit testing** | `HitTester`, `GeometricHitTester` | AABB prefilter + `containsPoint`, Paper-style options, zoom-aware tolerance. |
| **Selection & controls** | `SelectionManager`, `SelectionController`, `DEFAULT_CONTROLS`, `computeResize`/`computeRotation` | Multi-select, transform handles, rotation-aware resize math. |
| **Serialization** | `SceneSerializer`, `ClassRegistry`, `MigrationRunner` | Versioned JSON, type→factory registry, stepwise migrations. |
| **Commands & history** | `History`, `SetPropsCommand`, `AddNodeCommand`, `RemoveNodeCommand`, `CompositeCommand` | Reversible, serializable mutations; undo/redo; transactions. |

**Extension seams** (the plugin boundary): the `Renderer` interface (new backends), the
`HitTester` interface (quadtree/pixel-perfect), the `ClassRegistry` (custom serializable node
types), and `ControlDef` (custom handles). `@veyrajs/annotations` is built entirely
against these — every annotation primitive (bounding box, polygon, keypoint, skeleton, cuboid) is a
custom node added with **zero changes to `@veyrajs/core`**.

---

## Framework adapters

All four are thin, parallel siblings over the same imperative engine. Each runs the same
six-step lifecycle — create → attach → mirror props → re-emit events → expose node → clean up —
differing only in the reactivity primitive:

| Adapter | Reactivity primitive | Cascade mechanism | Test stack |
| --- | --- | --- | --- |
| Vue 3 | `watch` / `watchEffect`, `shallowRef` | provide/inject reactive context | Vitest + `@vue/test-utils` |
| React | `useEffect` / `useRef` | `NodeContext` + provider | Vitest + `react-dom/client` + `act` |
| Svelte 5 | runes (`$effect`, `$bindable`, `untrack`) | context getter over `$state` | Vitest + `@testing-library/svelte` |
| Angular 18 | lifecycle hooks (`ngOnInit`/`ngOnChanges`) | hierarchical DI (`@SkipSelf`) | Vitest (zoneless JIT TestBed) |

Components: `<ACStage>` (root, owns the engine, optional `selectable` wires selection + undo),
`<ACLayer>` / `<ACGroup>` (containers), and `<ACRect>` / `<ACCircle>` / `<ACEllipse>` /
`<ACLine>` / `<ACPolygon>` / `<ACText>` / `<ACImage>` (shapes). Angular uses `ac-*` selectors.

---

## Monorepo layout

```
veyrajs/
├─ packages/
│  ├─ core/         @veyrajs/core         # the engine (zero deps)
│  ├─ vue/          @veyrajs/vue          # Vue 3 adapter
│  ├─ react/        @veyrajs/react        # React adapter
│  ├─ svelte/       @veyrajs/svelte       # Svelte 5 adapter
│  ├─ angular/      @veyrajs/angular      # Angular 18 adapter
│  ├─ tools/        @veyrajs/tools        # interaction tools (placeholder)
│  └─ annotations/  @veyrajs/annotations  # vector annotations (boxes, polygons, skeletons, …)
└─ apps/
   ├─ demo/         @veyrajs/demo         # Vite + Vue imperative demo
   ├─ benchmarks/   @veyrajs/benchmarks   # tinybench + FPS harness
   └─ docs/         @veyrajs/docs         # Astro + Starlight docs & demo site
```

Adapters and apps resolve `@veyrajs/core` straight from source (Vite alias + tsconfig `paths`),
so tests and typechecks need no build of core.

---

## Conventions (locked in Phase 0)

- **Core model:** mutable OOP scene graph (`Stage → Layer → Group/Node → Shape`).
- **MVP renderer:** Canvas 2D behind a `Renderer` interface (WebGL/WebGPU reserved).
- **Coordinates:** top-left origin, **y-down**, rotation in **degrees clockwise**.
- **Scale target:** one large image + hundreds of vector shapes at 60fps.
- **History:** every mutation is a reversible, serializable command (undo/redo day 1).
- **Tooling:** pnpm workspaces + catalogs, **Biome** lint/format, **Vitest** tests,
  **Changesets** releases. Builds: tsup (core + JS adapters), svelte-package, ng-packagr.

---

## Development

```bash
pnpm -r build        # build every package in dependency order
pnpm -r test         # run every package's tests
pnpm -r typecheck    # typecheck every package
pnpm biome check .   # lint + format the whole repo
```

Each package also exposes its own `build` / `test` / `typecheck` scripts; run a single one with
`pnpm --filter @veyrajs/<pkg> <script>`.

---

## Requirements

- **Node.js >= 20** (developed on 22)
- **pnpm 10** (via Corepack: `corepack enable`)
- The Angular package pins **TypeScript 5.5.x** locally (Angular 18's supported range); the rest
  of the monorepo tracks a newer TypeScript.

## License

`UNLICENSED` / private while the engine is dogfooded internally. A permissive OSS license will
be chosen at first public publish, when the public API is frozen.
