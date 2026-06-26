export type HandleKind = 'resize' | 'rotate'

/**
 * A declarative control handle. Position is normalized (0..1) on the selection bounds, with
 * an optional screen-pixel offset (e.g. the rotate handle floats above the top edge).
 */
export interface ControlDef {
  key: string
  /** Normalized x on the bounds (0 = left, 1 = right). */
  nx: number
  /** Normalized y on the bounds (0 = top, 1 = bottom). */
  ny: number
  /** Screen-pixel offset from the normalized position. */
  offsetX?: number
  offsetY?: number
  kind: HandleKind
  /** CSS cursor shown when hovering the handle. */
  cursor: string
  /** For resize handles: the normalized position of the opposite (anchor) corner. */
  anchorNx?: number
  anchorNy?: number
}

/** The default 8 resize handles + a rotate handle above the top edge. */
export const DEFAULT_CONTROLS: readonly ControlDef[] = [
  { key: 'tl', nx: 0, ny: 0, kind: 'resize', cursor: 'nwse-resize', anchorNx: 1, anchorNy: 1 },
  { key: 'tr', nx: 1, ny: 0, kind: 'resize', cursor: 'nesw-resize', anchorNx: 0, anchorNy: 1 },
  { key: 'br', nx: 1, ny: 1, kind: 'resize', cursor: 'nwse-resize', anchorNx: 0, anchorNy: 0 },
  { key: 'bl', nx: 0, ny: 1, kind: 'resize', cursor: 'nesw-resize', anchorNx: 1, anchorNy: 0 },
  { key: 'mt', nx: 0.5, ny: 0, kind: 'resize', cursor: 'ns-resize', anchorNx: 0.5, anchorNy: 1 },
  { key: 'mr', nx: 1, ny: 0.5, kind: 'resize', cursor: 'ew-resize', anchorNx: 0, anchorNy: 0.5 },
  { key: 'mb', nx: 0.5, ny: 1, kind: 'resize', cursor: 'ns-resize', anchorNx: 0.5, anchorNy: 0 },
  { key: 'ml', nx: 0, ny: 0.5, kind: 'resize', cursor: 'ew-resize', anchorNx: 1, anchorNy: 0.5 },
  { key: 'rotate', nx: 0.5, ny: 0, offsetY: -26, kind: 'rotate', cursor: 'grab' },
]
