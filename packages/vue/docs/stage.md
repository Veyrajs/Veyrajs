# `src/stage.ts` — `<ACStage>`

> The root component: mounts the canvas, creates the engine, provides the context.

## Purpose

`<ACStage>` is the entry point. It renders a host `<div>`, creates a `Stage` once that
element exists, optionally wires selection + undo, and provides the reactive context its
descendants attach to.

## Props / emits / exposed

- **Props:** `width`, `height`, `background`, `pixelRatio`, `selectable`.
- **Emits:** `ready` (the `Stage`) once mounted.
- **Exposed (template ref):** `stage`, `selection`, `history` (refs).

## How it works

- Provides `{ stage, parent, selection, history }` (all `shallowRef`) **synchronously** in
  `setup`, so children can inject it immediately even though the values fill in later.
- In `onMounted` (when the host element exists) it creates the `Stage`, sets `stage` and
  `parent` (= the stage, since layers attach to it), and — if `selectable` — creates a
  `History` + `SelectionController` and publishes their `selection`/`history`.
- A `watch` on `width`/`height` calls `stage.setSize`.
- `onBeforeUnmount` destroys the controller and the stage.

## Conventions & gotchas

- **Children must be `<ACLayer>`** (the engine requires Layer children on the stage).
- **`selectable` is opt-in.** Without it, no selection UI is created; you can still build one
  imperatively from the exposed `stage`.
- The stage is only available **after mount** — read it via `@ready` or the exposed ref, not
  during the parent's `setup`.

## Relationships

- **Provides:** the [context](./context.md). **Owns:** the engine `Stage` (+ optional
  `SelectionController`/`History`).
