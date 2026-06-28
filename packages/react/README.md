# @veyrajs/react

[![npm version](https://img.shields.io/npm/v/@veyrajs/react.svg)](https://www.npmjs.com/package/@veyrajs/react)
[![license](https://img.shields.io/npm/l/@veyrajs/react.svg)](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE)

React adapter for [`@veyrajs/core`](https://www.npmjs.com/package/@veyrajs/core) — declarative
components and hooks over the imperative 2D canvas engine, with an always-available escape hatch
(`ref`) to the underlying nodes.

## Installation

```bash
npm install @veyrajs/react
```

`@veyrajs/core` is pulled in automatically. **React 18+** is required as a peer dependency.

## Usage

```tsx
import { ACStage, ACLayer, ACRect, ACCircle } from '@veyrajs/react'
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
ready. The core stays fully framework-agnostic; this package is the only React-aware code, and
a parallel sibling to the [Vue](https://www.npmjs.com/package/@veyrajs/vue),
[Svelte](https://www.npmjs.com/package/@veyrajs/svelte), and
[Angular](https://www.npmjs.com/package/@veyrajs/angular) adapters.

## Documentation

📖 Full docs, concepts, and live demos: <https://github.com/Veyrajs/Veyrajs>

## License

[MIT](https://github.com/Veyrajs/Veyrajs/blob/main/LICENSE) © Veyrajs
