# @veyrajs/svelte

[![npm version](https://img.shields.io/npm/v/@veyrajs/svelte.svg)](https://www.npmjs.com/package/@veyrajs/svelte)
[![license](https://img.shields.io/npm/l/@veyrajs/svelte.svg)](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE)

Svelte 5 adapter for [`@veyrajs/core`](https://www.npmjs.com/package/@veyrajs/core) — declarative
components over the imperative 2D canvas engine, with an always-available escape hatch
(`bind:node`) to the underlying nodes.

## Installation

```bash
npm install @veyrajs/svelte
```

`@veyrajs/core` is pulled in automatically. **Svelte 5+** is required as a peer dependency.

## Usage

```svelte
<script lang="ts">
  import { ACStage, ACLayer, ACRect, ACCircle } from '@veyrajs/svelte'

  let x = $state(40)
</script>

<ACStage width={800} height={480} background="#0b1220" selectable>
  <ACLayer>
    <ACRect x={x} y={40} width={150} height={90} fill="#38bdf8" onclick={() => (x += 20)} />
    <ACCircle x={300} y={100} radius={50} fill="#f472b6" />
  </ACLayer>
</ACStage>
```

## Components

- `<ACStage>` — the root; mounts the canvas and owns the engine. `selectable` wires selection +
  undo. Stage available via `onready={(stage) => …}` or `bind:stage` (also `bind:selection` /
  `bind:history`).
- `<ACLayer>`, `<ACGroup>` — containers.
- `<ACRect>`, `<ACCircle>`, `<ACEllipse>`, `<ACLine>`, `<ACPolygon>`, `<ACText>`,
  `<ACImage>` — shapes.

Every component accepts the engine node's properties as props, re-emits engine events as
lowercase callbacks (`onclick`, `ondragmove`, `onpointerenter`, …), and exposes its node via
`bind:node`. `ACNode` is exported too, for wrapping custom node types.

## Engine access

Inside `<ACStage>`, call `getNodeContext()` at init to reach `{ stage, parent, selection,
history }`; read its fields inside `$derived`/`$effect` for reactivity.

## How it works

It's a thin layer over the engine: prop changes are mirrored onto the node (the engine's
guarded setters make this loop-safe), events are re-emitted as callbacks, and the scene is
assembled via a reactive cascade (a context getter over the stage's reactive state) so children
attach as soon as the stage is ready. The core stays fully framework-agnostic; this package is
the only Svelte-aware code, a parallel sibling to the
[Vue](https://www.npmjs.com/package/@veyrajs/vue),
[React](https://www.npmjs.com/package/@veyrajs/react), and
[Angular](https://www.npmjs.com/package/@veyrajs/angular) adapters.

## Documentation

📖 [**Svelte adapter guide**](https://veyrajs.github.io/Veyrajs/adapters/svelte/) · [Full docs & live demos](https://veyrajs.github.io/Veyrajs/) · [GitHub](https://github.com/Veyrajs/Veyrajs)

## License

[MIT](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE) © Veyrajs
