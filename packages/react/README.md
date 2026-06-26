# @annotacanvas/react

React adapter for [`@annotacanvas/core`](../core) — declarative components and hooks over the
imperative engine, with an always-available escape hatch (`ref`) to the underlying nodes.

## Usage

```tsx
import { ACStage, ACLayer, ACRect, ACCircle } from '@annotacanvas/react'
import { useState } from 'react'

export function Scene() {
  const [x, setX] = useState(40)
  return (
    <ACStage width={800} height={480} background="#0b1220" selectable>
      <ACLayer>
        <ACRect x={x} y={40} width={150} height={90} fill="#38bdf8" onClick={() => setX(x + 20)} />
        <ACCircle x={300} y={100} radius={50} fill="#f472b6" />
      </ACLayer>
    </ACStage>
  )
}
```

## Components

- `<ACStage>` — the root; mounts the canvas and owns the engine. `selectable` wires
  selection + undo. Stage available via `onReady={(stage) => …}` or a forwarded ref
  (`.stage` / `.selection` / `.history`).
- `<ACLayer>`, `<ACGroup>` — containers.
- `<ACRect>`, `<ACCircle>`, `<ACEllipse>`, `<ACLine>`, `<ACPolygon>`, `<ACText>`,
  `<ACImage>` — shapes.

Every component accepts the engine node's properties as props, re-emits engine events as
`onX` callbacks (`onClick`, `onDragmove`, `onPointerenter`, …), and forwards a `ref` to its
node.

## Hooks (inside `<ACStage>`)

`useStage()`, `useCamera()`, `useSelection()`, `useHistory()`.

## How it works

It's a thin layer over the engine: prop changes are mirrored onto the node (the engine's
guarded setters make this loop-safe), events are re-emitted as callbacks, and the scene is
assembled via a reactive cascade (context state) so children attach as soon as the stage is
ready. The core stays fully framework-agnostic; this package is the only React-aware code,
and a parallel sibling to [`@annotacanvas/vue`](../vue).

See [docs/](./docs/README.md) for the per-module documentation.
