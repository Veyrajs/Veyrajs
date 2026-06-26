import {
  Circle,
  Ellipse,
  Group,
  Image as ImageNode,
  Layer,
  Line,
  Polygon,
  Rect,
  Text,
} from '@veyrajs/core'
import { createNodeComponent } from './node-component'

export const ACLayer = createNodeComponent({ name: 'ACLayer', NodeClass: Layer, isContainer: true })
export const ACGroup = createNodeComponent({ name: 'ACGroup', NodeClass: Group, isContainer: true })

export const ACRect = createNodeComponent({
  name: 'ACRect',
  NodeClass: Rect,
  isShape: true,
  props: ['width', 'height'],
})
export const ACCircle = createNodeComponent({
  name: 'ACCircle',
  NodeClass: Circle,
  isShape: true,
  props: ['radius'],
})
export const ACEllipse = createNodeComponent({
  name: 'ACEllipse',
  NodeClass: Ellipse,
  isShape: true,
  props: ['radiusX', 'radiusY'],
})
export const ACLine = createNodeComponent({
  name: 'ACLine',
  NodeClass: Line,
  isShape: true,
  props: ['points', 'closed'],
})
export const ACPolygon = createNodeComponent({
  name: 'ACPolygon',
  NodeClass: Polygon,
  isShape: true,
  props: ['points'],
})
export const ACText = createNodeComponent({
  name: 'ACText',
  NodeClass: Text,
  isShape: true,
  props: ['text', 'fontSize', 'fontFamily', 'textAlign', 'textBaseline'],
})
export const ACImage = createNodeComponent({
  name: 'ACImage',
  NodeClass: ImageNode,
  isShape: true,
  props: ['image', 'width', 'height'],
})
