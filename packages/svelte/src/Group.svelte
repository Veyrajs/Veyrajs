<script lang="ts">
import { Group } from '@annotacanvas/core'
import Node from './Node.svelte'
import { COMMON_KEYS } from './keys.js'
import type { ContainerProps } from './types.js'

let { node = $bindable(), children, ...props }: ContainerProps = $props()
</script>

<Node nodeClass={Group} keys={COMMON_KEYS} isContainer {props} {children} bind:node />
