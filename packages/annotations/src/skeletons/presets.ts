import type { SkeletonSchema } from './schema'

/** The 17-keypoint COCO person pose skeleton. */
export const COCO_17: SkeletonSchema = {
  keypoints: [
    'nose',
    'left_eye',
    'right_eye',
    'left_ear',
    'right_ear',
    'left_shoulder',
    'right_shoulder',
    'left_elbow',
    'right_elbow',
    'left_wrist',
    'right_wrist',
    'left_hip',
    'right_hip',
    'left_knee',
    'right_knee',
    'left_ankle',
    'right_ankle',
  ],
  edges: [
    [15, 13],
    [13, 11],
    [16, 14],
    [14, 12],
    [11, 12],
    [5, 11],
    [6, 12],
    [5, 6],
    [5, 7],
    [6, 8],
    [7, 9],
    [8, 10],
    [1, 2],
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
  ],
}

/** A minimal 5-point face skeleton (eyes, nose, mouth corners). */
export const FACE_5: SkeletonSchema = {
  keypoints: ['left_eye', 'right_eye', 'nose', 'mouth_left', 'mouth_right'],
  edges: [
    [0, 2],
    [1, 2],
    [2, 3],
    [2, 4],
    [3, 4],
  ],
}
