import { describe, it, expect } from 'vitest';
import { 
  toLocalIso,
  isCourtDay,
  adjustBackwardToCourtDay,
  adjustForwardToCourtDay,
  addCourtDays,
  addDays
} from '../src/dateUtils.js';

const holidays = new Set(['2025-01-01']); // Example: New Year’s Day

describe('dateUtils', () => {
  it('formats to local ISO correctly', () => {
    expect(toLocalIso(new Date(2025, 0, 1))).toBe('2025-01-01');
  });

  it('detects weekends as non-court days', () => {
    expect(isCourtDay(new Date(2025, 0, 4), holidays)).toBe(false); // Saturday
    expect(isCourtDay(new Date(2025, 0, 5), holidays)).toBe(false); // Sunday
  });

  it('detects holidays as non-court days', () => {
    expect(isCourtDay(new Date(2025, 0, 1), holidays)).toBe(false); // Holiday
  });

  it('adjusts backward to nearest court day', () => {
    // 2025-01-05 is Sunday, so it should go back to Friday 2025-01-03
    const result = adjustBackwardToCourtDay(new Date(2025, 0, 5), holidays);
    expect(toLocalIso(result)).toBe('2025-01-03');
  });

  it('adjusts forward to nearest court day', () => {
    // 2025-01-04 is Saturday, so it should go forward to Monday 2025-01-06
    const result = adjustForwardToCourtDay(new Date(2025, 0, 4), holidays);
    expect(toLocalIso(result)).toBe('2025-01-06');
  });

  it('adds court days correctly', () => {
    const start = new Date(2025, 0, 2); // Thursday
    const result = addCourtDays(start, 2, holidays); // Skips weekend
    expect(toLocalIso(result)).toBe('2025-01-06');
  });

  it('adds calendar days but adjusts for court days', () => {
    const start = new Date(2025, 0, 2); // Thursday
    const result = addDays(start, 3, { useCourtDays: false, holidays }); // Lands Sunday, adjust forward
    expect(toLocalIso(result)).toBe('2025-01-06');
  });

  it('adds court days with negative numbers', () => {
    const start = new Date(2025, 0, 6); // Monday
    const result = addCourtDays(start, -1, holidays);
    expect(toLocalIso(result)).toBe('2025-01-03'); // Friday
  });
});
