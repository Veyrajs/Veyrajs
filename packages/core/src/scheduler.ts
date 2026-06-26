const raf: (cb: () => void) => number =
  typeof requestAnimationFrame === 'function'
    ? (cb) => requestAnimationFrame(() => cb())
    : (cb) => setTimeout(cb, 16) as unknown as number

const caf: (handle: number) => void =
  typeof cancelAnimationFrame === 'function'
    ? (h) => cancelAnimationFrame(h)
    : (h) => clearTimeout(h)

/**
 * Coalesces many invalidations into a single animation-frame callback (Konva's
 * `batchDraw` idea). Multiple `request()` calls in one frame run the callback once.
 */
export class FrameScheduler {
  private scheduled = false
  private handle: number | null = null

  constructor(private readonly run: () => void) {}

  get isScheduled(): boolean {
    return this.scheduled
  }

  /** Schedule the callback for the next frame, if not already scheduled. */
  request(): void {
    if (this.scheduled) return
    this.scheduled = true
    this.handle = raf(() => {
      this.scheduled = false
      this.handle = null
      this.run()
    })
  }

  /** Cancel a pending frame, if any. */
  cancel(): void {
    if (this.handle !== null) caf(this.handle)
    this.scheduled = false
    this.handle = null
  }
}
