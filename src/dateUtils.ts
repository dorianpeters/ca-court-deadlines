import { 
  addDays as addCalendarDaysFn, 
  subDays, 
  isSaturday, 
  isSunday 
} from 'date-fns';
import { holidaySet } from './holidays.js';

/** Format a Date as `YYYY-MM-DD` in local time */
export function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns true if date is a court day (Mon–Fri and not a holiday) */
export function isCourtDay(date: Date, holidays: Set<string> = holidaySet): boolean {
  return !isSaturday(date) && !isSunday(date) && !holidays.has(toLocalIso(date));
}

/** Adjust backward to nearest court day */
export function adjustBackwardToCourtDay(date: Date, holidays: Set<string> = holidaySet): Date {
  let d: Date = date;
  while (!isCourtDay(d, holidays)) {
    d = subDays(d, 1);
  }
  return d;
}

/** Adjust forward to nearest court day */
export function adjustForwardToCourtDay(date: Date, holidays: Set<string> = holidaySet): Date {
  let d: Date = date;
  while (!isCourtDay(d, holidays)) {
    d = addCalendarDaysFn(d, 1);
  }
  return d;
}

/** Add N court days to a date (can be negative) */
export function addCourtDays(date: Date, n: number, holidays: Set<string> = holidaySet): Date {
  if (n === 0) {
    return isCourtDay(date, holidays) ? date : adjustForwardToCourtDay(date, holidays);
  }
  const step: number = n > 0 ? 1 : -1;
  let count = 0;
  let d: Date = date;
  while (count < Math.abs(n)) {
    d = addCalendarDaysFn(d, step);
    if (isCourtDay(d, holidays)) count++;
  }
  return d;
}

/** Add days either by calendar or court strategy */
export function addDays(
  date: Date, 
  n: number, 
  opts: { useCourtDays?: boolean; holidays?: Set<string> } = {}
): Date {
  const { useCourtDays = false, holidays = holidaySet } = opts;
  if (useCourtDays) return addCourtDays(date, n, holidays);
  const candidate: Date = addCalendarDaysFn(date, n);
  if (!isCourtDay(candidate, holidays)) {
    return n >= 0 
      ? adjustForwardToCourtDay(candidate, holidays) 
      : adjustBackwardToCourtDay(candidate, holidays);
  }
  return candidate;
}
