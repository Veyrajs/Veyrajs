import { Container, type Node, type SceneEvent, type SceneEventType } from '@annotacanvas/core'
import {
  type Component,
  defineComponent,
  onBeforeUnmount,
  provide,
  shallowRef,
  watch,
  watchEffect,
} from 'vue'
import { NodeContextKey, useNodeContext } from './context'

const COMMON_PROPS = [
  'id',
  'name',
  'x',
  'y',
  'scaleX',
  'scaleY',
  'rotation',
  'skewX',
  'skewY',
  'offsetX',
  'offsetY',
  'opacity',
  'visible',
  'listening',
]
const STYLE_PROPS = ['fill', 'stroke', 'strokeWidth', 'lineDash', 'lineCap', 'lineJoin']
const EVENTS: SceneEventType[] = [
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointerenter',
  'pointerleave',
  'click',
  'dblclick',
  'wheel',
  'dragstart',
  'dragmove',
  'dragend',
]

export interface NodeComponentConfig {
  name: string
  NodeClass: new (config?: never) => Node
  /** Shape-specific prop keys (e.g. `width`, `radius`, `points`). */
  props?: string[]
  isShape?: boolean
  isContainer?: boolean
}

/**
 * Build a declarative Vue component that manages an engine node's lifecycle: create it,
 * attach to the parent when ready, mirror prop changes onto it, re-emit its events, expose
 * it via a template ref, and remove it on unmount.
 */
export function defineNodeComponent(config: NodeComponentConfig): Component {
  const propKeys = [
    ...COMMON_PROPS,
    ...(config.isShape ? STYLE_PROPS : []),
    ...(config.props ?? []),
  ]
  const propDefs = Object.fromEntries(propKeys.map((key) => [key, { default: undefined }]))

  return defineComponent({
    name: config.name,
    props: propDefs,
    emits: EVENTS,
    setup(props, { slots, expose, emit }) {
      const context = useNodeContext()
      const read = props as Record<string, unknown>
      const node = new config.NodeClass(buildConfig(read, propKeys) as never)
      const target = node as unknown as Record<string, unknown>

      // Attach to the parent once it becomes available (the reactive cascade).
      const stopAttach = watch(
        context.parent,
        (parent) => {
          if (parent !== null && node.parent !== parent) parent.add(node)
        },
        { immediate: true },
      )

      // Containers provide themselves as the parent for their children.
      if (config.isContainer && node instanceof Container) {
        provide(NodeContextKey, {
          stage: context.stage,
          parent: shallowRef<Container | null>(node),
          selection: context.selection,
          history: context.history,
        })
      }

      // Mirror prop changes onto the node (setters are guarded, so this is loop-safe).
      watchEffect(() => {
        for (const key of propKeys) {
          if (key === 'id') continue
          const value = read[key]
          if (value !== undefined) target[key] = value
        }
      })

      // Re-emit engine events as Vue emits.
      const handlers = EVENTS.map((type) => {
        const handler = (event: SceneEvent): void => emit(type, event)
        node.on(type, handler)
        return [type, handler] as const
      })

      expose({ node })

      onBeforeUnmount(() => {
        stopAttach()
        for (const [type, handler] of handlers) node.off(type, handler)
        node.remove()
      })

      return () => (config.isContainer ? slots.default?.() : null)
    },
  })
}

function buildConfig(props: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const config: Record<string, unknown> = {}
  for (const key of keys) {
    if (props[key] !== undefined) config[key] = props[key]
  }
  return config
}
