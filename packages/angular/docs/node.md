# `src/ac-node.base.ts` + `src/ac-shape.base.ts` — The base directives

> Where every node component gets its behaviour. The heart of the adapter.

## Purpose

`AcNodeBase` is an abstract `@Directive()` that declares the common inputs + event outputs and
drives the node lifecycle. `AcShapeBase` extends it with the style inputs every shape has.
Every concrete component is a thin subclass — the Angular counterpart of the
factory/generic-component used by the other adapters (Angular can't generate components from a
function, so the shared code lives in a base class and subclasses inherit the `@Input`s).

## `AcNodeBase`

Declares as `@Input()`: the 14 transform/identity props (`x`, `y`, `scaleX`, …, `listening`).
Declares as `@Output() EventEmitter<SceneEvent>`: the 11 engine events (`click`, `dragmove`, …).

Lifecycle:

1. **`ngOnInit` — create + attach.** `createNode()` (subclass-supplied) builds the engine node
   once; it is attached to `parentContext.container`. Because `ngOnInit` runs top-down, the
   parent's node already exists. Then one handler per engine event is wired to re-emit through
   the matching `@Output`.
2. **`ngOnChanges` — mirror.** Re-applies every `mirrorKey` onto the node. The engine's guarded
   setters make this loop-safe. (`ngOnChanges` also fires once *before* `ngOnInit`; the
   `if (!node) return` guard skips that early call — the node is built from the initial inputs
   in `ngOnInit` instead.)
3. **`ngOnDestroy` — remove.** `node.remove()`.

It also implements `NodeContext` (`stage`/`container`/`selection`/`history` getters) by
delegating to the injected parent — so a container can provide *itself* as the context and the
chain still resolves stage/selection/history from the root.

### The injected parent

```ts
protected readonly parentContext = inject<NodeContext>(NODE_CONTEXT, {
  skipSelf: true,
  optional: true,
})
```

`skipSelf` is essential: a container provides `NODE_CONTEXT` as *itself* for its children, so
without `skipSelf` it would inject itself. `skipSelf` makes it resolve its **ancestor**.
`optional` lets the stage (which has no parent provider above it) be `null`-safe.

## `AcShapeBase`

Adds `@Input() fill / stroke / strokeWidth / lineDash / lineCap / lineJoin`. Containers
(`Layer`, `Group`) extend `AcNodeBase` directly so they don't expose style inputs they ignore.

## Conventions & gotchas

- **`inject()`, not constructor DI.** Avoids relying on `emitDecoratorMetadata`, which lets the
  package work under `verbatimModuleSyntax` and lets Vitest run it with only esbuild's
  decorator transform (no Angular build plugin needed).
- **Inputs are one-way.** No node → input write-back; subscribe to the outputs to react to
  interactive changes.
- **`mirrorKeys` drives both** the initial `buildConfig()` and the `ngOnChanges` mirror, so the
  set of synced props is declared once per component.

## Relationships

- **Uses:** the engine node classes + event types; Angular (`@Directive`, `@Input`, `@Output`,
  `EventEmitter`, `inject`); [context.ts](./context.md).
- **Used by:** every component in [components.md](./components.md). Both bases are exported so
  apps can build **custom** node types (e.g. annotation primitives) the same way.
