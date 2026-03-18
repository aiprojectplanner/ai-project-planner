# Debug Log 
 
 This file records debugging attempts and conclusions to avoid repeated failed fixes. 
 
 ## Bug Record Template 
 
 ### Bug Description 
 Describe the issue clearly. 
 
 ### Observed Error 
 Console errors, logs, or unexpected behavior. 
 
 ### Hypothesized Root Cause 
 
 ### Attempt 1 
 What was tried. 
 
 ### Result 
 
 ### Attempt 2 
 
 ### Result 
 
 ### Attempt 3 
 
 ### Result 
 
 ### Conclusion 
 Root cause identified. 
 
 ### Final Fix 
 Describe the fix applied. 
 
 
 Rules: 
 
 - Every significant debugging attempt should be logged. 
 - If more than 5 attempts occur, stop patching and re-evaluate root cause. 
 - If more than 10 attempts occur, suspect architectural problems. 

---

## Bug #001 — Local Vercel Dev Runtime Fails (Port Detection Timeout / Serverless Crash)

### Bug Description
Local development workflow using `npx vercel dev --listen 3000 --yes` fails to reliably serve the app and `/api/*`, blocking AI Planner debugging.

### Observed Error
- Terminal:
  - `Error: Detecting port <random> timed out after 300000ms`
  - `Error: spawn EINVAL` when starting `node scripts/vite-with-port.mjs` (Windows)
- Browser / Network:
  - `GET http://localhost:3000/ai-planner` → `500 FUNCTION_INVOCATION_FAILED` (serverless crash page)
  - `GET http://localhost:3000/` pending / connection error

### Hypothesized Root Cause
Vercel Dev injects a `PORT` and expects the framework dev server (Vite) to bind to that port. If the dev server binds to a different port, Vercel cannot detect readiness and times out. On Windows, launching `vite.cmd` incorrectly can prevent the dev server from starting at all.

### Attempt 1
Collect evidence (Network + terminal logs) to confirm whether the failure is API-level or route/document-level.

### Result
Confirmed the failure was at the document layer (`/ai-planner` returning 500 or pending), not the `/api/generate-plan` fetch layer.

### Attempt 2
Standardize local workflow to `vercel dev` and update the dev script to respect the injected port.

### Result
Initial implementation hit Windows `spawn EINVAL` when starting `vite.cmd` from Node.

### Attempt 3
Adjust the Vite launcher to use a Windows-safe invocation (`cmd.exe /c call vite.cmd ...`) while still forcing `--port $PORT --strictPort`.

### Result
Vercel Dev successfully detects the dev server port and serves `http://localhost:3000/` correctly.

### Conclusion
Root cause was local runtime wiring: Vercel Dev port detection expectations + Windows process spawning behavior. This was not an application logic bug.

### Final Fix
- Make `npm run dev` respect `PORT` and start Vite with `--strictPort`.
- Use a Windows-safe launcher for `vite.cmd`.
- Keep `vercel.json` minimal during runtime failures; do not introduce routing rewrites until the runtime is stable and evidence supports it.

---

## Bug #002 — OpenRouter API Key Missing in Local Serverless Runtime

### Bug Description
AI Planner loads, but `POST /api/generate-plan` fails locally with a configuration error stating the API key is missing.

### Observed Error
- Network:
  - `POST /api/generate-plan` → `500`
  - Response JSON: `{ "error": "Server Configuration Error", "message": "API Key is missing from the server environment. Please check .env.local" }`
- Serverless logs:
  - `CRITICAL ERROR: OPENROUTER_API_KEY is undefined in process.env`

### Hypothesized Root Cause
The local serverless runtime does not have `OPENROUTER_API_KEY` in `process.env` despite `.env.local` being present, so the function fails fast.

### Attempt 1
Confirm the failure is in the API layer (not frontend parsing) by checking Network response body and serverless logs.

### Result
Confirmed: the function returns a configuration error and logs show `OPENROUTER_API_KEY` is undefined.

### Attempt 2
Load `.env.local` inside the serverless function runtime before accessing `process.env.OPENROUTER_API_KEY`.

### Result
Implemented and ready for local re-test under `vercel dev`.

### Conclusion
This was an environment/runtime configuration issue. The API key must be injected into the local serverless environment for `/api/generate-plan` to work.

### Final Fix
- Load `.env.local` (and `.env` as fallback) inside `api/generate-plan.js` using `dotenv.config(...)`.
