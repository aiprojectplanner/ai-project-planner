# ai-project-planner
AI-powered project planning tool with Gantt visualization.

## Local Development (Standard)

Use Vercel's local runtime so `/api/*` endpoints work the same way as production.

1. Install dependencies:
   - `npm install`
2. Create `.env.local` with required environment variables (see `.env.example`).
3. Start the app:
   - `npx vercel dev --listen 3000 --yes`
4. Open:
   - http://localhost:3000

Notes:
- Do not debug `/api/*` endpoints via the Vite dev server port (for example `http://localhost:5173`), because `/api/*` routes are not served there by default.
- `vercel dev` provides the port for the Vite dev server via `PORT`. The project dev script respects this automatically.
- `OPENROUTER_API_KEY` must be available to the serverless runtime. For local development, the serverless function loads `.env.local` automatically.

### Local Baseline Checklist (Before Debugging)
- `http://localhost:3000/` loads successfully.
- `http://localhost:3000/ai-planner` loads successfully (no 500, no pending document).
- In AI Planner, submitting an idea results in `POST /api/generate-plan` returning `200` with JSON (`projectTitle`, `timeline`).
