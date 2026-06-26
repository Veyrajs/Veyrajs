# `@annotacanvas/vue` — Adapter docs

Per-module documentation for the Vue 3 adapter. The adapter is intentionally thin: all
engine behaviour lives in [`@annotacanvas/core`](../../core); this package only bridges it
to Vue's reactivity and component model.

| Source | Doc | Concern |
| --- | --- | --- |
| `src/stage.ts` | [stage.md](./stage.md) | `<ACStage>` — root, owns the engine |
| `src/components.ts` | [components.md](./components.md) | The shape/container components |
| `src/node-component.ts` | [node-component.md](./node-component.md) | The component factory (the core of the adapter) |
| `src/composables.ts` | [composables.md](./composables.md) | `useStage`/`useCamera`/`useSelection`/`useHistory` |
| `src/context.ts` | [context.md](./context.md) | The provide/inject context |

## Design principles

- **Core stays framework-agnostic.** No Vue import appears in `@annotacanvas/core`; all
  Vue-aware code is here. A React adapter is a parallel package, not a core change.
- **Controlled by props.** Props drive the node; sync your reactive state from events
  (`@dragmove`, etc.) if you let the user move things. The engine's guarded setters make the
  prop→node→event→prop round-trip a no-op rather than a loop, so no echo-suppression
  machinery is needed.
- **Always an escape hatch.** Every component exposes its underlying engine `node` (and
  `<ACStage>` exposes `stage`/`selection`/`history`) via template refs, so power users can
  drop to the imperative API at any point — the react-konva/vue-konva lesson.

## The reactive cascade (why it works at all)

Child `onMounted` runs *before* the parent's, but `<ACStage>` can only create the `Stage`
in `onMounted` (it needs the host element). So `<ACStage>` provides a `Ref<Container|null>`;
each component creates its node eagerly in `setup` and `watch`es that ref, attaching only
once it is non-null. Containers provide *their own* node as the parent ref synchronously, so
the subtree assembles itself and snaps onto the stage the moment the root ref is set. See
[node-component.md](./node-component.md).

## Building / testing

Built with `tsup` (`vue` and `@annotacanvas/core` are external). Tested with Vitest +
`@vue/test-utils` under happy-dom, resolving the engine from source (no build step needed).
