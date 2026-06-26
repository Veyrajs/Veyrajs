# `src/Stage.svelte` — `<ACStage>`, the root component

> Owns the engine. Everything else mounts inside it.

## Purpose

`<ACStage>` renders a host `<div>`, creates the engine `Stage` once that element exists (in
`onMount`), and seeds the context its descendants attach to. It is the only component that
touches the DOM.

## Props

- `width`, `height` — canvas size in CSS pixels.
- `background` — clear colour, or `null` for transparent.
- `pixelRatio` — override devicePixelRatio.
- `selectable` — wires a `SelectionController` + `History` (click-select, marquee, transform
  handles, undo/redo).
- `stage`, `selection`, `history` — **bindable**; populated after mount. The escape hatch
  (`bind:stage`, …).
- `onready(stage)` — called once the stage is created.
- `children` — the scene.

## How it works

1. A host `<div>` is captured with `bind:this={host}`.
2. `setNodeContext` is called at init with **getters** over the bindable `stage`/`selection`/
   `history`. Because bindable props are reactive, these getters double as the cascade's
   reactive source.
3. `onMount` creates the `Stage` from `host`, optionally builds the controller + history, then
   assigns `stage = instance`. That assignment — to a reactive prop read through the context
   getter — is what re-runs every child's attach `$effect`. The returned teardown destroys the
   controller and stage.
4. An `$effect` keeps the canvas sized from `width`/`height`.

## Conventions & gotchas

- **The stage is created in `onMount`, not setup**, because it needs the real host element.
  So the context starts all-null and fills in on mount; `onready` and the bound props resolve
  after the first effect flush. In tests, call `flushSync()` after render before asserting.
- **`stage` is both the escape hatch and the reactive source.** One bindable prop serves both
  roles — assigning it in `onMount` both notifies a parent's `bind:stage` and ignites the
  cascade.
- **One DPR source of truth.** The stage owns devicePixelRatio; adapter code never does DPR
  math.

## Relationships

- **Uses:** `Stage`, `SelectionController`, `History`, `SelectionManager` from core; Svelte
  (`$props`, `$bindable`, `$effect`, `onMount`); [context.ts](./context.md).
- **Used by:** apps, as the root of any Veyrajs scene. Provides the context consumed by
  [Node.svelte](./node.md).
