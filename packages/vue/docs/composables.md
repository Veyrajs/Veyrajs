# `src/composables.ts` — Composables

> Reactive access to the stage and its services from inside `<ACStage>`.

## Exports

- `useStage(): Ref<Stage | null>` — the stage (null until mounted).
- `useCamera(): ComputedRef<Camera | null>` — the camera, reactively.
- `useSelection(): Ref<SelectionManager | null>` — the selection (when `selectable`).
- `useHistory(): Ref<History | null>` — the undo/redo history (when `selectable`).

## How it works

Each reads the injected [context](./context.md) and returns the relevant ref. They throw a
clear error if used outside `<ACStage>`. Values are `null` until `<ACStage>` mounts, so guard
or `watch` them.

## Conventions & gotchas

- **Inside `<ACStage>` only.** They use `inject`, so they must run in a descendant's `setup`.
  Code *outside* the stage (e.g. a sibling toolbar) should instead read the stage from
  `@ready` or `<ACStage>`'s exposed ref.
- **`selection`/`history` require `selectable`** on `<ACStage>`; otherwise they stay `null`.

## Relationships

- **Uses:** [context](./context.md) and the engine's `Stage`/`Camera`/`SelectionManager`/`History` types.
