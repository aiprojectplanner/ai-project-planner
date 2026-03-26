# API Specification 
 
 ## Endpoints 
 
 ### POST /api/generate-plan 
 - **Description**: Generates a project plan based on a user's idea. 
- **Input**: `{ "idea": "string", "constraints"?: { "templateKey"?: "commercial"|"software"|"other", "durationMode"?: "lt6"|"mid"|"high"|"custom", "customMonths"?: number, "granularityMode"?: "coarse"|"fine"|"custom", "customTaskCount"?: number, "projectStartDate"?: "YYYY-MM-DD" } }`  
  The server recomputes effective duration and max task count from these fields. **Free** users may only use preset `durationMode` and `granularityMode` (not `custom`). **Pro** users may use `custom` months (1–18) and custom task count (3–30).
 - **Output**: Structured JSON containing project tasks and timeline. 
- **Auth requirement**: Requires `Authorization: Bearer <supabase_access_token>`.
- **Plan behavior**: Free and Pro may call this endpoint; custom options are enforced server-side from `profiles.plan_tier`.
 - **Model selection (server)**: The server calls OpenRouter with one or more models from environment variables, in priority order:
   - `OPENROUTER_MODELS`: comma-separated OpenRouter model IDs (highest priority first). On failure (for example region restrictions, rate limits, or upstream errors), the server tries the next model.
   - If `OPENROUTER_MODELS` is unset or empty, `OPENROUTER_MODEL` is used as a single-model fallback.
   - If both are unset, a default model ID is used (see `api/generate-plan.js`).
 - **Errors**: If every configured model fails or returns output that cannot be parsed as the required JSON shape, the handler responds with `502` and an `lastAttempt` payload for debugging. 
