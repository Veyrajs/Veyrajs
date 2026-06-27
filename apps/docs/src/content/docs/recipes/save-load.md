---
title: Save & Load a Scene
description: Persist a Stage to localStorage with SceneSerializer and restore it — clearing selection, clearing history, and re-acquiring the layer after a load.
sidebar:
  order: 7
---

`SceneSerializer.stringify` turns a [`Stage`](/Veyrajs/api/scene/)'s layers into a JSON string you can
drop into `localStorage`; `parse` rebuilds them. Because `parse` **replaces** the stage's content, the
old node instances are gone afterwards — so you must clear any selection, clear the
[history](/Veyrajs/api/commands/), and re-acquire the layer from `stage.children[0]`.

```ts
import { Stage, SceneSerializer, History, SelectionController, Rect, type Layer } from '@veyrajs/core'

const container = document.querySelector('#app') as HTMLElement
const stage = new Stage({ container, width: 800, height: 480, background: '#0b1220' })
let layer = stage.createLayer()
const history = new History()
const controller = new SelectionController(stage, { history })

layer.add(new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8' }))

const serializer = new SceneSerializer()
const KEY = 'veyrajs:scene'

// Save: serialize the stage's layers to a JSON string.
function save() {
  localStorage.setItem(KEY, serializer.stringify(stage))
}

// Load: parse() REPLACES the stage's content — old node instances are gone.
function load() {
  const json = localStorage.getItem(KEY)
  if (!json) return

  serializer.parse(stage, json)

  controller.selection.clear()        // 1. selection pointed at dead nodes
  history.clear()                     // 2. undo stack pointed at dead nodes
  layer = stage.children[0] as Layer  // 3. re-acquire the fresh Layer
}
```

If the saved scene has several layers, re-acquire each one from `stage.children`. Only built-in shapes
round-trip automatically — register custom types on a `ClassRegistry` (see
[serialization](/Veyrajs/api/serialization/)) before loading them. Image sources are referenced rather
than embedded, so reassign each `image` after a load; the stage's own size, pixel ratio, and camera are
viewport state and are never serialized.

## Related

- [Serialization (API)](/Veyrajs/api/serialization/)
- [Serialization & Versioning (concept)](/Veyrajs/concepts/serialization/)
- [Commands & History (API)](/Veyrajs/api/commands/)
- [Recipe: A Custom Shape](/Veyrajs/recipes/custom-shape/) — register custom types so they round-trip.
