import { History, SelectionController, Stage } from '@veyrajs/core'
import type { Container, SelectionManager } from '@veyrajs/core'
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { NodeContextKey } from './context'

/**
 * Root component. Mounts a host element, creates a `Stage` once that element exists, and
 * provides the reactive context its descendants attach to. Set `selectable` to wire a
 * `SelectionController` + `History`. The stage is available via `@ready` or a template ref.
 */
export const ACStage = defineComponent({
  name: 'ACStage',
  props: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    background: { type: String, default: null },
    pixelRatio: { type: Number, default: undefined },
    selectable: { type: Boolean, default: false },
  },
  emits: ['ready'],
  setup(props, { slots, expose, emit }) {
    const host = ref<HTMLElement | null>(null)
    const stage = shallowRef<Stage | null>(null)
    const parent = shallowRef<Container | null>(null)
    const selection = shallowRef<SelectionManager | null>(null)
    const history = shallowRef<History | null>(null)
    let controller: SelectionController | null = null

    provide(NodeContextKey, { stage, parent, selection, history })

    onMounted(() => {
      const el = host.value
      if (el === null) return
      const instance = new Stage({
        container: el,
        width: props.width,
        height: props.height,
        background: props.background,
        pixelRatio: props.pixelRatio,
      })
      stage.value = instance
      parent.value = instance
      if (props.selectable) {
        const hist = new History()
        controller = new SelectionController(instance, { history: hist })
        selection.value = controller.selection
        history.value = hist
      }
      emit('ready', instance)
    })

    watch(
      () => [props.width, props.height] as const,
      ([w, h]) => stage.value?.setSize(w, h),
    )

    onBeforeUnmount(() => {
      controller?.destroy()
      stage.value?.destroy()
      stage.value = null
    })

    expose({ stage, selection, history })

    return () => h('div', { ref: host, class: 'ac-stage' }, slots.default?.())
  },
})
