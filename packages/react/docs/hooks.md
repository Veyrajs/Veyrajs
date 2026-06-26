# `src/hooks.ts` — Engine-access hooks

> Read the engine from any component inside `<ACStage>`.

## Purpose

Thin hooks that read the [`NodeContext`](./context.md) so app components can reach engine
state without prop-drilling. The React counterpart of Vue's composables.

## Exports

- `useStage(): Stage | null` — the stage (null until `<ACStage>` has mounted).
- `useCamera(): Camera | null` — `stage.camera` (zoom/pan), or null before mount.
- `useSelection(): SelectionManager | null` — non-null only under `<ACStage selectable>`.
- `useHistory(): History | null` — the undo/redo stack, non-null only under `selectable`.

## Conventions & gotchas

- **Call inside `<ACStage>`.** They read context; outside the provider they return the
  all-null default.
- **They return `null` on the first render.** The stage is created in an effect, so a
  component that mounts in the same commit as `<ACStage>` sees `null` first, then the real
  value once the context state updates and re-renders. Guard with `if (!stage) return`.
- **Not reactive to engine-internal changes.** These return live engine objects; mutating a
  node does not re-render the React tree. Subscribe to engine events (or lift state) if you
  need the UI to track interactive changes — the same controlled-by-props contract as the
  components.

## Relationships

- **Uses:** [context.ts](./context.md) (`useNodeContext`); core types (`Stage`, `Camera`,
  `SelectionManager`, `History`).
- **Used by:** app components that need imperative access (toolbars, readouts, undo buttons).
