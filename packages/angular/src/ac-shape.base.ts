import { Directive, Input } from '@angular/core'
import { AcNodeBase } from './ac-node.base'

/** Adds the style inputs every shape understands. Containers extend `AcNodeBase` directly. */
@Directive()
export abstract class AcShapeBase extends AcNodeBase {
  @Input() fill?: string
  @Input() stroke?: string
  @Input() strokeWidth?: number
  @Input() lineDash?: number[]
  @Input() lineCap?: string
  @Input() lineJoin?: string
}
