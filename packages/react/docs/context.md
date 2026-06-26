# `src/context.ts` — The component context

> How a node finds its parent. The plumbing behind the cascade.

## Purpose

Defines the `NodeContext` (`React.createContext`) that carries the engine handles down the
component tree. It is the React equivalent of Vue's provide/inject pair.

## Exports

- `interface NodeContextValue` — `{ stage, parent, selection, history }`, all nullable.
- `NodeContext` — the context object, defaulting to all-null (the "outside `<ACStage>`" value).
- `useNodeContext()` — `useContext(NodeContext)` wrapper.

## The fields

- **`parent: Container | null`** — the container a child attaches to. `<ACStage>` seeds it
  with the stage; each container component overrides it with *itself* via a nested
  `Provider`, so the value a component reads is always its direct parent.
- **`stage`, `selection`, `history`** — engine handles surfaced to the [hooks](./hooks.md).
  They stay constant down the whole tree; only `parent` changes per level.

## Why a context (and why `parent` is the key)

React effects run child-before-parent, so a child cannot synchronously ask its parent for a
node. Instead the parent *publishes* its node through context state, and the child's attach
`useEffect` keys on `context.parent` — firing exactly when that value becomes non-null. The
nested `Provider` per container is what makes each level see the correct parent. This is the
mechanism that lets a declarative tree assemble onto an imperative engine. See
[node-component.md](./node-component.md) and [stage.md](./stage.md).

## Relationships

- **Uses:** core types (`Stage`, `Container`, `SelectionManager`, `History`); React
  (`createContext`, `useContext`).
- **Used by:** [stage.ts](./stage.md) (seeds it), [node-component.ts](./node-component.md)
  (reads `parent`, provides a nested value), [hooks.ts](./hooks.md) (reads the handles).
