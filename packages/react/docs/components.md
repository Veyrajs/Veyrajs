# `src/components.ts` — The shape & container components

> Nine one-line component definitions. All behaviour is in the factory.

## Purpose

Declares the public components by calling [`createNodeComponent`](./node-component.md) once
per node type. There is no per-component logic here — only the node class and its extra prop
keys — which is the whole point of the factory.

## Exports

| Component | Node class | Kind | Extra props (beyond the common transform/style set) |
| --- | --- | --- | --- |
| `ACLayer` | `Layer` | container | — |
| `ACGroup` | `Group` | container | — |
| `ACRect` | `Rect` | shape | `width`, `height` |
| `ACCircle` | `Circle` | shape | `radius` |
| `ACEllipse` | `Ellipse` | shape | `radiusX`, `radiusY` |
| `ACLine` | `Line` | shape | `points`, `closed` |
| `ACPolygon` | `Polygon` | shape | `points` |
| `ACText` | `Text` | shape | `text`, `fontSize`, `fontFamily`, `textAlign`, `textBaseline` |
| `ACImage` | `Image` | shape | `image`, `width`, `height` |

`Image` is imported as `ImageNode` to avoid clashing with the DOM `Image` global.

## Common props (every component)

Transform: `id`, `name`, `x`, `y`, `scaleX`, `scaleY`, `rotation`, `skewX`, `skewY`,
`offsetX`, `offsetY`, `opacity`, `visible`, `listening`.
Shapes additionally get the style set: `fill`, `stroke`, `strokeWidth`, `lineDash`,
`lineCap`, `lineJoin`.

Every component also accepts the eleven `onX` event callbacks (`onPointerdown`, `onClick`,
`onDragmove`, …) and forwards a `ref` to its engine node.

## Conventions & gotchas

- **Adding a shape is one line** here, once the node type exists in core — the same low cost
  as the Vue adapter, and the reason annotation primitives will slot in as plugins later.
- **Containers vs shapes** differ only by the `isContainer` / `isShape` flags, which the
  factory uses to decide whether to render children and which prop set to mirror.

## Relationships

- **Uses:** the engine node classes; [node-component.ts](./node-component.md).
- **Used by:** apps; re-exported from `src/index.ts`.
