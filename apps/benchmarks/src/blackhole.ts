/**
 * A sink that consumes benchmark results so the JIT cannot dead-code-eliminate the very
 * computation we are timing. Every micro-bench folds a number from its result into `n`.
 */
export const blackhole = { n: 0 }
