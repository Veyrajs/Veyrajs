<script lang="ts">
import { Image as ImageNode } from '@veyrajs/core'
import Node from './Node.svelte'
import { SHAPE_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={ImageNode} keys={[...SHAPE_KEYS, 'image', 'width', 'height']} {props} bind:node />
