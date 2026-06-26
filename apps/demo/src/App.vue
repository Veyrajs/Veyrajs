<script setup lang="ts">
import {
  Circle,
  Ellipse,
  History,
  Polygon,
  Rect,
  SceneSerializer,
  SelectionController,
  Stage,
  Text,
  VERSION,
} from '@annotacanvas/core'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const host = ref<HTMLElement | null>(null)
let stage: Stage | null = null
let controller: SelectionController | null = null
const history = new History()
const serializer = new SceneSerializer()
let savedJson = ''

const hud = reactive({ zoom: 1, selected: 0, kind: '', canUndo: false, canRedo: false, savedBytes: 0 })

function buildScene(s: Stage) {
  const layer = s.createLayer()
  layer.add(
    new Rect({ x: 80, y: 70, width: 150, height: 90, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2 }),
    new Circle({ x: 340, y: 120, radius: 52, fill: '#f472b6' }),
    new Ellipse({ x: 540, y: 120, radiusX: 80, radiusY: 48, fill: '#a78bfa' }),
    new Polygon({
      x: 360,
      y: 250,
      points: [
        { x: 0, y: -48 },
        { x: 46, y: 34 },
        { x: -46, y: 34 },
      ],
      fill: '#34d399',
      stroke: '#059669',
      strokeWidth: 2,
    }),
    new Text({ x: 80, y: 330, text: 'Select & transform · undo/redo · export/import JSON', fontSize: 16, fill: '#e2e8f0' }),
  )
}

function syncSize() {
  if (stage && host.value) stage.setSize(host.value.clientWidth, host.value.clientHeight)
}
function resetView() {
  stage?.camera.reset()
  hud.zoom = 1
}
function exportScene() {
  if (!stage) return
  savedJson = serializer.stringify(stage)
  hud.savedBytes = savedJson.length
}
function importScene() {
  if (!stage || savedJson === '') return
  controller?.selection.clear()
  serializer.parse(stage, savedJson)
  history.clear()
}

onMounted(() => {
  const el = host.value
  if (!el) return
  stage = new Stage({ container: el, width: el.clientWidth, height: el.clientHeight, background: '#0b1220' })
  controller = new SelectionController(stage, { history })
  controller.selection.onChange((nodes) => {
    hud.selected = nodes.length
    hud.kind = nodes.length === 1 ? (nodes[0]?.type ?? '') : ''
  })
  history.onChange(() => {
    hud.canUndo = history.canUndo
    hud.canRedo = history.canRedo
  })
  stage.on('wheel', (e) => {
    e.preventDefault()
    stage?.camera.zoomAt(e.screenPoint, e.deltaY < 0 ? 1.1 : 1 / 1.1)
    if (stage) hud.zoom = stage.camera.zoom
  })
  buildScene(stage)
  window.addEventListener('resize', syncSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncSize)
  controller?.destroy()
  stage?.destroy()
  controller = null
  stage = null
})
</script>

<template>
  <div class="app">
    <header class="app__header">
      <strong>AnnotaCanvas</strong>
      <span class="app__badge">demo</span>
      <span class="app__version">core v{{ VERSION }}</span>
    </header>
    <main class="app__stage">
      <div ref="host" class="app__canvas"></div>
      <div class="app__hud">
        <div class="app__row">
          <button type="button" class="app__btn" :disabled="!hud.canUndo" @click="history.undo()">undo</button>
          <button type="button" class="app__btn" :disabled="!hud.canRedo" @click="history.redo()">redo</button>
        </div>
        <div class="app__row">
          <button type="button" class="app__btn" @click="exportScene">export</button>
          <button type="button" class="app__btn" @click="importScene">import</button>
        </div>
        <button type="button" class="app__btn" @click="resetView">reset view</button>
        <div>zoom: {{ hud.zoom.toFixed(2) }}×</div>
        <div>selected: {{ hud.selected }}{{ hud.kind ? ` · ${hud.kind}` : '' }}</div>
        <div v-if="hud.savedBytes">saved: {{ hud.savedBytes }} B</div>
      </div>
    </main>
    <footer class="app__footer">
      Phase 8 — versioned JSON serialization (export/import) and a command/undo layer
      (move/resize/rotate are undoable). The Vue adapter arrives next.
    </footer>
  </div>
</template>
