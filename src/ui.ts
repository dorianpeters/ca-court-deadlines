import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { holidaySet } from './holidays.js';
import { calculateDeadlines } from './deadlineCalculator.js';
import type { Deadline } from './deadlineCalculator.js';

// Grab DOM elements with explicit types
const dateInput = document.getElementById('dateInput') as HTMLInputElement;
const toggle = document.getElementById('calculationModeToggle') as HTMLInputElement;
const deadlinesContainer = document.getElementById('deadlinesContainer') as HTMLDivElement;
const customInput = document.getElementById('customDeadlines') as HTMLInputElement;
const updateButton = document.getElementById('updateCustomDeadlines') as HTMLButtonElement;
const toggleInstructions = document.getElementById('toggleInstructions') as HTMLAnchorElement;
const instructionsContent = document.getElementById('instructionsContent') as HTMLDivElement;

let lastTrialDate: Date = new Date();
let useCourtDays: boolean = toggle.checked;

const dateFormatter = new Intl.DateTimeFormat('en-US', { 
  weekday: 'long', 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
});

// Initialize date picker with fully typed options
const fpOptions = {
  dateFormat: 'l, F d, Y',
  defaultDate: lastTrialDate,
  onChange: (selectedDates: Date[]) => {
    if (selectedDates[0]) {
      lastTrialDate = selectedDates[0];
      renderDeadlines();
    }
  }
};

flatpickr(dateInput, fpOptions);

toggle.addEventListener('change', (): void => {
  useCourtDays = toggle.checked;
  renderDeadlines();
});

function parseDifferentials(input: string): number[] | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  return trimmed
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter((n): n is number => !Number.isNaN(n));
}

function renderDeadlines(): void {
  const diffs = parseDifferentials(customInput.value);
  const results: Deadline[] = calculateDeadlines(lastTrialDate, diffs, useCourtDays, holidaySet);

  deadlinesContainer.classList.toggle('court-mode', useCourtDays);
  deadlinesContainer.classList.toggle('calendar-mode', !useCourtDays);
  
  deadlinesContainer.innerHTML = results
    .map(r => `<h3>${r.description} <span class="deadlines">${dateFormatter.format(r.date)}</span></h3>`)
    .join('\n');
}

updateButton.addEventListener('click', (): void => renderDeadlines());

toggleInstructions.addEventListener('click', (event): void => {
  // Prevent the link from navigating
  event.preventDefault(); 
  
  const isHidden = instructionsContent.style.display === 'none';
  if (isHidden) {
    instructionsContent.style.display = 'block';
    toggleInstructions.textContent = 'Hide Instructions';
  } else {
    instructionsContent.style.display = 'none';
    toggleInstructions.textContent = 'Show Instructions';
  }
});

// Initial render
renderDeadlines();
