export { VERSION } from './version'

// Math primitives
export { Vec2, Matrix, Bounds } from './math'
export type { MatrixComponents } from './math'
export { pointInPolygon, distanceToSegment, distanceToPolyline } from './math'

// Scene graph
export { Node } from './scene/node'
export type { NodeConfig } from './scene/node'
export { Container } from './scene/container'
export { Group } from './scene/group'
export { Layer } from './scene/layer'
export { Shape } from './scene/shape'
export type { ShapeConfig } from './scene/shape'
export { Stage } from './scene/stage'
export type { StageOptions } from './scene/stage'
export { Camera } from './scene/camera'
export type { CameraOptions } from './scene/camera'

// Concrete shapes
export { Rect, Circle, Ellipse, Line, Polygon, Image, Text } from './scene/shapes'
export type {
  RectConfig,
  CircleConfig,
  EllipseConfig,
  LineConfig,
  PolygonConfig,
  ImageConfig,
  TextConfig,
} from './scene/shapes'

// Rendering
export { Canvas2DRenderer } from './render/canvas2d-renderer'
export type { Canvas2DRendererOptions } from './render/canvas2d-renderer'
export type { Renderer, Renderable, FrameInfo } from './render/renderer'
export type {
  DrawOp,
  RectOp,
  EllipseOp,
  PolygonOp,
  ImageOp,
  TextOp,
  FillStrokeStyle,
} from './render/draw-ops'

// Scheduling & ids
export { FrameScheduler } from './scheduler'
export { nextId } from './id'
