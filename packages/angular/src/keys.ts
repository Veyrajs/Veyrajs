/** Transform/identity props shared by every node component. */
export const COMMON_KEYS = [
  'id',
  'name',
  'x',
  'y',
  'scaleX',
  'scaleY',
  'rotation',
  'skewX',
  'skewY',
  'offsetX',
  'offsetY',
  'opacity',
  'visible',
  'listening',
] as const

/** Common props plus the style props every shape understands. */
export const SHAPE_KEYS = [
  ...COMMON_KEYS,
  'fill',
  'stroke',
  'strokeWidth',
  'lineDash',
  'lineCap',
  'lineJoin',
] as const
