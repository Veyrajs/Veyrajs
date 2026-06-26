<script lang="ts">
import type { Stage } from '@annotacanvas/core'
import ACLayer from '../src/Layer.svelte'
import ACRect from '../src/Rect.svelte'
import ACStage from '../src/Stage.svelte'

let {
  onstage,
  x = 10,
  show = true,
}: { onstage?: (stage: Stage) => void; x?: number; show?: boolean } = $props()
</script>

<ACStage onready={onstage} width={200} height={200}>
  <ACLayer>
    {#if show}<ACRect {x} y={0} width={30} height={40} fill="#f00" />{/if}
  </ACLayer>
</ACStage>
