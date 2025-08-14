import { describe, it, expect } from 'vitest';
import { calculateDeadlines, formatDescription } from '../src/deadlineCalculator.ts';
import { toLocalIso } from '../src/dateUtils.ts';

const holidays = new Set(['2025-01-01']);

describe('deadlineCalculator', () => {
  it('formats description correctly', () => {
    const dummyDate = new Date(2025, 0, 2);
    expect(formatDescription(0, true, dummyDate, dummyDate)).toContain('court day');
    expect(formatDescription(0, false, dummyDate, dummyDate)).toContain('Selected date');
    expect(formatDescription(5, true, dummyDate, dummyDate)).toContain('court days after');
    expect(formatDescription(-3, false, dummyDate, dummyDate)).toContain('calendar days before');
  });

  it('calculates deadlines with court days', () => {
    const start = new Date(2025, 0, 2); // Thursday
    const results = calculateDeadlines(start, [-1, 0, 1], true, holidays);
    expect(results[0].description).toContain('before');
    expect(toLocalIso(results[0].date)).toBe('2024-12-31'); // Adjusts for holiday on Jan 1
    expect(results[1].isCourtDay).toBe(true);
  });

  it('calculates deadlines with calendar days', () => {
    const start = new Date(2025, 0, 2); // Thursday
    const results = calculateDeadlines(start, [3], false, holidays);
    expect(toLocalIso(results[0].date)).toBe('2025-01-06'); // Skips weekend
  });
});
