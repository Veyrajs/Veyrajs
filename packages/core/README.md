# @veyrajs/core

The Veyrajs engine. Framework-agnostic, zero runtime dependencies.

> **Status:** Phase 1 scaffold. Currently exports a minimal placeholder `Stage` that
> mounts a DPR-correct `<canvas>` and clears it. The real scene graph, renderer
> abstraction, camera, event system, hit-testing, controls, serialization, and command
> layer land in subsequent phases per the architecture plan.

```ts
import { Stage } from '@veyrajs/core'

const stage = new Stage({ container: document.getElementById('app')!, width: 800, height: 480 })
// ...
stage.destroy()
```
