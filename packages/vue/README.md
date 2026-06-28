# @veyrajs/vue

[![npm version](https://img.shields.io/npm/v/@veyrajs/vue.svg)](https://www.npmjs.com/package/@veyrajs/vue)
[![license](https://img.shields.io/npm/l/@veyrajs/vue.svg)](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE)

Vue 3 adapter for [`@veyrajs/core`](https://www.npmjs.com/package/@veyrajs/core) — declarative
components and composables over the imperative 2D canvas engine, with an always-available escape
hatch to the underlying nodes.

## Installation

```bash
npm install @veyrajs/vue
```

`@veyrajs/core` is pulled in automatically. **Vue 3.4+** is required as a peer dependency.

## Usage

```vue
<script setup lang="ts">
import { ACStage, ACLayer, ACRect, ACCircle } from '@veyrajs/vue'
import { ref } from 'vue'

const x = ref(40)
</script>

<template>
  <ACStage :width="800" :height="480" background="#0b1220" selectable>
    <ACLayer>
      <ACRect :x="x" :y="40" :width="150" :height="90" fill="#38bdf8" @click="x += 20" />
      <ACCircle :x="300" :y="100" :radius="50" fill="#f472b6" />
    </ACLayer>
  </ACStage>
</template>
```

## Components

- `<ACStage>` — the root; mounts the canvas and owns the engine. `selectable` wires
  selection + undo. Stage available via `@ready="(stage) => …"` or a template ref
  (`.stage` / `.selection` / `.history`).
- `<ACLayer>`, `<ACGroup>` — containers.
- `<ACRect>`, `<ACCircle>`, `<ACEllipse>`, `<ACLine>`, `<ACPolygon>`, `<ACText>`,
  `<ACImage>` — shapes.

Every component accepts the engine node's properties as props, re-emits engine events
(`@click`, `@dragmove`, `@pointerenter`, …), and exposes its node via a template ref
(`thatRef.value.node`).

## Composables (inside `<ACStage>`)

`useStage()`, `useCamera()`, `useSelection()`, `useHistory()`.

## How it works

It's a thin layer over the engine: prop changes are mirrored onto the node (the engine's
guarded setters make this loop-safe), events are re-emitted, and the scene is assembled via
a reactive cascade so children attach as soon as the stage is ready. The core stays fully
framework-agnostic; this package is the only Vue-aware code, and a parallel sibling to the
[React](https://www.npmjs.com/package/@veyrajs/react),
[Svelte](https://www.npmjs.com/package/@veyrajs/svelte), and
[Angular](https://www.npmjs.com/package/@veyrajs/angular) adapters.

## Documentation

📖 [**Vue adapter guide**](https://veyrajs.github.io/Veyrajs/adapters/vue/) · [Full docs & live demos](https://veyrajs.github.io/Veyrajs/) · [GitHub](https://github.com/Veyrajs/Veyrajs)

## License

[MIT](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE) © Veyrajs
