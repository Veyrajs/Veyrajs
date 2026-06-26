<script setup lang="ts">
import {
  Circle,
  Ellipse,
  Line,
  Polygon,
  Rect,
  type SceneEventType,
  type Shape,
  Stage,
  Text,
  VERSION,
} from '@annotacanvas/core'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const host = ref<HTMLElement | null>(null)
let stage: Stage | null = null

const hud = reactive({ zoom: 1, screen: { x: 0, y: 0 }, world: { x: 0, y: 0 } })
const log = ref<string[]>([])
let panLast: { x: number; y: number } | null = null

function pushLog(entry: string) {
  log.value = [entry, ...log.value].slice(0, 8)
}

function makeInteractive(shape: Shape) {
  let offset = { x: 0, y: 0 }
  shape.on('dragstart', (e) => {
    offset = { x: shape.x - e.worldPoint.x, y: shape.y - e.worldPoint.y }
    e.stopPropagation()
  })
  shape.on('dragmove', (e) => {
    shape.x = e.worldPoint.x + offset.x
    shape.y = e.worldPoint.y + offset.y
    e.stopPropagation()
  })
  shape.on('pointerenter', () => {
    shape.opacity = 0.7
  })
  shape.on('pointerleave', () => {
    shape.opacity = 1
  })
}

function buildScene(s: Stage) {
  const layer = s.createLayer()
  const shapes: Shape[] = [
    new Rect({ x: 60, y: 60, width: 150, height: 90, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2 }),
    new Circle({ x: 320, y: 110, radius: 52, fill: '#f472b6' }),
    new Ellipse({ x: 520, y: 110, radiusX: 80, radiusY: 48, fill: '#a78bfa' }),
    new Line({
      x: 60,
      y: 220,
      points: [
        { x: 0, y: 0 },
        { x: 110, y: 50 },
        { x: 220, y: 0 },
      ],
      stroke: '#fbbf24',
      strokeWidth: 4,
    }),
    new Polygon({
      x: 360,
      y: 235,
      points: [
        { x: 0, y: -48 },
        { x: 46, y: 34 },
        { x: -46, y: 34 },
      ],
      fill: '#34d399',
      stroke: '#059669',
      strokeWidth: 2,
    }),
    new Text({ x: 60, y: 320, text: 'Drag shapes · drag empty space to pan · scroll to zoom', fontSize: 18, fill: '#e2e8f0' }),
  ]
  for (const shape of shapes) {
    makeInteractive(shape)
    layer.add(shape)
  }
}

function wireStage(s: Stage) {
  s.on('wheel', (e) => {
    e.preventDefault()
    s.camera.zoomAt(e.screenPoint, e.deltaY < 0 ? 1.1 : 1 / 1.1)
    hud.zoom = s.camera.zoom
  })
  s.on('dragstart', (e) => {
    if (e.target === s) panLast = { ...e.screenPoint }
  })
  s.on('dragmove', (e) => {
    if (e.target === s && panLast) {
      s.camera.panBy(e.screenPoint.x - panLast.x, e.screenPoint.y - panLast.y)
      panLast = { ...e.screenPoint }
    }
  })
  s.on('dragend', () => {
    panLast = null
  })
  s.on('pointermove', (e) => {
    hud.screen = { x: Math.round(e.screenPoint.x), y: Math.round(e.screenPoint.y) }
    hud.world = { x: Math.round(e.worldPoint.x), y: Math.round(e.worldPoint.y) }
  })

  const logged: SceneEventType[] = ['pointerdown', 'click', 'dblclick', 'dragstart', 'dragend', 'pointerenter', 'pointerleave']
  for (const type of logged) {
    s.on(type, (e) => pushLog(`${e.type} · ${e.target.type}`), { capture: true })
  }
}

function resetView() {
  stage?.camera.reset()
  hud.zoom = 1
}

function syncSize() {
  if (stage && host.value) stage.setSize(host.value.clientWidth, host.value.clientHeight)
}

onMounted(() => {
  const el = host.value
  if (!el) return
  stage = new Stage({ container: el, width: el.clientWidth, height: el.clientHeight, background: '#0b1220' })
  wireStage(stage)
  buildScene(stage)
  window.addEventListener('resize', syncSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncSize)
  stage?.destroy()
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
        <button type="button" class="app__reset" @click="resetView">reset view</button>
        <div>zoom: {{ hud.zoom.toFixed(2) }}×</div>
        <div>screen: ({{ hud.screen.x }}, {{ hud.screen.y }})</div>
        <div>world: ({{ hud.world.x }}, {{ hud.world.y }})</div>
        <div class="app__log-title">events</div>
        <div v-for="(entry, i) in log" :key="i" class="app__log">{{ entry }}</div>
      </div>
    </main>
    <footer class="app__footer">
      Phase 5 — event system: pointer/click/dblclick/drag/hover with capture→target→bubble
      propagation. Hit-testing, selection &amp; serialization arrive in later phases.
    </footer>
  </div>
</template>
