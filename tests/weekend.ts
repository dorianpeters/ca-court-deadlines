import { holidaySet } from '../src/holidays.ts';

// Function to check if a date string falls on a weekend
function isWeekend(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

// Iterate through the holidaySet and print dates that fall on weekends
holidaySet.forEach((dateString) => {
  if (isWeekend(dateString)) {
    console.log(dateString);
  }
});
