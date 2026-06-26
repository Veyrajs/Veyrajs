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
import { onBeforeUnmount, onMounted, ref } from 'vue'

const host = ref<HTMLElement | null>(null)
let stage: Stage | null = null

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
      text: 'AnnotaCanvas — Phase 3: Rect · Circle · Ellipse · Line · Polygon · Text',
      fontSize: 20,
      fill: '#e2e8f0',
    }),
  )
}

function syncSize() {
  if (stage && host.value) {
    stage.setSize(host.value.clientWidth, host.value.clientHeight)
  }
}

onMounted(() => {
  if (!host.value) return
  stage = new Stage({
    container: host.value,
    width: host.value.clientWidth,
    height: host.value.clientHeight,
    background: '#0b1220',
  })
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
    <main ref="host" class="app__stage"></main>
    <footer class="app__footer">
      Phase 3 — concrete shapes rendered through the scene graph and Canvas 2D renderer.
      Camera (zoom/pan), events, selection &amp; serialization arrive in later phases.
    </footer>
  </div>
</template>
