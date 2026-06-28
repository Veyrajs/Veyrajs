export const VERSION = '0.1.0'

// Base + nodes
export { AnnotationNode } from './nodes/annotation-node'
export type { AnnotationConfig } from './nodes/annotation-node'
export { BoundingBox } from './nodes/bounding-box'
export type { BoundingBoxConfig } from './nodes/bounding-box'
export { PolygonAnnotation } from './nodes/polygon-annotation'
export type { PolygonAnnotationConfig } from './nodes/polygon-annotation'
export { PolylineAnnotation } from './nodes/polyline-annotation'
export type { PolylineAnnotationConfig } from './nodes/polyline-annotation'
export { PointAnnotation } from './nodes/point-annotation'
export type { PointAnnotationConfig } from './nodes/point-annotation'
export { Skeleton } from './nodes/skeleton'
export type { SkeletonConfig } from './nodes/skeleton'
export { Cuboid } from './nodes/cuboid'
export type { CuboidConfig } from './nodes/cuboid'

// Skeletons
export type { SkeletonSchema } from './skeletons/schema'
export { COCO_17, FACE_5 } from './skeletons/presets'

// Controls
export { VertexEditor } from './controls/vertex-editor'
export type { VertexEditorOptions, VertexTarget } from './controls/vertex-editor'

// Tools
export type { Tool, DrawToolOptions } from './tools/tool'
export { DrawBoxTool } from './tools/draw-box-tool'
export type { DrawBoxToolOptions } from './tools/draw-box-tool'
export { DrawPolygonTool } from './tools/draw-polygon-tool'
export type { DrawPolygonToolOptions } from './tools/draw-polygon-tool'
export { DrawPolylineTool } from './tools/draw-polyline-tool'
export { PlacePointTool } from './tools/place-point-tool'
export { DrawSkeletonTool } from './tools/draw-skeleton-tool'
export { DrawCuboidTool } from './tools/draw-cuboid-tool'
export type { DrawCuboidToolOptions } from './tools/draw-cuboid-tool'

// Labels
export { LabelSchema } from './labels/label-schema'
export type { LabelClass, AnnotationStyle } from './labels/label-schema'

// Serialization
export { registerAnnotations } from './serialization/register'
