<script lang="ts">
  import { ACStage, ACLayer, ACRect, ACCircle, ACText } from '@veyrajs/svelte'

  // A live Svelte 5 island: the declarative @veyrajs/svelte API actually running.
  let x = $state(60)
</script>

<div class="veyrajs-demo">
  <ACStage width={620} height={300} background="#0b1220" selectable>
    <ACLayer>
      <ACText x={18} y={14} text="@veyrajs/svelte — click the rect; drag the handles" fontSize={13} fill="#64748b" />
      <ACRect {x} y={70} width={150} height={90} fill="#38bdf8" onclick={() => (x += 20)} />
      <ACCircle x={380} y={150} radius={52} fill="#f472b6" />
    </ACLayer>
  </ACStage>
</div>
