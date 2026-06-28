<script setup lang="ts">
import { ref } from 'vue'
import { ACStage, ACLayer, ACRect, ACCircle, ACText } from '@veyrajs/vue'
import { palette } from '../_demo-theme'

// A live Vue island: the declarative @veyrajs/vue API actually running.
const x = ref(60)
</script>

<template>
  <div class="veyrajs-demo">
    <ACStage :width="620" :height="300" selectable>
      <ACLayer>
        <ACText :x="18" :y="14" text="@veyrajs/vue — click the rect; drag the handles" :fontSize="13" :fill="palette.slate" />
        <ACRect :x="x" :y="70" :width="150" :height="90" :fill="palette.blue" @click="x += 20" />
        <ACCircle :x="380" :y="150" :radius="52" :fill="palette.cyan" />
      </ACLayer>
    </ACStage>
  </div>
</template>
