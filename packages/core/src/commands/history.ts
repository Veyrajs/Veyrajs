import type { Command } from './command'

export type HistoryListener = () => void

/**
 * Undo/redo stack of {@link Command}s. `run` executes and records a command; `push` records
 * one that was already applied (used by the controller, which mutates live during a drag and
 * records the net change on release).
 */
export class History {
  private readonly undoStack: Command[] = []
  private readonly redoStack: Command[] = []
  private readonly listeners = new Set<HistoryListener>()

  constructor(private readonly limit = 200) {}

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** Execute a command and record it (clears the redo stack). */
  run(command: Command): void {
    command.do()
    this.push(command)
  }

  /** Record an already-applied command (clears the redo stack). */
  push(command: Command): void {
    this.undoStack.push(command)
    if (this.undoStack.length > this.limit) this.undoStack.shift()
    this.redoStack.length = 0
    this.emit()
  }

  undo(): void {
    const command = this.undoStack.pop()
    if (command === undefined) return
    command.undo()
    this.redoStack.push(command)
    this.emit()
  }

  redo(): void {
    const command = this.redoStack.pop()
    if (command === undefined) return
    command.do()
    this.undoStack.push(command)
    this.emit()
  }

  clear(): void {
    this.undoStack.length = 0
    this.redoStack.length = 0
    this.emit()
  }

  /** Subscribe to stack changes. Returns an unsubscribe function. */
  onChange(listener: HistoryListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    for (const listener of [...this.listeners]) listener()
  }
}
