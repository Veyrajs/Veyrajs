---
title: Getting Started
description: Install Veyrajs and build your first scene — imperatively or with a framework adapter.
---

:::note
Veyrajs is currently developed inside a private monorepo and is not yet published to npm. The
snippets below show the intended public API; once published you will `pnpm add @veyrajs/core`.
:::

## The imperative engine

```ts
import { Stage, Layer, Rect, Circle, Vec2, History, SelectionController } from '@veyrajs/core'

const stage = new Stage({
  container: document.querySelector('#app')!,
  width: 800,
  height: 480,
  background: '#0b1220',
})

const layer = new Layer()
stage.add(layer)

const rect = new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8' })
layer.add(rect)
layer.add(new Circle({ x: 300, y: 100, radius: 50, fill: '#f472b6' }))

// Federated events:
rect.on('click', () => { rect.x += 20 })

// Zoom about a point:
stage.camera.zoomAt(new Vec2(300, 100), 1.2)

// Selection + transform handles + undo/redo:
const history = new History()
new SelectionController(stage, { history })
history.undo()
```

Mutating a node (`rect.x += 20`) marks the scene dirty and schedules a single coalesced redraw
on the next animation frame — you never call `render()` yourself.

## With a framework adapter

The same scene, declaratively. Props drive the node, events come back as callbacks, and a
`ref` / `bind:node` / public field hands you the underlying engine node when you need it.

```tsx
// React — @veyrajs/react
import { ACStage, ACLayer, ACRect, ACCircle } from '@veyrajs/react'

export function Scene() {
  return (
    <ACStage width={800} height={480} background="#0b1220" selectable>
      <ACLayer>
        <ACRect x={40} y={40} width={150} height={90} fill="#38bdf8" />
        <ACCircle x={300} y={100} radius={50} fill="#f472b6" />
      </ACLayer>
    </ACStage>
  )
}
```

`selectable` wires the `SelectionController` + `History` for you (click-select, transform
handles, undo/redo). See [Adapters](/Veyrajs/adapters/overview/) for Vue, Svelte, and Angular.

## Requirements

- **Node.js ≥ 20**
- **pnpm 10** (via Corepack: `corepack enable`)
