# `src/stage.ts` — `<ACStage>`, the root component

> Owns the engine. Everything else mounts inside it.

## Purpose

`<ACStage>` mounts a host `<div>`, creates the engine `Stage` once that element exists, and
seeds the context that descendants attach to. It is the only component that talks to the DOM.

## Props (`ACStageProps`)

- `width`, `height` — canvas size in CSS pixels.
- `background` — clear colour, or `null` for transparent.
- `pixelRatio` — override devicePixelRatio (defaults to the device's).
- `selectable` — when set, wires a `SelectionController` + `History` (click-select, marquee,
  transform handles, undo/redo) onto the stage.
- `onReady(stage)` — called once the stage is created.
- `style` — inline style for the host `<div>`.
- `children` — the scene (layers, groups, shapes).

## Ref handle (`ACStageHandle`)

Forwarding a `ref` exposes `{ stage, selection, history }` for imperative use — the escape
hatch. `selection`/`history` are non-null only when `selectable` is set.

## How it works

1. A host `<div>` is rendered with a `useRef` (`hostRef`); the engine canvas mounts into it.
2. A **mount-once** `useEffect` (empty deps, with an explicit `biome-ignore` for
   `useExhaustiveDependencies`) creates the `Stage` from `hostRef.current`, optionally builds
   the `SelectionController` + `History`, then calls `setContext({ stage, parent: stage, … })`.
   Setting `parent: stage` is the spark that ignites the cascade — every child's attach effect
   is waiting on exactly this value. Cleanup destroys the controller and the stage.
3. A second `useEffect` keyed on `[width, height, stage]` keeps the canvas sized.
4. Render returns a `<div>` wrapping a `NodeContext.Provider value={context}` around
   `children`.

## Conventions & gotchas

- **The stage is created in an effect, not in render**, because it needs the real host
  element — which exists only after the first commit. This is why the context starts all-null
  and fills in on mount, and why `onReady`/the ref handle resolve asynchronously (after the
  first effect flush). In tests, wrap the initial render in `act(...)` so the effect runs.
- **`selectable` is all-or-nothing in MVP.** It wires the default controller; finer-grained
  control is available imperatively via the exposed `stage`/`selection`/`history`.
- **One DPR source of truth.** The stage owns devicePixelRatio; `pixelRatio` only overrides
  it. Adapter code never does DPR math.

## Relationships

- **Uses:** `Stage`, `SelectionController`, `History`, `SelectionManager` from core; React
  (`forwardRef`, `useEffect`, `useImperativeHandle`, `useRef`, `useState`, `createElement`);
  [context.ts](./context.md).
- **Used by:** apps, as the root of any Veyrajs scene. Provides the context consumed by
  [node-component.ts](./node-component.md) and the [hooks](./hooks.md).
