import { afterEach, describe, expect, it, vi } from 'vitest'
import { FrameScheduler } from '../index'

const FAKE = { toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] as const }

describe('FrameScheduler', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('coalesces multiple requests into a single run', () => {
    vi.useFakeTimers({ toFake: [...FAKE.toFake] })
    let runs = 0
    const s = new FrameScheduler(() => {
      runs += 1
    })
    s.request()
    s.request()
    s.request()
    expect(s.isScheduled).toBe(true)
    expect(runs).toBe(0)

    vi.runAllTimers()
    expect(runs).toBe(1)
    expect(s.isScheduled).toBe(false)
  })

  it('can be cancelled before the frame fires', () => {
    vi.useFakeTimers({ toFake: [...FAKE.toFake] })
    let runs = 0
    const s = new FrameScheduler(() => {
      runs += 1
    })
    s.request()
    s.cancel()
    vi.runAllTimers()
    expect(runs).toBe(0)
    expect(s.isScheduled).toBe(false)
  })

  it('re-arms after running', () => {
    vi.useFakeTimers({ toFake: [...FAKE.toFake] })
    let runs = 0
    const s = new FrameScheduler(() => {
      runs += 1
    })
    s.request()
    vi.runAllTimers()
    s.request()
    vi.runAllTimers()
    expect(runs).toBe(2)
  })
})
