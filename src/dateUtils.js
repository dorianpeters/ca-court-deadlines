// src/dateUtils.js
// Pure, side-effect-free helpers for manipulating dates.

import { holidaySet } from './holidays.js';

// Return an ISO date string `YYYY-MM-DD` for the local date portion of `date`.
export function toLocalIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Return a new Date (copy) normalized to the same local date as input.
export function copyDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Returns true if date is a court day (Mon–Fri and not a holiday)
export function isCourtDay(date, holidays = holidaySet) {
  const dow = date.getDay(); // 0=Sun,6=Sat
  if (dow === 0 || dow === 6) return false;
  return !holidays.has(toLocalIso(date));
}

// Adjust date backward to nearest court day (returns new Date)
export function adjustBackwardToCourtDay(inputDate, holidays = holidaySet) {
  const date = copyDate(inputDate);
  while (!isCourtDay(date, holidays)) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

// Adjust date forward to nearest court day (returns new Date)
export function adjustForwardToCourtDay(inputDate, holidays = holidaySet) {
  const date = copyDate(inputDate);
  while (!isCourtDay(date, holidays)) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

// Add N calendar days (can be negative) and return a new Date
export function addCalendarDays(inputDate, n) {
  const date = copyDate(inputDate);
  date.setDate(date.getDate() + n);
  return date;
}

// Add N court days (can be negative) and return a new Date
export function addCourtDays(inputDate, n, holidays = holidaySet) {
  if (n === 0) {
    // If inputDate is not a court day, return input adjusted forward (consistent with many rules)
    return isCourtDay(inputDate, holidays) ? copyDate(inputDate) : adjustForwardToCourtDay(inputDate, holidays);
  }

  const step = n > 0 ? 1 : -1;
  const target = Math.abs(n);
  const date = copyDate(inputDate);
  let count = 0;

  while (count < target) {
    date.setDate(date.getDate() + step);
    if (isCourtDay(date, holidays)) {
      count += 1;
    }
  }

  return date;
}

// Generic helper: add days either by calendar or court strategy
export function addDays(inputDate, n, { useCourtDays = false, holidays = holidaySet } = {}) {
  if (useCourtDays) {
    return addCourtDays(inputDate, n, holidays);
  }
  // Calendar days: after adding calendar days, if the result isn't a court day, adjust
  const candidate = addCalendarDays(inputDate, n);
  if (!isCourtDay(candidate, holidays)) {
    return n >= 0 ? adjustForwardToCourtDay(candidate, holidays) : adjustBackwardToCourtDay(candidate, holidays);
  }
  return candidate;
}