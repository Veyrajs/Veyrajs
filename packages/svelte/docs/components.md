# The shape & container components

> Nine thin wrappers over [`Node.svelte`](./node.md), plus the small `keys.ts`/`types.ts`
> helpers they share.

## Purpose

Each public component is a ~6-line `.svelte` file that hands its node class + prop keys to the
generic `Node`. There is no per-component logic — the same arrangement as the Vue/React
adapters' `components` file, except Svelte requires one file per component (a function factory
can't emit components).

## The components

| Component | File | Node class | Kind | Extra keys (beyond common/style) |
| --- | --- | --- | --- | --- |
| `ACLayer` | `Layer.svelte` | `Layer` | container | — |
| `ACGroup` | `Group.svelte` | `Group` | container | — |
| `ACRect` | `Rect.svelte` | `Rect` | shape | `width`, `height` |
| `ACCircle` | `Circle.svelte` | `Circle` | shape | `radius` |
| `ACEllipse` | `Ellipse.svelte` | `Ellipse` | shape | `radiusX`, `radiusY` |
| `ACLine` | `Line.svelte` | `Line` | shape | `points`, `closed` |
| `ACPolygon` | `Polygon.svelte` | `Polygon` | shape | `points` |
| `ACText` | `Text.svelte` | `Text` | shape | `text`, `fontSize`, `fontFamily`, `textAlign`, `textBaseline` |
| `ACImage` | `Image.svelte` | `Image` | shape | `image`, `width`, `height` |

`Image` is imported as `ImageNode` to avoid the DOM `Image` global.

## The shape of a wrapper

```svelte
<script lang="ts">
import { Rect } from '@annotacanvas/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={Rect} keys={[...SHAPE_KEYS, 'width', 'height']} {props} bind:node />
```

The rest (`...props`) collects every engine prop and `on*` callback and forwards it; `bind:node`
threads the engine node back out as the escape hatch. Containers additionally destructure
`children` and pass `isContainer`.

## `keys.ts` and `types.ts`

- **`keys.ts`** — `COMMON_KEYS` (transform/identity) and `SHAPE_KEYS` (common + style). Each
  wrapper appends its own geometry keys. These lists are what `Node`'s prop mirror iterates.
- **`types.ts`** — `ShapeProps` and `ContainerProps`: a loose `Record<string, unknown>` plus a
  bindable `node` (and, for containers, a `children` snippet). The loose bag is the
  type-erasure seam, the same trade-off the other adapters make.

## Conventions & gotchas

- **Adding a shape is one small file** here, once the node type exists in core — the same low
  cost as the Vue/React adapters, and the reason annotation primitives will slot in as plugins.
- **Containers vs shapes** differ only by `isContainer` and whether `children` is forwarded.

## Relationships

- **Uses:** the engine node classes; [Node.svelte](./node.md); `keys.ts`; `types.ts`.
- **Used by:** apps; re-exported from `src/index.ts`.
