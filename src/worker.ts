import { Hono } from 'hono';
import { calculateDeadlines } from './deadlineCalculator';
import { holidaySet } from './holidays';

export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ASSETS: any; // Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/calculate', async (c) => {
  try {
    const body = await c.req.json();
    const startDate = new Date(body.startDate);
    const differentials = body.differentials;
    const useCourtDays = body.useCourtDays;

    if (isNaN(startDate.getTime()) || !Array.isArray(differentials)) {
      return c.text("Invalid input", 400);
    }

    const deadlines = calculateDeadlines(startDate, differentials, useCourtDays, holidaySet);

    // serialize dates back to string so they can be JSON stringified safely if they aren't already
    // (calculateDeadlines returns Date objects, JSON.stringify handles them as ISO strings automatically)
    return c.json(deadlines);
  } catch (e) {
    return c.text("Error processing request", 500);
  }
});

// Fallback to static assets
app.get('*', (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
