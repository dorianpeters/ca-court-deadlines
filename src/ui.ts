import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { holidaySet } from './holidays.ts';
import { calculateDeadlines, Deadline } from './deadlineCalculator.ts';

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

  // Split on commas or whitespace (one or more). This allows: "1,2 3, 4" etc.
  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  // Limit the number of separate integer values to 250
  if (tokens.length > 250) return undefined;
  const results: number[] = [];

  for (const t of tokens) {
    // Accept only integer strings (no floats, no stray characters)
    if (!/^[-+]?\d+$/.test(t)) return undefined;
    const n = Number(t);
    // Enforce bounds: must be within -1000..1000 inclusive
    if (n < -1000 || n > 1000) return undefined;
    results.push(n);
  }

  return results;
}

function renderDeadlines(): void {
  const diffs = parseDifferentials(customInput.value);

  // If the user entered something but parsing failed, show an error and abort.
  if (diffs === undefined && customInput.value.trim()) {
    deadlinesContainer.classList.remove('court-mode', 'calendar-mode');
    deadlinesContainer.innerHTML = `
      <p class="error">Invalid input. Enter integers between -1000 and 1000, separated by spaces or commas (e.g. -45, -30  -7 0 15 30).</p>
    `;
    return;
  }

  const results: Deadline[] = calculateDeadlines(lastTrialDate, diffs ?? [], useCourtDays, holidaySet);

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
