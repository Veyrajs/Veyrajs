let counter = 0

/** Monotonic, deterministic id generator (no RNG → stable across runs and snapshots). */
export function nextId(prefix = 'node'): string {
  counter += 1
  return `${prefix}-${counter}`
}

/** Test helper: reset the id counter so ids are predictable per test. */
export function resetIdCounter(): void {
  counter = 0
}
