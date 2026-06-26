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
export type { ShapeConfig, ShapeHitKind, ShapeHitOptions } from './scene/shape'
export { Stage } from './scene/stage'
export type { StageOptions, Overlay } from './scene/stage'
export { Camera } from './scene/camera'
export type { CameraOptions } from './scene/camera'

// Events
export { SceneEvent } from './events/event-types'
export type {
  SceneEventType,
  SceneEventPhase,
  SceneEventListener,
} from './events/event-types'
export { dispatchEvent } from './events/dispatch'
export { EventManager } from './events/event-manager'

// Hit testing
export { GeometricHitTester } from './hit/geometric-hit-tester'
export type { HitTester, HitResult, HitType, HitTestOptions } from './hit/hit-tester'

// Selection & controls
export { SelectionManager } from './selection/selection-manager'
export type { SelectionChangeListener } from './selection/selection-manager'
export { SelectionController } from './controls/selection-controller'
export type { SelectionControllerOptions } from './controls/selection-controller'
export { DEFAULT_CONTROLS } from './controls/controls'
export type { ControlDef, HandleKind } from './controls/controls'
export { computeResize, computeRotation, pointerAngle } from './controls/transform-math'
export type {
  ResizeContext,
  ResizeResult,
  RotateContext,
  RotateResult,
} from './controls/transform-math'

// Serialization
export { SceneSerializer } from './serialization/scene-serializer'
export type { SceneSerializerOptions } from './serialization/scene-serializer'
export { ClassRegistry, createDefaultRegistry } from './serialization/class-registry'
export type { NodeFactory } from './serialization/class-registry'
export { MigrationRunner } from './serialization/migration-runner'
export type { Migration } from './serialization/migration-runner'
export { CURRENT_SCHEMA_VERSION } from './serialization/types'
export type { SceneDocument, SerializedNode } from './serialization/types'

// Commands & history
export { History } from './commands/history'
export type { HistoryListener } from './commands/history'
export {
  SetPropsCommand,
  AddNodeCommand,
  RemoveNodeCommand,
  CompositeCommand,
} from './commands/command'
export type { Command, NodeProps } from './commands/command'

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
