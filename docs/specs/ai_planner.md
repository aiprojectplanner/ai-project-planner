# Feature: AI Project Generator 
 
 ## Purpose 
 Automatically transform a high-level project idea into a structured task list and timeline using Generative AI. 
 
 ## User Flow 
 1. User navigates to **AI Planner**. 
 2. User enters a description of their project (e.g., "Build a mobile app for plant care"). 
 3. User clicks **Generate Roadmap**. 
 4. AI generates the plan (shows a loading state). 
 5. Frontend receives the plan and automatically populates the **Project Editor**. 
 6. User reviews and saves the plan to their dashboard. 
 
 ## Inputs 
 - **Project Idea**: String (min 5 chars). 
 
## Processing Logic 
- **Frontend**: Sends a POST request to `/api/generate-plan`. 
- **Backend (Vercel API)**: 
   - Receives the idea. 
   - Builds a single user prompt that requires JSON-only output with the expected schema. 
   - Calls **OpenRouter** using a **priority-ordered model list** from environment variables: `OPENROUTER_MODELS` (comma-separated, first = highest priority). If unset, falls back to `OPENROUTER_MODEL`, then to a code default. 
   - On HTTP errors that may be transient or region-related (for example `403`, `429`, `5xx`), the server **tries the next model** in the list. Authentication failures (`401`) do not trigger failover. 
   - Extracts the first JSON object from the model text (minimal parsing). 
   - Returns a structured JSON object on success. 
- **Frontend**: Uses the JSON body as the plan and updates the `projectStore` (see `AIPlanner.jsx`). 
 
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
