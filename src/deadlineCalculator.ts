import { addDays, isCourtDay, toLocalIso } from './dateUtils.ts';

export interface Deadline {
  diff: number;
  date: Date;
  description: string;
  isCourtDay: boolean;
}

/** Generate the description text for a given deadline diff */
export function formatDescription(
  diff: number,
  useCourtDays: boolean,
  originalDate: Date,
  finalDate: Date
): string {
  const adjusted = toLocalIso(originalDate) !== toLocalIso(finalDate);

  if (diff === 0) {
    if (adjusted) {
      return 'Selected date (adjusted to court day):';
    }
    return 'Selected date:';
  }

  const direction = diff > 0 ? 'after' : 'before';
  const type = useCourtDays ? 'court' : 'calendar';
  return `${Math.abs(diff)} ${type} days ${direction} the selected date:`;
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
      description: formatDescription(diff, useCourtDays, startDate, date),
      isCourtDay: isCourtDay(date, holidays)
    };
  });
}
