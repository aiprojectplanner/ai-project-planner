# Feature Specifications 
 
## 1. AI Project Generator 
- **How it works**: Users enter an idea, the frontend sends it to `/api/generate-plan`, which calls OpenRouter with one or more LLMs (priority list from `OPENROUTER_MODELS` / `OPENROUTER_MODEL`), receives JSON, and the editor renders a Gantt chart. 
 
 ## 2. Project Editor 
 - **How it works**: A manual interface to add, edit, or delete tasks. Changes can be saved to Supabase. 
 
 ## 3. Dashboard 
 - **How it works**: Lists all projects saved by the authenticated user in Supabase. 
