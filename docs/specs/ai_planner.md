# Feature: AI Project Generator 

## Purpose 
Automatically transform a high-level project idea into a structured task list and timeline using Generative AI. 

## User Flow 
1. User navigates to **AI Planner**. 
2. User enters a description of their project (e.g., "Build a mobile app for plant care"). 
3. User sets **quality controls** (template, optional project start date, duration, task granularity). **Free** users may only pick preset duration and preset granularity; **Pro** users may also use custom months (1–18) and custom task count (3–30).
4. User clicks **Generate Roadmap** (authenticated user only). 
5. AI generates the plan (shows a loading state). 
6. Frontend receives the plan and automatically populates the **Project Editor**. The **project start date** chosen in the planner is applied when importing tasks into the timeline.
7. User reviews and saves the plan to their dashboard. 

## Inputs 
- **Project Idea**: String (min 5 chars). 
- **Constraints (optional)**: object; the server computes effective limits from these fields (do not trust client-only `maxTasks` / `expectedTotalMonths` alone):
  - `templateKey` (string): `commercial` | `software` | `other` (legacy `ecom` / `saas` are normalized to `commercial` / `software` on the server).
  - `durationMode` (string): `lt6` | `mid` | `high` | `custom` — maps to 6 / 12 / 18 months or custom (Pro only for `custom`).
  - `customMonths` (number, 1..18): used when `durationMode === 'custom'` (Pro only).
  - `granularityMode` (string): `coarse` | `fine` | `custom` — maps to max tasks (9 / 19) or custom count (Pro only for `custom`).
  - `customTaskCount` (number, 3..30): used when `granularityMode === 'custom'` (Pro only).
  - `projectStartDate` (string, `YYYY-MM-DD`): anchors the imported Gantt dates in the editor.

## Processing Logic 
- **Frontend**: Sends a POST request to `/api/generate-plan`. 
- **Backend (Vercel API)**: 
  - Receives the idea. 
  - Authenticates the user and reads `profiles.plan_tier` (`free` | `pro`).
  - Resolves constraints: free users may not use `custom` duration or granularity; Pro users may.
  - Builds a single user prompt that requires JSON-only output with the expected schema, and includes hard quality constraints (max months, max tasks, sequential starts). Optional project start date is included as context.
  - Calls **OpenRouter** using a **priority-ordered model list** from environment variables: `OPENROUTER_MODELS` (comma-separated, first = highest priority). If unset, falls back to `OPENROUTER_MODEL`, then to a code default. 
  - On HTTP errors that may be transient or region-related (for example `403`, `429`, `5xx`), the server **tries the next model** in the list. Authentication failures (`401`) do not trigger failover. 
  - Extracts the first JSON object from the model text (minimal parsing). 
  - After parsing, runs a server-side normalization step:
    - clamps/filters tasks into allowed ranges
    - keeps at most `maxTasks` tasks (up to 30)
    - repacks tasks sequentially from week `0` so the total length does not exceed the month-to-week converted duration.
  - Returns a structured JSON object on success. 
- **Access gate (server-side)**:
   - Requires a valid Supabase access token in `Authorization: Bearer <token>`.
   - Validates token via Supabase Auth.
   - Free and Pro users may call the endpoint; **custom** constraint options are rejected server-side for free users (`403`).
- **Frontend**: Sends bearer token, uses the JSON body as the plan, passes `projectStartDate` into `importPlan`, and updates the `projectStore` (see `AIPlanner.jsx`). 

## Database Tables 
- `projects` (persisted only when user clicks "Save" in the Editor). 

## Expected Output 
- A JSON object containing: 
  - `projectTitle`: Suggested title. 
  - `timeline`: Array of tasks with `task`, `start` (week), and `duration` (weeks). 

## Error Cases 
- **Empty Input**: Error message "Project idea is required". 
- **AI Error**: `AI Service Error` if OpenRouter returns a non-retryable error or a retryable error on the last model in the list. 
- **All models failed**: HTTP `502` with `All configured models failed or returned unusable output` (includes `lastAttempt` for debugging). 
- **Invalid JSON / empty content**: The server may try the next configured model; if all models fail extraction or parsing, the request ends with the `502` above. 
- **Unauthorized**: HTTP `401` when auth token is missing/invalid. 
- **Custom options on Free**: HTTP `403` when a free user sends `custom` duration or granularity.
- **Upgrade required** message when free user attempts custom options.
