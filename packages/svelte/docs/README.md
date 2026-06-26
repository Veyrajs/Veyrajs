# `@veyrajs/svelte` — Adapter docs

Per-module documentation for the Svelte 5 adapter. Like the Vue and React adapters, this
package is intentionally thin: all engine behaviour lives in
[`@veyrajs/core`](../../core); this package only bridges it to Svelte 5's runes and
component model.

| Source | Doc | Concern |
| --- | --- | --- |
| `src/Stage.svelte` | [stage.md](./stage.md) | `<ACStage>` — root, owns the engine |
| `src/*.svelte` (9 wrappers) | [components.md](./components.md) | The shape/container components + `keys.ts`/`types.ts` |
| `src/Node.svelte` | [node.md](./node.md) | The generic node component (the core of the adapter) |
| `src/context.ts` | [context.md](./context.md) | The `getContext`/`setContext` plumbing |

## Design principles

- **Core stays framework-agnostic.** No Svelte import appears in `@veyrajs/core`; all
  Svelte-aware code is here. It is a parallel package to `@veyrajs/vue` and
  `@veyrajs/react` — the proof, three times over, that the adapter boundary holds.
- **Controlled by props.** Props drive the node; sync your `$state` from events (`ondragmove`,
  …) if you let the user move things. The engine's guarded setters make the
  prop→node→event→prop round-trip a no-op rather than a loop, so no echo-suppression machinery
  is needed.
- **Always an escape hatch.** Every component exposes its engine node via a bindable prop
  (`bind:node`), and `<ACStage>` exposes `bind:stage` / `bind:selection` / `bind:history`.

## The reactive cascade (why it works at all)

Svelte runs child setup before the parent's, but `<ACStage>` can only create the `Stage` in
`onMount` (it needs the host `<div>`). So `<ACStage>` puts its bindable `stage` (a reactive
prop) behind a context **getter**; each component reads `context.parent` inside an `$effect`,
which tracks that getter and re-runs the moment the stage is assigned. Containers provide
*their own* node as the next `parent`, so the tree assembles top-down. This is the same
mechanism as Vue's `watch(parent, …, {immediate})` and React's `useEffect(…, [context.parent])`.
See [node.md](./node.md).

## Why getters, not plain values, in the context

Svelte 5 reactivity does not cross function/module boundaries by *value* — returning a
`$state` from a function hands back a snapshot. The portable pattern is a **getter over the
reactive source**: `{ get parent() { return stage } }`. Reading `context.parent` in a child's
`$effect` then invokes the getter, which reads the reactive `stage`, which the effect tracks.
That is the one Svelte-specific subtlety the whole adapter rests on.

## Svelte ↔ Vue ↔ React mechanism map

| Concern | Vue | React | Svelte |
| --- | --- | --- | --- |
| Parent handoff | `provide`/`inject` | `NodeContext` + Provider | `setContext`/`getContext` |
| Attach when ready | `watch(parent, {immediate})` | `useEffect([parent])` | `$effect` reading `context.parent` |
| Mirror props | `watchEffect` | no-deps `useEffect` | `$effect` over `props[key]` |
| Create node once | eager in `setup` | lazy `useRef` | `untrack(() => new …)` |
| Expose node | `expose({ node })` | `forwardRef` + handle | `node = $bindable()` |
| Latest event callback | re-emit | `propsRef` | reactive `props` read in handler |
| Cleanup | `onUnmounted` | effect cleanup | `onMount` return |

## Building / testing

Built with **`svelte-package`** (a per-file transform, not a bundler) into `dist`, with
`@sveltejs/vite-plugin-svelte`'s `vitePreprocess` handling `<script lang="ts">`. Type-checked
with **`svelte-check`**. Tested with Vitest + `@testing-library/svelte` under happy-dom,
resolving the engine from source and using `flushSync()` to settle effects before asserting.
`.svelte` files are excluded from Biome (which lacks Svelte-rune awareness, like `.vue`).
