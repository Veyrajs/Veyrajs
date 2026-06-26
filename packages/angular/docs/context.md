# `src/context.ts` — The DI context token

> How a node finds its parent. The plumbing behind the cascade.

## Purpose

Defines the `NODE_CONTEXT` injection token and the `NodeContext` interface carried down the
component tree via Angular's hierarchical injector. The Angular equivalent of the other
adapters' reactive context — but it needs no reactivity, because Angular's DI + lifecycle
ordering do the work.

## Exports

- `interface NodeContext` — `{ stage, container, selection, history }`, all readonly + nullable.
- `NODE_CONTEXT` — `InjectionToken<NodeContext>`.

## The fields

- **`container: Container | null`** — the container a child attaches to. `<ac-stage>` provides
  the stage; each container provides *itself*. A component reads its parent's `container` in
  `ngOnInit` to attach.
- **`stage`, `selection`, `history`** — engine handles, resolved up the chain (each level
  delegates to its parent), so any depth can reach them.

## How it's wired

- Providers: `<ac-stage>` and each container declare
  `providers: [{ provide: NODE_CONTEXT, useExisting: forwardRef(() => ThatComponent) }]`, making
  the component instance itself the context for its subtree.
- Consumers: the base directive injects `NODE_CONTEXT` with `{ skipSelf: true, optional: true }`
  — `skipSelf` so a container resolves its ancestor rather than itself; `optional` so the root
  is `null`-safe.

This is the standard Angular hierarchical-DI pattern (the same shape as nested reactive-forms
controls or CDK tree nodes). See [node.md](./node.md) and [stage.md](./stage.md).

## Why no reactivity is needed

`ngOnInit` runs top-down, so when a child reads `parentContext.container`, the parent's
`ngOnInit` has already created and stored the node. There is no "parent not ready yet" window
to bridge — which is exactly the window the Vue/React/Svelte adapters need a watch/effect for.

## Relationships

- **Uses:** core types (`Stage`, `Container`, `SelectionManager`, `History`); Angular
  (`InjectionToken`).
- **Used by:** [stage.component.ts](./stage.md) and the container components (provide it), and
  [ac-node.base.ts](./node.md) (injects it).
