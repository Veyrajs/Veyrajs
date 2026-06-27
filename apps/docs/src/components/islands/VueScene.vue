<script setup lang="ts">
import { ref } from 'vue'
import { ACStage, ACLayer, ACRect, ACCircle, ACText } from '@veyrajs/vue'

// A live Vue island: the declarative @veyrajs/vue API actually running.
const x = ref(60)
</script>

<template>
  <div class="veyrajs-demo">
    <ACStage :width="620" :height="300" background="#0b1220" selectable>
      <ACLayer>
        <ACText :x="18" :y="14" text="@veyrajs/vue — click the rect; drag the handles" :fontSize="13" fill="#64748b" />
        <ACRect :x="x" :y="70" :width="150" :height="90" fill="#38bdf8" @click="x += 20" />
        <ACCircle :x="380" :y="150" :radius="52" fill="#f472b6" />
      </ACLayer>
    </ACStage>
  </div>
</template>
