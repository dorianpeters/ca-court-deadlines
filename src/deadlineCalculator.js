// src/deadlineCalculator.js
// Pure business logic. Given a start date and an array of differentials (numbers),
// return an array of objects with the computed Date and a human-friendly label.

import { addDays, isCourtDay } from './dateUtils.js';

export function formatDescription(diff, useCourtDays) {
  if (diff === 0) return useCourtDays ? 'Selected date (adjusted to court day):' : 'Selected date:';
  if (diff > 0) return `${diff} ${useCourtDays ? 'court' : 'calendar'} days after the selected date:`;
  return `${Math.abs(diff)} ${useCourtDays ? 'court' : 'calendar'} days before the selected date:`;
}

export function calculateDeadlines(startDate, differentials = [-45, -30, -7, 0, 15, 30], useCourtDays = false, holidays) {
  // Normalize startDate to a local-date-only Date object
  const base = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  return differentials.map(diff => {
    const date = addDays(base, diff, { useCourtDays, holidays });
    return {
      diff,
      date,
      description: formatDescription(diff, useCourtDays),
      isCourtDay: isCourtDay(date, holidays)
    };
  });
}