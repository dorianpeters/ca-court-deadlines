import { addDays, isCourtDay } from './dateUtils.js';

export interface Deadline {
  diff: number;
  date: Date;
  description: string;
  isCourtDay: boolean;
}

/** Generate the description text for a given deadline diff */
export function formatDescription(diff: number, useCourtDays: boolean): string {
  if (diff === 0) {
    return useCourtDays 
      ? 'Selected date (adjusted to court day):' 
      : 'Selected date:';
  }
  if (diff > 0) {
    return `${diff} ${useCourtDays ? 'court' : 'calendar'} days after the selected date:`;
  }
  return `${Math.abs(diff)} ${useCourtDays ? 'court' : 'calendar'} days before the selected date:`;
}

/** Calculate deadlines given a start date and list of differentials */
export function calculateDeadlines(
  startDate: Date,
  differentials: number[] = [-45, -30, -7, 0, 15, 30],
  useCourtDays = false,
  holidays?: Set<string>
): Deadline[] {
  return differentials.map((diff: number) => {
    const date: Date = addDays(startDate, diff, { useCourtDays, holidays });
    return {
      diff,
      date,
      description: formatDescription(diff, useCourtDays),
      isCourtDay: isCourtDay(date, holidays)
    };
  });
}
