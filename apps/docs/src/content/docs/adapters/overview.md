---
title: Adapters Overview
description: Declarative Veyrajs components for Vue, React, Svelte, and Angular.
sidebar:
  order: 1
---

Veyrajs ships four framework adapters. All are thin, parallel siblings over the **same**
imperative engine — the core has **zero** framework code. Each runs the same six-step lifecycle
(create → attach → mirror props → re-emit events → expose node → clean up), differing only in the
reactivity primitive.

| Adapter | Package | Reactivity | Cascade | Build |
| --- | --- | --- | --- | --- |
| Vue 3 | `@veyrajs/vue` | `watch` / `watchEffect` | provide/inject | tsup |
| React | `@veyrajs/react` | `useEffect` / `useRef` | context provider | tsup |
| Svelte 5 | `@veyrajs/svelte` | runes (`$effect`, `$bindable`) | context getter over `$state` | svelte-package |
| Angular 18 | `@veyrajs/angular` | lifecycle hooks | hierarchical DI (`@SkipSelf`) | ng-packagr |

## Components

`<ACStage>` (root — owns the engine; `selectable` wires selection + undo), `<ACLayer>` /
`<ACGroup>` (containers), and `<ACRect>` / `<ACCircle>` / `<ACEllipse>` / `<ACLine>` /
`<ACPolygon>` / `<ACText>` / `<ACImage>` (shapes). Angular uses `ac-*` selectors.

Every component accepts the engine node's properties as props/inputs, re-emits engine events
(`click`, `dragmove`, `pointerenter`, …), and exposes the underlying node as an escape hatch.

## The same scene, four ways

```vue
<!-- Vue -->
<ACStage :width="800" :height="480" selectable>
  <ACLayer><ACRect :x="40" :y="40" :width="150" :height="90" fill="#38bdf8" /></ACLayer>
</ACStage>
```

```tsx
// React
<ACStage width={800} height={480} selectable>
  <ACLayer><ACRect x={40} y={40} width={150} height={90} fill="#38bdf8" /></ACLayer>
</ACStage>
```

```svelte
<!-- Svelte 5 -->
<ACStage width={800} height={480} selectable>
  <ACLayer><ACRect x={40} y={40} width={150} height={90} fill="#38bdf8" /></ACLayer>
</ACStage>
```

```html
<!-- Angular -->
<ac-stage [width]="800" [height]="480" selectable>
  <ac-layer><ac-rect [x]="40" [y]="40" [width]="150" [height]="90" fill="#38bdf8" /></ac-layer>
</ac-stage>
```

## Why a cascade?

`<ACStage>` can only create the engine `Stage` once its host element exists (on mount). Children
mount before their parent in most frameworks, so each adapter publishes the parent through a
reactive context and attaches each node the moment its parent becomes available. Angular is the
exception: its `ngOnInit` runs **top-down**, so the parent is already there — no reactivity
needed.

Each adapter's package keeps a per-file doc set under its own `docs/` folder.
