<script lang="ts">
import { Polygon } from '@veyrajs/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={Polygon} keys={[...SHAPE_KEYS, 'points']} {props} bind:node />
