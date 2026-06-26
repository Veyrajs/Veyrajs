# `@annotacanvas/react` — Adapter docs

Per-module documentation for the React adapter. Like the Vue adapter, this package is
intentionally thin: all engine behaviour lives in [`@annotacanvas/core`](../../core); this
package only bridges it to React's component model and hooks.

| Source | Doc | Concern |
| --- | --- | --- |
| `src/stage.ts` | [stage.md](./stage.md) | `<ACStage>` — root, owns the engine |
| `src/components.ts` | [components.md](./components.md) | The shape/container components |
| `src/node-component.ts` | [node-component.md](./node-component.md) | The component factory (the core of the adapter) |
| `src/hooks.ts` | [hooks.md](./hooks.md) | `useStage`/`useCamera`/`useSelection`/`useHistory` |
| `src/context.ts` | [context.md](./context.md) | The `React.createContext` plumbing |

## Design principles

- **Core stays framework-agnostic.** No React import appears in `@annotacanvas/core`; all
  React-aware code is here. It is a parallel package to `@annotacanvas/vue`, not a core
  change — the proof that the adapter boundary holds.
- **Controlled by props.** Props drive the node; sync your state from events (`onDragmove`,
  etc.) if you let the user move things. The engine's guarded setters make the
  prop→node→event→prop round-trip a no-op rather than a loop, so no echo-suppression
  machinery is needed (same as Vue).
- **Always an escape hatch.** Every component forwards a `ref` to its underlying engine
  `node`, and `<ACStage>` forwards `{ stage, selection, history }`, so power users can drop to
  the imperative API at any point — the react-konva/vue-konva lesson.

## The reactive cascade (why it works at all)

React runs child effects *before* the parent's, but `<ACStage>` can only create the `Stage`
in an effect (it needs the host `<div>`). So `<ACStage>` holds the context in **state** and
seeds it (`parent = stage`) once mounted; that state change re-renders the subtree, and each
node's attach `useEffect` (keyed on `context.parent`) fires the moment its parent becomes
non-null. Containers hand *their own* node down as the next `parent` via a nested
`NodeContext.Provider`, so the tree assembles top-down as the cascade propagates. This is the
direct analogue of Vue's `watch(context.parent, …, { immediate: true })`. See
[node-component.md](./node-component.md).

## React ↔ Vue mechanism map

| Concern | Vue adapter | React adapter |
| --- | --- | --- |
| Parent handoff | `provide`/`inject` a `Ref<Container>` | `NodeContext` + nested `Provider` |
| Attach when parent ready | `watch(parent, …, {immediate})` | `useEffect(…, [context.parent])` |
| Mirror props | `watchEffect` | `useEffect` with no deps array (every render) |
| Create node once | eager in `setup` | lazy `useRef` init (`if (ref.current === null)`) |
| Expose node | `expose({ node })` | `forwardRef` + `useImperativeHandle` |
| Re-emit events | `emit('dragmove', e)` | `props.onDragmove?.(e)` via a `propsRef` |
| Cleanup | `onUnmounted` | the `useEffect` cleanup return |

## Building / testing

Built with `tsup` (`react`, `react-dom`, `react/jsx-runtime`, and `@annotacanvas/core` are
external). Source uses `createElement` (no JSX) so the build needs no JSX runtime; the test
uses JSX via esbuild's automatic runtime. Tested with Vitest + `react-dom/client` + `act`
under happy-dom, resolving the engine from source (no build step needed).
