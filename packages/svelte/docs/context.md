# `src/context.ts` — The component context

> How a node finds its parent. The plumbing behind the cascade.

## Purpose

Wraps Svelte's `getContext`/`setContext` for the engine handles carried down the component
tree. The Svelte equivalent of Vue's provide/inject and React's `NodeContext`.

## Exports

- `interface NodeContext` — `{ stage, parent, selection, history }`, all readonly + nullable.
- `setNodeContext(context)` — store it for descendants (call during init).
- `getNodeContext()` — read it (call during init); returns an all-null default outside a stage.

## The fields

- **`parent: Container | null`** — the container a child attaches to. `<ACStage>` provides the
  stage; each container provides *itself*, so a component always reads its direct parent.
- **`stage`, `selection`, `history`** — engine handles, constant down the tree.

## Why getters matter here

The interface fields are `readonly`, but the *provider* supplies them as **getters** over
reactive state (`{ get parent() { return stage } }`). That is deliberate: Svelte 5 reactivity
doesn't survive being returned by value across a module boundary, but a getter does — reading
`context.parent` inside a child's `$effect` invokes the getter, reads the reactive `stage`, and
so tracks it. Plain values would give each child a frozen `null` and the cascade would never
fire. This is the single most important Svelte-specific detail in the adapter. See
[node.md](./node.md) and [stage.md](./stage.md).

## Conventions & gotchas

- **Init-only.** `getContext`/`setContext` may only be called during component initialization
  (a Svelte rule), so these helpers must be called at the top of `<script>`, never in `onMount`
  or a handler.
- **Reactive reads need a reactive scope.** Reading `getNodeContext().stage` at init returns
  the current (possibly `null`) value; to react to it, read it inside `$derived`/`$effect`.

## Relationships

- **Uses:** core types (`Stage`, `Container`, `SelectionManager`, `History`); Svelte
  (`getContext`, `setContext`).
- **Used by:** [Stage.svelte](./stage.md) (provides), [Node.svelte](./node.md) (reads + extends),
  and apps that need engine access inside `<ACStage>`.
