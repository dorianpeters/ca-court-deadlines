import { toLocalIso } from './dateUtils.ts';
import { formatDescription } from './deadlineCalculator.ts';

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

// Initialize date picker to today
dateInput.value = toLocalIso(lastTrialDate);

dateInput.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.value) {
    // Note: The HTML native date picker returns 'YYYY-MM-DD'
    // This parses as UTC midnight. We add T12:00:00Z to prevent off-by-one errors in timezone conversions
    lastTrialDate = new Date(`${target.value}T12:00:00Z`);
  }
});

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

async function renderDeadlines(): Promise<void> {
  const diffs = parseDifferentials(customInput.value);

  // If the user entered something but parsing failed, show an error and abort.
  if (diffs === undefined && customInput.value.trim()) {
    deadlinesContainer.classList.remove('court-mode', 'calendar-mode');
    deadlinesContainer.innerHTML = `
      <p class="error">Invalid input. Enter integers between -1000 and 1000, separated by spaces or commas (e.g. -45, -30  -7 0 15 30).</p>
    `;
    return;
  }

  // If parsing succeeded but resulted in an empty array, clear display and abort.
  if (!diffs || diffs.length === 0) {
    deadlinesContainer.innerHTML = '';
    return;
  }

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: toLocalIso(lastTrialDate),
        differentials: diffs,
        useCourtDays
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    // The worker returns a minified array of [differential, date_iso_string]
    const result: [number, string][] = await response.json();

    deadlinesContainer.classList.toggle('court-mode', useCourtDays);
    deadlinesContainer.classList.toggle('calendar-mode', !useCourtDays);

    // Convert minimal dictionary mappings into rich HTML using formatDescription
    const htmlRows = result.map(([diff, dateStr]) => {
      // Construct Date objects safely in local time to pass to formatDescription
      const startD = new Date(`${toLocalIso(lastTrialDate).substring(0, 10)}T12:00:00Z`); // Use the actual start date for description
      const finalD = new Date(`${dateStr}T12:00:00Z`);

      const desc = formatDescription(diff, useCourtDays, startD, finalD);
      const formattedDate = dateFormatter.format(finalD);

      return `<h3>${desc} <span class="deadlines">${formattedDate}</span></h3>`;
    });

    deadlinesContainer.innerHTML = htmlRows.join('\n');

  } catch (error) {
    console.error('Error fetching deadlines:', error);
    deadlinesContainer.innerHTML = `<p class="error">Error calculating deadlines. Please try again.</p>`;
  }
}

updateButton.addEventListener('click', (): void => { renderDeadlines(); });

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

// Initial render not called. Wait for button click.
