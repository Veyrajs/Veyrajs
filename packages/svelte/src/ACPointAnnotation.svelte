<script lang="ts">
import { PointAnnotation } from '@veyrajs/annotations'
import Node from './Node.svelte'
import { ANNOTATION_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={PointAnnotation} keys={[...ANNOTATION_KEYS, 'radius']} {props} bind:node />
