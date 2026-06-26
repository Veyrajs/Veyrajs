# `src/node-component.ts` — The component factory

> Builds a declarative Vue component around an engine node. The heart of the adapter.

## Purpose

`defineNodeComponent(config)` produces the shape/container components from a single,
shared implementation, so all nine components behave identically — only the node class and
the extra prop keys differ.

## Exports

- `interface NodeComponentConfig` — `{ name, NodeClass, props?, isShape?, isContainer? }`.
- `defineNodeComponent(config)` — returns a Vue `Component`.

## What each generated component does

In `setup`:

1. **Create** the node eagerly from the initial props (`new NodeClass(config)`).
2. **Attach** to the parent via `watch(context.parent, …, { immediate: true })` — the
   reactive cascade. A container also **provides itself** as the parent ref for its children.
3. **Mirror** prop changes onto the node with a `watchEffect` that re-applies every defined
   prop. The engine's guarded setters (`if (v !== this._x)`) make this loop-safe.
4. **Re-emit** the engine events (`pointerdown`/`click`/`dragmove`/…) as Vue emits.
5. **Expose** the node (`expose({ node })`) for template-ref access.
6. **Clean up** on unmount: stop the watcher, `off` the event handlers, and `node.remove()`.

Leaf shapes render `null` (the canvas draws them); containers render their default slot so
child components mount.

## Conventions & gotchas

- **Props are the source of truth.** There's no write-back from node → props (props are
  one-way). Sync your state from events if the user mutates nodes interactively.
- **`shallowRef`, not `ref`, for nodes.** Wrapping a class instance in `ref()` deep-unwraps
  its type (and would deep-proxy it); the container parent ref uses `shallowRef`.
- **The cast at construction** (`as never`) bridges the loosely-typed prop bag to the node's
  config — the one type-erasure point, mirroring the serializer's registry.

## Relationships

- **Uses:** the engine node classes + event types, Vue (`defineComponent`, `watch`,
  `watchEffect`, `provide`, `shallowRef`).
- **Used by:** [components.ts](./components.md). Exported publicly so apps can wrap **custom**
  node types (e.g. annotation primitives) the same way.
