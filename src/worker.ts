
import { calculateDeadlines } from './deadlineCalculator';
import { holidaySet } from './holidays';

export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ASSETS: any; // Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets for non-API requests
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === '/api/calculate' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const startDate = new Date(body.startDate);
        const differentials = body.differentials;
        const useCourtDays = body.useCourtDays;

        if (isNaN(startDate.getTime()) || !Array.isArray(differentials)) {
          return new Response("Invalid input", { status: 400 });
        }

        const deadlines = calculateDeadlines(startDate, differentials, useCourtDays, holidaySet);

        // serialize dates back to string so they can be JSON stringified safely if they aren't already
        // (calculateDeadlines returns Date objects, JSON.stringify handles them as ISO strings automatically)
        return new Response(JSON.stringify(deadlines), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response("Error processing request", { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
