# `src/components.ts` — Shape & container components

> The concrete components, all built from [`defineNodeComponent`](./node-component.md).

## Exports

- **Containers:** `ACLayer`, `ACGroup`.
- **Shapes:** `ACRect`, `ACCircle`, `ACEllipse`, `ACLine`, `ACPolygon`, `ACText`, `ACImage`.

## How it works

Each is a one-line `defineNodeComponent({ name, NodeClass, isShape?/isContainer?, props })`
call. Every component automatically accepts:

- the **common node props** (`x`, `y`, `scaleX`, `scaleY`, `rotation`, `skew*`, `offset*`,
  `opacity`, `visible`, `listening`, `name`, `id`),
- the **paint props** for shapes (`fill`, `stroke`, `strokeWidth`, `lineDash`, `lineCap`,
  `lineJoin`),
- its **shape-specific props** (e.g. `width`/`height`, `radius`, `points`, `text`),

re-emits the engine events, and exposes its `node`.

## Conventions & gotchas

- **`ACImage`** wraps the engine's `Image` node (imported as `ImageNode` to avoid the global
  `Image` clash). Pass a loaded `:image` source; the adapter doesn't load it for you.
- **Custom node types** can be turned into components the same way via the exported
  `defineNodeComponent` — the path for annotation primitives.

## Relationships

- **Uses:** [`defineNodeComponent`](./node-component.md) + the engine node classes.
- **Mounted under:** [`<ACStage>`](./stage.md) → `<ACLayer>`/`<ACGroup>`.
