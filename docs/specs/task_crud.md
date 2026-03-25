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
- In Project Editor Gantt view, users can drag task bars to adjust schedule:
  - Drag bar body to move task (shift start/end together).
  - Drag left edge to change start date.
  - Drag right edge to change end date.
  - Date fields in task table update in real time to match drag result.
  - Dragging uses natural calendar days (no weekend-only or holiday calendar logic in the current product).
  - During dragging, a floating hint shows task name and current start/end dates.
- Deferred (not implemented): optional "exclude non-working days" / workweek alignment toggle for task dates and Gantt drags.
 
 ## Database Tables 
 - `projects` (tasks are stored in the `tasks` JSONB column) 
 
 ## Expected Output 
 - Updated Gantt chart visualization. 
- Successful persistence to Supabase via insert/update on save. 
- Drag operations in Gantt and date edits in table remain synchronized.
 
 ## Error Cases 
 - Invalid date range. 
 - Empty task name. 
 - Database persistence failure. 
