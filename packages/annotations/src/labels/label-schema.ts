/** A single annotation class: a stable id, a display name, and a color. */
export interface LabelClass {
  id: string
  name: string
  color: string
}

/** The resolved style a new annotation of a given class should use. */
export interface AnnotationStyle {
  stroke: string
  fill: string | null
  labelColor: string
}

/**
 * A configurable palette of annotation classes. Tools and apps use it to style new annotations
 * (e.g. `'car'` → blue, `'person'` → green). Entirely user-defined — pass your own classes; the
 * schema itself is not serialized into nodes (each node stores its own resolved label + color).
 */
export class LabelSchema {
  readonly classes: readonly LabelClass[]
  private readonly byId: Map<string, LabelClass>

  constructor(classes: readonly LabelClass[] = []) {
    this.classes = classes
    this.byId = new Map(classes.map((c) => [c.id, c]))
  }

  get(id: string): LabelClass | undefined {
    return this.byId.get(id)
  }

  /** The stroke / fill / label color a new annotation of class `id` should use, or `undefined`. */
  styleFor(id: string): AnnotationStyle | undefined {
    const cls = this.byId.get(id)
    if (cls === undefined) return undefined
    return { stroke: cls.color, fill: null, labelColor: cls.color }
  }
}
