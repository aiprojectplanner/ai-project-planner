# Feature: Task CRUD 
 
 ## Purpose 
 Enable users to manually create, read, update, and delete individual tasks within a project roadmap. 
 
 ## User Flow 
 1. User opens a project in the Editor. 
 2. User clicks "Add Task" or edits an existing task row. 
 3. User modifies task name, start date, or end date. 
 4. User clicks "Save Project". 
 
 ## Inputs 
 - Task Name (String) 
 - Start Date (ISO Date) 
 - End Date (ISO Date) 
- Dependencies (Optional, reserved for future use) 
 
 ## Processing Logic 
 - Calculate task duration (days) based on start and end dates. 
 - Ensure end date is not before start date (UI will auto-adjust). 
 - Update the local state (Zustand) and Gantt visualization immediately. 
 - Manual save required to persist to Supabase. 
- Dependency fields may be stored with the task data, but dependency-based scheduling is not applied yet. 
 
 ## Database Tables 
 - `projects` (tasks are stored in the `tasks` JSONB column) 
 
 ## Expected Output 
 - Updated Gantt chart visualization. 
- Successful persistence to Supabase via insert/update on save. 
 
 ## Error Cases 
 - Invalid date range. 
 - Empty task name. 
 - Database persistence failure. 
