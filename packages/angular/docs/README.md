# `@annotacanvas/angular` — Adapter docs

Per-module documentation for the Angular adapter. Like the Vue, React, and Svelte adapters,
this package is intentionally thin: all engine behaviour lives in
[`@annotacanvas/core`](../../core); this package only bridges it to Angular's component model
and hierarchical DI.

| Source | Doc | Concern |
| --- | --- | --- |
| `src/stage.component.ts` | [stage.md](./stage.md) | `<ac-stage>` — root, owns the engine |
| `src/*.component.ts` (9) | [components.md](./components.md) | The shape/container components + `keys.ts` |
| `src/ac-node.base.ts`, `src/ac-shape.base.ts` | [node.md](./node.md) | The base directives (the core of the adapter) |
| `src/context.ts` | [context.md](./context.md) | The `NODE_CONTEXT` DI token |

## Design principles

- **Core stays framework-agnostic.** No Angular import appears in `@annotacanvas/core`; all
  Angular-aware code is here. It is the fourth parallel adapter (Vue, React, Svelte, Angular)
  — the boundary holds, four times over.
- **Controlled by inputs.** `@Input()`s drive the node; subscribe to the `@Output()` events
  (`(dragmove)`, …) and update your state if you let the user move things. The engine's guarded
  setters make the input→node→event round-trip a no-op rather than a loop.
- **Always an escape hatch.** Every component exposes its engine `node` (a public field), and
  `<ac-stage>` exposes `stage`/`selection`/`history` getters (and the `(ready)` output).

## The cascade is just Angular lifecycle

Unlike the other three adapters, **no reactivity is needed**. Angular calls `ngOnInit`
**top-down** (parent before child), so by the time a child component initializes, its parent's
engine node already exists. Each component creates its node in `ngOnInit` and attaches to the
parent it reads from the injected context. Containers provide *themselves* as the context for
their subtree via `useExisting`; the injected token uses `@SkipSelf()` so a container resolves
its *ancestor*, not itself (the standard hierarchical-DI pattern). See [node.md](./node.md).

## Angular ↔ the other adapters

| Concern | Vue / React / Svelte | Angular |
| --- | --- | --- |
| Parent handoff | reactive context | DI token + `useExisting` provider |
| Attach when ready | watch/effect on `parent` | `ngOnInit` (top-down ⇒ parent ready) |
| Mirror props | watch/effect re-apply | `ngOnChanges` re-apply |
| Create node once | once in setup | once in `ngOnInit` |
| Expose node | ref / bindable | public `node` field |
| Events | re-emit / callbacks | `@Output() EventEmitter` |
| Cleanup | unmount hook | `ngOnDestroy` |

## Building / testing

Built with **`ng-packagr`** (Ivy partial-compilation Angular Package Format → `dist`, with
`@annotacanvas/core` allow-listed as a non-peer dependency). Type-checked with `tsc`. Tested
with **Vitest** under happy-dom — no Angular build plugin: because the components use
`inject()` / explicit `@Inject` (no decorator-metadata reflection), esbuild's legacy-decorator
transform plus Angular's JIT compiler (loaded in the setup) are enough. The TestBed runs
**zoneless** (`provideExperimentalZonelessChangeDetection`), so no `zone.js/testing` /
ProxyZone is needed. TypeScript is pinned to 5.5.x in this package to satisfy the Angular 18
compiler's supported range.
