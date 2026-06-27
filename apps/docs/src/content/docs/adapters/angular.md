---
title: Angular
description: Declarative Veyrajs standalone components for Angular 18.
sidebar:
  order: 5
---

`@veyrajs/angular` wraps the imperative engine in **standalone** Angular components. Install it
alongside the core (see [Installation](/Veyrajs/guides/installation/)); `@angular/core ^18` and
`@angular/common ^18` are peer dependencies.

```sh
npm install @veyrajs/core @veyrajs/angular
```

## Quick start

Import the components you use directly — they're standalone, so there's no `NgModule`:

```ts
import { Component, signal } from '@angular/core'
import { ACStage, ACLayer, ACRect, ACCircle } from '@veyrajs/angular'

@Component({
  selector: 'app-scene',
  standalone: true,
  imports: [ACStage, ACLayer, ACRect, ACCircle],
  template: `
    <ac-stage [width]="800" [height]="480" background="#0b1220" selectable>
      <ac-layer>
        <ac-rect [x]="x()" [y]="40" [width]="150" [height]="90" fill="#38bdf8" (click)="x.set(x() + 20)" />
        <ac-circle [x]="300" [y]="100" [radius]="50" fill="#f472b6" />
      </ac-layer>
    </ac-stage>
  `,
})
export class SceneComponent {
  x = signal(40)
}
```

`selectable` wires a `SelectionController` + `History` (click-select, transform handles, undo/redo).

## Components & selectors

| Import | Selector | Wraps |
| --- | --- | --- |
| `ACStage` | `ac-stage` | `Stage` (root) |
| `ACLayer` / `ACGroup` | `ac-layer` / `ac-group` | containers |
| `ACRect`, `ACCircle`, `ACEllipse`, `ACLine`, `ACPolygon`, `ACText`, `ACImage` | `ac-rect`, … | shapes |

(Each class is also exported with its full name, e.g. `AcRectComponent`; `ACRect` is the alias.) See
the [Adapters Overview](/Veyrajs/adapters/overview/#the-components) for the full prop table.

## Inputs & outputs

Node properties are `@Input()`s; engine events are `@Output()` `EventEmitter`s. Drive inputs from
signals and update them from outputs when users edit:

```html
<ac-rect
  [x]="x()"
  [y]="40"
  [width]="150"
  [height]="90"
  fill="#38bdf8"
  (click)="onClick($event)"
  (dragmove)="x.set($event.target.x)"
  (pointerenter)="hover.set(true)"
/>
```

The outputs: `(pointerdown)`, `(pointermove)`, `(pointerup)`, `(pointerenter)`, `(pointerleave)`,
`(click)`, `(dblclick)`, `(wheel)`, `(dragstart)`, `(dragmove)`, `(dragend)` — each emits a
[`SceneEvent`](/Veyrajs/concepts/events/).

:::tip[No update loops]
The engine's **guarded setters** make the input → node → output → signal → input round-trip a no-op
when unchanged, so no echo-suppression is needed. Components use `OnPush` change detection since the
node is mutated imperatively.
:::

## `<ac-stage>` specifics

- **Inputs:** `width`, `height`, `background`, `pixelRatio`, `selectable`.
- **Output:** `(ready)` — emits the `Stage` once created.
- **Getters:** `stage` / `selection` / `history` — the imperative escape hatch.

```html
<ac-stage #stage [width]="800" [height]="480" selectable (ready)="onReady($event)">
  <ac-layer>…</ac-layer>
</ac-stage>
<button (click)="stage.history?.undo()">Undo</button>
```

A template reference (`#stage`) gives you the component instance, whose `stage` / `selection` /
`history` getters reach the engine.

## The escape hatch & custom nodes

- **`.node`** — every component exposes its underlying engine node as a public field.
- **`AcNodeBase` / `AcShapeBase`** — extend these base directives to wrap a custom engine node type
  as your own Angular component (declare its `@Input()`s, supply `createNode()` + `mirrorKeys`). See
  [Advanced → Custom Node Types](/Veyrajs/advanced/custom-node-types/).

## How the cascade works (no reactivity needed)

Unlike React/Vue/Svelte, Angular needs **no** reactive context. `ngOnInit` runs **top-down**, so a
parent's engine node already exists when a child initializes. Each component creates its node in
`ngOnInit` and attaches to the parent it reads from the injected `NODE_CONTEXT` token (resolved with
`@SkipSelf()` so a container finds its *ancestor*). This is standard hierarchical DI.

## Conventions & gotchas

- **Standalone only** — import components into your component's `imports`, not an `NgModule`.
- **`ACImage`** takes a loaded `image` source; the adapter doesn't load it for you.
- **TypeScript 5.5.x** is the supported range for the Angular 18 compiler in this package.

## Related

- [Adapters Overview](/Veyrajs/adapters/overview/) — the shared model and full prop table.
- [Events](/Veyrajs/concepts/events/) — the `SceneEvent` every output emits.
- [Commands & Undo/Redo](/Veyrajs/concepts/commands/) — what `selectable` enables.
