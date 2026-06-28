import {
  BoundingBox,
  Cuboid,
  PointAnnotation,
  PolygonAnnotation,
  PolylineAnnotation,
  Skeleton,
} from '@veyrajs/annotations'
import { defineNodeComponent } from './node-component'

// Label/style props every annotation node understands, on top of the shape style props.
const LABEL_PROPS = ['label', 'labelColor', 'showLabel', 'labelFontSize']

export const ACBoundingBox = defineNodeComponent({
  name: 'ACBoundingBox',
  NodeClass: BoundingBox,
  isShape: true,
  props: [...LABEL_PROPS, 'width', 'height', 'rotatable'],
})
export const ACPolygonAnnotation = defineNodeComponent({
  name: 'ACPolygonAnnotation',
  NodeClass: PolygonAnnotation,
  isShape: true,
  props: [...LABEL_PROPS, 'points'],
})
export const ACPolylineAnnotation = defineNodeComponent({
  name: 'ACPolylineAnnotation',
  NodeClass: PolylineAnnotation,
  isShape: true,
  props: [...LABEL_PROPS, 'points'],
})
export const ACPointAnnotation = defineNodeComponent({
  name: 'ACPointAnnotation',
  NodeClass: PointAnnotation,
  isShape: true,
  props: [...LABEL_PROPS, 'radius'],
})
export const ACSkeleton = defineNodeComponent({
  name: 'ACSkeleton',
  NodeClass: Skeleton,
  isShape: true,
  props: [...LABEL_PROPS, 'schema', 'points', 'jointRadius'],
})
export const ACCuboid = defineNodeComponent({
  name: 'ACCuboid',
  NodeClass: Cuboid,
  isShape: true,
  props: [...LABEL_PROPS, 'points'],
})
