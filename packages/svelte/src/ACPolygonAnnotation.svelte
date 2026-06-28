<script lang="ts">
import { PolygonAnnotation } from '@veyrajs/annotations'
import Node from './Node.svelte'
import { ANNOTATION_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={PolygonAnnotation} keys={[...ANNOTATION_KEYS, 'points']} {props} bind:node />
