import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime } from './date'

describe('date helpers', () => {
  it('formats ISO date without timezone shift', () => {
    expect(formatDate('2026-11-01')).toBe('01/11/2026')
    expect(formatDate('2026-01-05')).toBe('05/01/2026')
    expect(formatDate('2026-11-01T00:00:00Z')).toBe('01/11/2026')
  })
  it('is stable in any timezone (run also with TZ=America/Los_Angeles and TZ=Pacific/Auckland)', () => {
    {
      expect(formatDate('2026-11-01')).toBe('01/11/2026')
    }
  })
  it('formats datetime 24h', () => {
    const ts = Date.UTC(2026, 10, 1, 21, 54) / 1000
    expect(formatDateTime(ts, 'Europe/Rome')).toBe('01/11/2026 22:54')
    expect(formatDateTime(ts, 'America/Los_Angeles')).toBe('01/11/2026 13:54')
    expect(formatDateTime(ts, 'UTC')).toBe('01/11/2026 21:54')
  })
})
