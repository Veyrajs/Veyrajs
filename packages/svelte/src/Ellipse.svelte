<script lang="ts">
import { Ellipse } from '@annotacanvas/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={Ellipse} keys={[...SHAPE_KEYS, 'radiusX', 'radiusY']} {props} bind:node />
