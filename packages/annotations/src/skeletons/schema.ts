/** Defines a skeleton: the ordered keypoint names and the bones (edges) connecting them. */
export interface SkeletonSchema {
  /** Keypoint names, in placement order. */
  keypoints: readonly string[]
  /** Bones as index pairs into `keypoints`. */
  edges: readonly (readonly [number, number])[]
}
