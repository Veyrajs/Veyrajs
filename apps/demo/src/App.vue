<script setup lang="ts">
import {
  Circle,
  Ellipse,
  Line,
  Polygon,
  Rect,
  Stage,
  Text,
  VERSION,
} from '@annotacanvas/core'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const host = ref<HTMLElement | null>(null)
let stage: Stage | null = null

const hud = reactive({
  zoom: 1,
  screen: { x: 0, y: 0 },
  world: { x: 0, y: 0 },
})

let panning = false
let last = { x: 0, y: 0 }

function buildScene(s: Stage) {
  const layer = s.createLayer()
  layer.add(
    new Rect({ x: 40, y: 40, width: 150, height: 90, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2 }),
    new Circle({ x: 300, y: 95, radius: 52, fill: '#f472b6' }),
    new Ellipse({ x: 480, y: 95, radiusX: 80, radiusY: 48, fill: '#a78bfa' }),
    new Line({
      x: 40,
      y: 230,
      points: [
        { x: 0, y: 0 },
        { x: 110, y: 50 },
        { x: 220, y: 0 },
        { x: 330, y: 50 },
      ],
      stroke: '#fbbf24',
      strokeWidth: 3,
    }),
    new Polygon({
      x: 470,
      y: 205,
      points: [
        { x: 0, y: -48 },
        { x: 46, y: 34 },
        { x: -46, y: 34 },
      ],
      fill: '#34d399',
      stroke: '#059669',
      strokeWidth: 2,
    }),
    new Text({
      x: 40,
      y: 320,
      text: 'Scroll to zoom · drag to pan',
      fontSize: 20,
      fill: '#e2e8f0',
    }),
  )
}

function localPoint(e: PointerEvent | WheelEvent) {
  const rect = host.value?.getBoundingClientRect()
  return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) }
}

function updateHud(p: { x: number; y: number }) {
  if (!stage) return
  hud.screen = { x: Math.round(p.x), y: Math.round(p.y) }
  const w = stage.screenToWorld(p)
  hud.world = { x: Math.round(w.x), y: Math.round(w.y) }
  hud.zoom = stage.camera.zoom
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const p = localPoint(e)
  stage?.camera.zoomAt(p, e.deltaY < 0 ? 1.1 : 1 / 1.1)
  updateHud(p)
}

function onPointerDown(e: PointerEvent) {
  panning = true
  last = localPoint(e)
  host.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  const p = localPoint(e)
  if (panning && stage) {
    stage.camera.panBy(p.x - last.x, p.y - last.y)
    last = p
  }
  updateHud(p)
}

function onPointerUp(e: PointerEvent) {
  panning = false
  host.value?.releasePointerCapture(e.pointerId)
}

function resetView() {
  stage?.camera.reset()
  hud.zoom = 1
}

function syncSize() {
  if (stage && host.value) {
    stage.setSize(host.value.clientWidth, host.value.clientHeight)
  }
}

onMounted(() => {
  const el = host.value
  if (!el) return
  stage = new Stage({
    container: el,
    width: el.clientWidth,
    height: el.clientHeight,
    background: '#0b1220',
  })
  buildScene(stage)

  el.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerUp)
  window.addEventListener('resize', syncSize)
})

onBeforeUnmount(() => {
  const el = host.value
  el?.removeEventListener('wheel', onWheel)
  el?.removeEventListener('pointerdown', onPointerDown)
  el?.removeEventListener('pointermove', onPointerMove)
  el?.removeEventListener('pointerup', onPointerUp)
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
      </div>
    </main>
    <footer class="app__footer">
      Phase 4 — camera (zoom/pan) with screen↔world coordinate conversion. Events,
      hit-testing, selection &amp; serialization arrive in later phases.
    </footer>
  </div>
</template>
