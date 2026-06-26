# `src/context.ts` — Provide/inject context

> The reactive context `<ACStage>` provides and descendants inject.

## Exports

- `interface NodeContext` — `{ stage, parent, selection, history }`, all reactive refs.
- `NodeContextKey` — the Vue `InjectionKey`.
- `useNodeContext()` — inject the context (throws if used outside `<ACStage>`).

## How it works

`<ACStage>` provides a `NodeContext` synchronously in `setup`. The important field is
`parent: Ref<Container | null>` — the container that child components attach to. Each
container component re-provides the context with `parent` swapped to **its own** node, so a
shape injects its immediate layer/group. The refs are `shallowRef`s (engine objects, not
deep-reactive state).

## Conventions & gotchas

- **`parent` fills in over time.** It's `null` until the owning container is ready; the
  node-component factory `watch`es it and attaches when it becomes non-null (the cascade).
- **One context per container.** Re-providing with a new `parent` is how the tree wires
  itself without each component knowing the whole hierarchy.

## Relationships

- **Provided by:** [`<ACStage>`](./stage.md) and every container component.
- **Consumed by:** [node-component](./node-component.md) and the [composables](./composables.md).
