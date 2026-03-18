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
   - Constructs a System Prompt (Project Management Expert) and User Prompt. 
   - Calls **OpenRouter** (targeting `google/gemini-2.5-flash`). 
   - Forces JSON output. 
   - Cleans the response (removes markdown fences). 
   - Returns a structured JSON object. 
 - **Frontend**: Parses the JSON and updates the `projectStore`. 
 
 ## Database Tables 
 - `projects` (persisted only when user clicks "Save" in the Editor). 
 
 ## Expected Output 
 - A JSON object containing: 
   - `projectTitle`: Suggested title. 
   - `timeline`: Array of tasks with `task`, `start` (week), and `duration` (weeks). 
 
 ## Error Cases 
 - **Empty Input**: Error message "Project idea is required". 
 - **AI Error**: "AI Service Error" if OpenRouter fails. 
 - **Invalid JSON**: "Model did not return valid JSON" if parsing fails. 
 - **Empty Content**: "Model returned empty content". 
