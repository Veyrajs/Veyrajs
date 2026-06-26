import { Container, type Node, type SceneEvent, type SceneEventType } from '@veyrajs/core'
import {
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { NodeContext } from './context'

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

/** Engine event `click` → React handler prop `onClick`. */
function handlerName(type: string): string {
  return `on${type.charAt(0).toUpperCase()}${type.slice(1)}`
}

export interface NodeComponentConfig {
  name: string
  NodeClass: new (config?: never) => Node
  props?: string[]
  isShape?: boolean
  isContainer?: boolean
}

export type NodeProps = Record<string, unknown> & { children?: ReactNode }

/**
 * Build a declarative React component around an engine node: create it once, attach to the
 * parent once it's available (the reactive cascade via context), mirror prop changes onto it,
 * re-emit its events as `onX` callbacks, expose it via `ref`, and remove it on unmount.
 */
export function createNodeComponent(
  config: NodeComponentConfig,
): ForwardRefExoticComponent<NodeProps & RefAttributes<Node>> {
  const propKeys = [
    ...COMMON_PROPS,
    ...(config.isShape ? STYLE_PROPS : []),
    ...(config.props ?? []),
  ]

  const Component = forwardRef<Node, NodeProps>(function NodeComponent(props, ref) {
    const context = useContext(NodeContext)
    const nodeRef = useRef<Node | null>(null)
    if (nodeRef.current === null) {
      nodeRef.current = new config.NodeClass(buildConfig(props, propKeys) as never)
    }
    const node = nodeRef.current
    const target = node as unknown as Record<string, unknown>

    useImperativeHandle(ref, () => node, [node])

    // Attach to the parent once it becomes available; detach on unmount / parent change.
    useEffect(() => {
      const parent = context.parent
      if (parent !== null && node.parent !== parent) parent.add(node)
      return () => {
        node.remove()
      }
    }, [context.parent, node])

    // Mirror prop changes onto the node every render (guarded setters → loop-safe).
    useEffect(() => {
      for (const key of propKeys) {
        if (key === 'id') continue
        const value = props[key]
        if (value !== undefined) target[key] = value
      }
    })

    // Re-emit engine events as `onX` callbacks, reading the latest props from a ref.
    const propsRef = useRef(props)
    propsRef.current = props
    useEffect(() => {
      const handlers = EVENTS.map((type) => {
        const handler = (event: SceneEvent): void => {
          const callback = propsRef.current[handlerName(type)]
          if (typeof callback === 'function') (callback as (e: SceneEvent) => void)(event)
        }
        node.on(type, handler)
        return [type, handler] as const
      })
      return () => {
        for (const [type, handler] of handlers) node.off(type, handler)
      }
    }, [node])

    // Containers provide themselves as the parent for their children.
    const childContext = useMemo(
      () => ({ ...context, parent: node instanceof Container ? node : context.parent }),
      [context, node],
    )

    if (config.isContainer) {
      return createElement(
        NodeContext.Provider,
        { value: childContext },
        props.children as ReactNode,
      )
    }
    return null
  })

  Component.displayName = config.name
  return Component
}

function buildConfig(props: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const config: Record<string, unknown> = {}
  for (const key of keys) {
    if (props[key] !== undefined) config[key] = props[key]
  }
  return config
}
