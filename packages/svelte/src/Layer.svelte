<script lang="ts">
import { Layer } from '@veyrajs/core'
import Node from './Node.svelte'
import { COMMON_KEYS } from './keys.js'
import type { ContainerProps } from './types.js'

let { node = $bindable(), children, ...props }: ContainerProps = $props()
</script>

<Node nodeClass={Layer} keys={COMMON_KEYS} isContainer {props} {children} bind:node />
