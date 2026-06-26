<script lang="ts">
import { Text } from '@annotacanvas/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node
  nodeClass={Text}
  keys={[...SHAPE_KEYS, 'text', 'fontSize', 'fontFamily', 'textAlign', 'textBaseline']}
  {props}
  bind:node
/>
