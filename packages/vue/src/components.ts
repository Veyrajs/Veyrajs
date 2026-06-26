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
} from '@annotacanvas/core'
import { defineNodeComponent } from './node-component'

export const ACLayer = defineNodeComponent({ name: 'ACLayer', NodeClass: Layer, isContainer: true })
export const ACGroup = defineNodeComponent({ name: 'ACGroup', NodeClass: Group, isContainer: true })

export const ACRect = defineNodeComponent({
  name: 'ACRect',
  NodeClass: Rect,
  isShape: true,
  props: ['width', 'height'],
})
export const ACCircle = defineNodeComponent({
  name: 'ACCircle',
  NodeClass: Circle,
  isShape: true,
  props: ['radius'],
})
export const ACEllipse = defineNodeComponent({
  name: 'ACEllipse',
  NodeClass: Ellipse,
  isShape: true,
  props: ['radiusX', 'radiusY'],
})
export const ACLine = defineNodeComponent({
  name: 'ACLine',
  NodeClass: Line,
  isShape: true,
  props: ['points', 'closed'],
})
export const ACPolygon = defineNodeComponent({
  name: 'ACPolygon',
  NodeClass: Polygon,
  isShape: true,
  props: ['points'],
})
export const ACText = defineNodeComponent({
  name: 'ACText',
  NodeClass: Text,
  isShape: true,
  props: ['text', 'fontSize', 'fontFamily', 'textAlign', 'textBaseline'],
})
export const ACImage = defineNodeComponent({
  name: 'ACImage',
  NodeClass: ImageNode,
  isShape: true,
  props: ['image', 'width', 'height'],
})
