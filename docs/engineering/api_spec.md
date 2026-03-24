# API Specification 
 
 ## Endpoints 
 
 ### POST /api/generate-plan 
 - **Description**: Generates a project plan based on a user's idea. 
 - **Input**: `{ "idea": "string" }` 
 - **Output**: Structured JSON containing project tasks and timeline. 
- **Auth requirement**: Requires `Authorization: Bearer <supabase_access_token>`.
- **Pro access gate**: Only users in `PRO_USER_EMAILS` (comma-separated env allowlist) are authorized to use this endpoint.
 - **Model selection (server)**: The server calls OpenRouter with one or more models from environment variables, in priority order:
   - `OPENROUTER_MODELS`: comma-separated OpenRouter model IDs (highest priority first). On failure (for example region restrictions, rate limits, or upstream errors), the server tries the next model.
   - If `OPENROUTER_MODELS` is unset or empty, `OPENROUTER_MODEL` is used as a single-model fallback.
   - If both are unset, a default model ID is used (see `api/generate-plan.js`).
 - **Errors**: If every configured model fails or returns output that cannot be parsed as the required JSON shape, the handler responds with `502` and an `lastAttempt` payload for debugging. 
