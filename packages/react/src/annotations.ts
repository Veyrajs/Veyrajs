import {
  BoundingBox,
  Cuboid,
  PointAnnotation,
  PolygonAnnotation,
  PolylineAnnotation,
  Skeleton,
} from '@veyrajs/annotations'
import { createNodeComponent } from './node-component'

// Label/style props every annotation node understands, on top of the shape style props.
const LABEL_PROPS = ['label', 'labelColor', 'showLabel', 'labelFontSize']

export const ACBoundingBox = createNodeComponent({
  name: 'ACBoundingBox',
  NodeClass: BoundingBox,
  isShape: true,
  props: [...LABEL_PROPS, 'width', 'height', 'rotatable'],
})
export const ACPolygonAnnotation = createNodeComponent({
  name: 'ACPolygonAnnotation',
  NodeClass: PolygonAnnotation,
  isShape: true,
  props: [...LABEL_PROPS, 'points'],
})
export const ACPolylineAnnotation = createNodeComponent({
  name: 'ACPolylineAnnotation',
  NodeClass: PolylineAnnotation,
  isShape: true,
  props: [...LABEL_PROPS, 'points'],
})
export const ACPointAnnotation = createNodeComponent({
  name: 'ACPointAnnotation',
  NodeClass: PointAnnotation,
  isShape: true,
  props: [...LABEL_PROPS, 'radius'],
})
export const ACSkeleton = createNodeComponent({
  name: 'ACSkeleton',
  NodeClass: Skeleton,
  isShape: true,
  props: [...LABEL_PROPS, 'schema', 'points', 'jointRadius'],
})
export const ACCuboid = createNodeComponent({
  name: 'ACCuboid',
  NodeClass: Cuboid,
  isShape: true,
  props: [...LABEL_PROPS, 'points'],
})
