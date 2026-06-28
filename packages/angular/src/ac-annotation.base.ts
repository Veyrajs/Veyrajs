import { Directive, Input } from '@angular/core'
import { AcShapeBase } from './ac-shape.base'

/** Adds the label inputs every annotation node understands. */
@Directive()
export abstract class AcAnnotationBase extends AcShapeBase {
  @Input() label?: string
  @Input() labelColor?: string | null
  @Input() showLabel?: boolean
  @Input() labelFontSize?: number
}
