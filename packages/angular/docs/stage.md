# `src/stage.component.ts` — `<ac-stage>`, the root component

> Owns the engine. Everything else mounts inside it.

## Purpose

`<ac-stage>` creates the engine `Stage` into its own host element on `ngOnInit` and provides
itself as the `NODE_CONTEXT` for the tree below. It is the only component that touches the DOM.

## Inputs / outputs

- `@Input() width`, `height` — canvas size in CSS pixels.
- `@Input() background` — clear colour, or `null` for transparent.
- `@Input() pixelRatio` — override devicePixelRatio.
- `@Input() selectable` — wires a `SelectionController` + `History` (click-select, marquee,
  transform handles, undo/redo).
- `@Output() ready` — emits the `Stage` once created.
- Getters `stage` / `selection` / `history` — the imperative escape hatch (and the context the
  subtree reads).

## How it works

1. The component injects its own `ElementRef`; the engine canvas mounts into that host element.
2. `ngOnInit` creates the `Stage` (using the host element as container), optionally builds the
   controller + history, stores them, and emits `ready`. Because `ngOnInit` runs before any
   child's, the stage is ready by the time layers initialize — that *is* the cascade.
3. `ngOnChanges` keeps the canvas sized when `width`/`height` change.
4. `ngOnDestroy` destroys the controller and the stage.

## Conventions & gotchas

- **The stage mounts into the component's own host element**, alongside the projected
  `<ng-content>` (the layer/shape elements, which render nothing visible). No extra wrapper div
  is needed.
- **`providers: [{ provide: NODE_CONTEXT, useExisting: forwardRef(() => AcStageComponent) }]`** —
  `useExisting` makes the component instance itself the context; `forwardRef` is required
  because the class is referenced inside its own decorator.
- **One DPR source of truth.** The stage owns devicePixelRatio; adapter code never does DPR math.

## Relationships

- **Uses:** `Stage`, `SelectionController`, `History`, `SelectionManager` from core; Angular
  (`@Component`, `ElementRef`, `EventEmitter`, `inject`, `forwardRef`); [context.ts](./context.md).
- **Used by:** apps, as the root of any AnnotaCanvas scene. Provides the context consumed by the
  base directive in [node.md](./node.md).
