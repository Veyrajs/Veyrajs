<script lang="ts">
import { Line } from '@annotacanvas/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={Line} keys={[...SHAPE_KEYS, 'points', 'closed']} {props} bind:node />
