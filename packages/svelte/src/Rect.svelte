<script lang="ts">
import { Rect } from '@annotacanvas/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={Rect} keys={[...SHAPE_KEYS, 'width', 'height']} {props} bind:node />
