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
- Use database-generated project ids (no frontend UUID generation). 
- Insert vs update: update if `projectId` exists in store, otherwise create a new row. 
- Enforce RLS: `user_id` must match current session. 
- Enforce Free plan project-count limit at the persistence boundary before insert (`max 3` projects per user in current implementation). 
- Planned hardening: enforce the same create limit at DB policy layer (migration-first) to prevent bypass via non-UI write paths. 
 
 ## Database Tables 
 - `projects` 
 
 ## Expected Output 
 - New record in `projects` table. 
 - Updated Dashboard list. 
 
 ## Error Cases 
 - Unauthorized access (RLS violation). 
 - Project limit reached (for free tier). 
 - Database connection error. 
