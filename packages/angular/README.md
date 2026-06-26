# @annotacanvas/angular

Angular adapter for [`@annotacanvas/core`](../core) — declarative standalone components over
the imperative engine, with an always-available escape hatch (the public `node` field) to the
underlying nodes.

## Usage

```ts
import { Component, signal } from '@angular/core'
import { ACStage, ACLayer, ACRect, ACCircle } from '@annotacanvas/angular'

@Component({
  selector: 'app-scene',
  standalone: true,
  imports: [ACStage, ACLayer, ACRect, ACCircle],
  template: `
    <ac-stage [width]="800" [height]="480" background="#0b1220" selectable>
      <ac-layer>
        <ac-rect [x]="x()" [y]="40" [width]="150" [height]="90" fill="#38bdf8"
                 (click)="x.set(x() + 20)" />
        <ac-circle [x]="300" [y]="100" [radius]="50" fill="#f472b6" />
      </ac-layer>
    </ac-stage>
  `,
})
export class SceneComponent {
  x = signal(40)
}
```

> The exported symbols are the component classes (`AcStageComponent`, …); they're also
> re-exported under the friendly aliases used above.

## Components

- `<ac-stage>` — the root; mounts the canvas and owns the engine. `selectable` wires
  selection + undo. Stage available via `(ready)="onReady($event)"` or the component's
  `stage` / `selection` / `history` getters.
- `<ac-layer>`, `<ac-group>` — containers.
- `<ac-rect>`, `<ac-circle>`, `<ac-ellipse>`, `<ac-line>`, `<ac-polygon>`, `<ac-text>`,
  `<ac-image>` — shapes.

Every component accepts the engine node's properties as `@Input()`s, re-emits engine events as
`@Output()`s (`(click)`, `(dragmove)`, `(pointerenter)`, …), and exposes its node via the public
`node` field. The base directives (`AcNodeBase`, `AcShapeBase`) are exported for custom nodes.

## How it works

It's a thin layer over the engine: input changes are mirrored onto the node in `ngOnChanges`
(the engine's guarded setters make this loop-safe), events are re-emitted, and the scene
assembles itself through Angular's hierarchical DI — `ngOnInit` runs top-down, so each node's
parent is ready when it initializes (no reactivity needed). The core stays fully
framework-agnostic; this package is the only Angular-aware code, a parallel sibling to the
[Vue](../vue), [React](../react), and [Svelte](../svelte) adapters.

See [docs/](./docs/README.md) for the per-module documentation.
