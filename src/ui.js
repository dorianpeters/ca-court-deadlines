/ src/ui.js
// Wire the UI to the calculator. This file is the single place that manipulates the DOM.

import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { holidaySet } from './holidays.js';
import { calculateDeadlines } from './deadlineCalculator.js';

const dateInput = document.getElementById('dateInput');
const toggle = document.getElementById('calculationModeToggle');
const deadlinesContainer = document.getElementById('deadlinesContainer');
const customInput = document.getElementById('customDeadlines');
const updateButton = document.getElementById('updateCustomDeadlines');

let lastTrialDate = new Date();
let useCourtDays = toggle.checked;

// Intl formatter reused (better perf)
const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// Initialize datepicker
flatpickr(dateInput, {
  dateFormat: 'l, F d, Y',
  defaultDate: lastTrialDate,
  onChange: (selectedDates) => {
    if (selectedDates && selectedDates[0]) {
      lastTrialDate = selectedDates[0];
      renderDeadlines();
    }
  }
});

// Toggle listener
toggle.addEventListener('change', () => {
  useCourtDays = toggle.checked;
  renderDeadlines();
});

function parseDifferentials(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return undefined; // let calculator use defaults
  return trimmed.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
}

function renderDeadlines() {
  const diffs = parseDifferentials(customInput.value);
  const results = calculateDeadlines(lastTrialDate, diffs, useCourtDays, holidaySet);

  // Build HTML
  const html = results.map(r => {
    const formatted = dateFormatter.format(r.date);
    return `<h3>${r.description} <span class="deadlines">${formatted}</span></h3>`;
  }).join('\n');

  deadlinesContainer.innerHTML = html;
}

updateButton.addEventListener('click', () => renderDeadlines());

// Initial render
renderDeadlines();