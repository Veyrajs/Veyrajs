import { History, SelectionController, Stage } from '@veyrajs/core'
import type { SelectionManager } from '@veyrajs/core'
import {
  type CSSProperties,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { NodeContext, type NodeContextValue } from './context'

export interface ACStageProps {
  width?: number
  height?: number
  background?: string | null
  pixelRatio?: number
  selectable?: boolean
  onReady?: (stage: Stage) => void
  style?: CSSProperties
  children?: ReactNode
}

export interface ACStageHandle {
  stage: Stage | null
  selection: SelectionManager | null
  history: History | null
}

/**
 * Root component. Mounts a host element, creates a `Stage` once that element exists, and
 * provides the context its descendants attach to. `selectable` wires selection + undo. The
 * stage is available via `onReady` or a forwarded ref (`{ stage, selection, history }`).
 */
export const ACStage: ForwardRefExoticComponent<ACStageProps & RefAttributes<ACStageHandle>> =
  forwardRef<ACStageHandle, ACStageProps>(function ACStage(props, ref) {
    const hostRef = useRef<HTMLDivElement>(null)
    const controllerRef = useRef<SelectionController | null>(null)
    const [context, setContext] = useState<NodeContextValue>({
      stage: null,
      parent: null,
      selection: null,
      history: null,
    })

    useImperativeHandle(
      ref,
      () => ({ stage: context.stage, selection: context.selection, history: context.history }),
      [context],
    )

    // biome-ignore lint/correctness/useExhaustiveDependencies: create the stage once, on mount.
    useEffect(() => {
      const el = hostRef.current
      if (el === null) return
      const stage = new Stage({
        container: el,
        width: props.width,
        height: props.height,
        background: props.background ?? null,
        pixelRatio: props.pixelRatio,
      })
      let selection: SelectionManager | null = null
      let history: History | null = null
      if (props.selectable) {
        history = new History()
        controllerRef.current = new SelectionController(stage, { history })
        selection = controllerRef.current.selection
      }
      setContext({ stage, parent: stage, selection, history })
      props.onReady?.(stage)
      return () => {
        controllerRef.current?.destroy()
        controllerRef.current = null
        stage.destroy()
      }
    }, [])

    useEffect(() => {
      context.stage?.setSize(props.width ?? 0, props.height ?? 0)
    }, [props.width, props.height, context.stage])

    return createElement(
      'div',
      { ref: hostRef, className: 'ac-stage', style: props.style },
      createElement(NodeContext.Provider, { value: context }, props.children),
    )
  })

ACStage.displayName = 'ACStage'
