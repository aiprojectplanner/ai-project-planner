# Bug History
 
This file records important bugs encountered during development.
 
Purpose:
- Prevent repeated debugging of the same issues
- Document root causes and fixes
- Help AI assistants learn from past bugs
 
Rules:
1. Each bug must have a unique ID (Bug #001, Bug #002, etc.)
2. Each entry must include:
   - Date
   - Symptom
   - Root Cause
   - Fix
   - Affected Files
   - Lesson
3. New bugs must always be appended at the end of the file.
4. AI assistants should check this file before debugging similar issues.
 
---

## Bug #001 — Vercel Dev Local Runtime Fails (Port Detection Timeout / Serverless Crash)

### Date
2026-03-17

### Symptom
- Running `npx vercel dev --listen 3000 --yes` intermittently fails.
- Vercel CLI error after ~5 minutes: `Detecting port <random> timed out after 300000ms`.
- Browser may show:
  - `http://localhost:3000/ai-planner` returns `500 FUNCTION_INVOCATION_FAILED` (serverless crash page), or
  - `http://localhost:3000/` never loads (connection error / pending document).

### Root Cause
- **Primary**: Vercel Dev assigns a dynamic port to the framework dev server via `PORT` and expects the dev server to listen on that port. The project `npm run dev` previously started Vite on a fixed port (5173), so Vercel never detected the expected port and timed out.
- **Secondary**: On Windows, spawning Vite via a `.cmd` entry point can fail with `spawn EINVAL` if executed incorrectly from Node. This prevented the dev server from starting under the requested port.
- **Contributing (avoid in future)**: Attempting to “fix” SPA routing at the Vercel config level (rewrites/routes) without first stabilizing the dev runtime can introduce new failure modes and hide the primary issue.

### Fix
- Standardize local development for `/api/*` on `npx vercel dev --listen 3000 --yes`.
- Update the dev script to respect `PORT` so Vite binds to the port Vercel expects.
- Implement a Windows-safe launcher for Vite (`cmd.exe /c call vite.cmd ...`) to avoid `spawn EINVAL`.
- Keep `vercel.json` minimal during debugging; do not introduce rewrites/routes unless the runtime is stable and evidence proves routing is the root cause.

### Affected Files
- `scripts/vite-with-port.mjs`
- `package.json` (dev script)
- `README.md` (local workflow documentation)
- `docs/ai-governance/AI_SYSTEM_CONTEXT.md` (local standard documented)
- `vercel.json` (kept minimal; avoid risky rewrites during runtime failures)

### Lesson
- Before debugging any feature, first verify the local runtime is healthy:
  - `http://localhost:3000/` loads,
  - SPA routes load (e.g., `/ai-planner`),
  - only then debug `/api/*` behavior.
- Treat “port detection timeout” as a **local runtime wiring** issue, not an application logic bug.
- Avoid configuration churn (rewrites/proxies) until primary evidence is collected (Network + terminal logs).

## Bug #002 — OpenRouter API Key Missing in Local Serverless Runtime

### Date
2026-03-17

### Symptom
- AI Planner page loads normally under `http://localhost:3000/ai-planner`.
- Clicking “Generate Roadmap” triggers `POST /api/generate-plan` and returns `500`.
- Response body:
  - `error: "Server Configuration Error"`
  - `message: "API Key is missing from the server environment. Please check .env.local"`
- Serverless logs show:
  - `CRITICAL ERROR: OPENROUTER_API_KEY is undefined in process.env`

### Root Cause
- The serverless runtime did not have `OPENROUTER_API_KEY` available in `process.env` during local development, even though `.env.local` exists.
- Without the key, the function correctly aborts with a 500 configuration error.

### Fix
- Load environment variables from `.env.local` (and `.env` as a fallback) inside the serverless function runtime before reading `process.env.OPENROUTER_API_KEY`.
- Keep the validation strict so missing keys fail fast with a clear error message.

### Affected Files
- `api/generate-plan.js`
- `.env.local`
- `README.md`

### Lesson
- Treat `OPENROUTER_API_KEY missing` as an environment/runtime configuration issue first, not an AI logic or frontend bug.
- Always verify `/api/generate-plan` returns `200` with JSON before diagnosing plan parsing or store import behavior.
 
## Bug Template
 
### Date
 
### Symptom
 
### Root Cause
 
### Fix
 
### Affected Files
 
### Lesson
