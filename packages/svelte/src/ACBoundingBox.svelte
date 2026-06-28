<script lang="ts">
import { BoundingBox } from '@veyrajs/annotations'
import Node from './Node.svelte'
import { ANNOTATION_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={BoundingBox} keys={[...ANNOTATION_KEYS, 'width', 'height', 'rotatable']} {props} bind:node />
