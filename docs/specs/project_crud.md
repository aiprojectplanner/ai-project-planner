# Feature: Project CRUD 
 
 ## Purpose 
 Manage the lifecycle of project plans, including creation (manual or AI), renaming, and deletion. 
 
 ## User Flow 
 1. User creates a project via Dashboard (AI or Manual). 
 2. User renames project in the Editor. 
 3. User deletes a project from the Dashboard list. 
 
 ## Inputs 
 - Project Title 
 - AI Prompt (for AI generation) 
 
 ## Processing Logic 
 - Generate unique UUID for new projects. 
 - Handle "upsert" logic: update if `id` exists, else insert. 
 - Enforce RLS: `user_id` must match current session. 
 
 ## Database Tables 
 - `projects` 
 
 ## Expected Output 
 - New record in `projects` table. 
 - Updated Dashboard list. 
 
 ## Error Cases 
 - Unauthorized access (RLS violation). 
 - Project limit reached (for free tier). 
 - Database connection error. 
