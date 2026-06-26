# `src/node-component.ts` — The component factory

> Builds a declarative React component around an engine node. The heart of the adapter.

## Purpose

`createNodeComponent(config)` produces the shape/container components from a single, shared
implementation, so all nine components behave identically — only the node class and the extra
prop keys differ. It is the React counterpart of Vue's `defineNodeComponent`.

## Exports

- `interface NodeComponentConfig` — `{ name, NodeClass, props?, isShape?, isContainer? }`.
- `type NodeProps` — `Record<string, unknown> & { children?: ReactNode }` (a loose prop bag).
- `createNodeComponent(config)` — returns a `forwardRef` component.

## What each generated component does

Inside the `forwardRef` render function:

1. **Create** the node exactly once via a lazy `useRef` (`if (nodeRef.current === null) …`).
   This is React's idiom for "construct once, ignore later prop changes" — `useMemo(…, [])`
   would trip the exhaustive-deps lint, and re-creating on every render would orphan the node.
2. **Attach** to the parent with `useEffect(…, [context.parent, node])` — the reactive
   cascade. The effect adds the node once `context.parent` is non-null and returns a cleanup
   that calls `node.remove()`. A container also hands *itself* down as the next parent.
3. **Mirror** prop changes onto the node with a `useEffect` that has **no dependency array**,
   so it re-applies every defined prop on every render. The engine's guarded setters
   (`if (v !== this._x)`) make this loop-safe — re-writing an unchanged value is a no-op.
4. **Re-emit** the engine events (`pointerdown`/`click`/`dragmove`/…) as `onX` callback props.
   A `propsRef` (updated each render) lets the stable event handlers read the *latest*
   callbacks without re-subscribing — so the event `useEffect` depends only on `[node]`.
5. **Expose** the node via `useImperativeHandle(ref, () => node)` for `ref` access.
6. **Clean up** on unmount: the two effects' cleanups `node.off(...)` the handlers and
   `node.remove()` the node.

Leaf shapes render `null` (the canvas draws them); containers render a nested
`NodeContext.Provider` whose `parent` is this node, so child components mount under it.

## Conventions & gotchas

- **Props are the source of truth.** There's no write-back from node → props (props are
  one-way). Sync your state from events (`onDragmove`, …) if the user mutates nodes.
- **Event name mapping** is mechanical: `handlerName('click') === 'onClick'`. Engine event
  type → `on` + PascalCase. All eleven engine events are wired; you only pass the ones you
  need.
- **`useRef` for the node, not `useState`.** The node is a mutable engine object, not React
  state — storing it in state (or `useMemo`) would invite stale-closure and re-creation bugs.
- **The cast at construction** (`as never`) bridges the loose prop bag to the node's typed
  config — the one type-erasure point, mirroring the serializer's registry.
- **The mirror effect has no deps array on purpose.** That is what makes it run every render;
  Biome's `useExhaustiveDependencies` only checks effects that *have* an array, so this is
  lint-clean by design.

## Relationships

- **Uses:** the engine node classes + event types, React (`forwardRef`, `useContext`,
  `useEffect`, `useImperativeHandle`, `useRef`, `useMemo`, `createElement`).
- **Used by:** [components.ts](./components.md). Exported publicly so apps can wrap **custom**
  node types (e.g. annotation primitives) the same way.
