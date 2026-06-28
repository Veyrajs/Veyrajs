<script lang="ts">
import { Skeleton } from '@veyrajs/annotations'
import Node from './Node.svelte'
import { ANNOTATION_KEYS } from './keys.js'
import type { ShapeProps } from './types.js'

let { node = $bindable(), ...props }: ShapeProps = $props()
</script>

<Node nodeClass={Skeleton} keys={[...ANNOTATION_KEYS, 'schema', 'points', 'jointRadius']} {props} bind:node />
