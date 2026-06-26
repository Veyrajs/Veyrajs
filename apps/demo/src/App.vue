<script setup lang="ts">
import { Stage, VERSION } from '@annotacanvas/core'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const host = ref<HTMLElement | null>(null)
let stage: Stage | null = null

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
      Phase 1 scaffold — a blank, DPR-correct stage is mounted above. Scene graph,
      shapes, camera, events, selection &amp; serialization arrive in later phases.
    </footer>
  </div>
</template>
