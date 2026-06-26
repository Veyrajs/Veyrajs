# @annotacanvas/vue

Vue 3 adapter for [`@annotacanvas/core`](../core) — declarative components and composables
over the imperative engine, with an always-available escape hatch to the underlying nodes.

## Usage

```vue
<script setup lang="ts">
import { ACStage, ACLayer, ACRect, ACCircle } from '@annotacanvas/vue'
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
framework-agnostic; this package is the only Vue-aware code.

See [docs/](./docs/README.md) for the per-module documentation.
