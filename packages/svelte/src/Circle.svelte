<script lang="ts">
import { Circle } from '@veyrajs/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={Circle} keys={[...SHAPE_KEYS, 'radius']} {props} bind:node />
