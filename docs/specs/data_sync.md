# Feature: Data Sync 
 
 ## Purpose 
 Ensure that the local application state (Zustand) and the remote database (Supabase) are always in sync. 
 
 ## User Flow 
 1. User makes a change in the Editor. 
 2. User clicks "Save Project". 
 3. System persists the current project state to Supabase. 
 
 ## Inputs 
 - Current Zustand store state (`projectStore`) 
 
 ## Processing Logic 
- **Manual save only**: Local edits update Zustand immediately; remote persistence happens only on explicit save. 
- **Insert vs Update**: If `projectId` exists, update the existing `projects` row; otherwise insert a new row. 
- **No conflict resolution**: There is currently no cross-device merge or conflict detection logic. 
 
 ## Database Tables 
 - `projects` 
 
 ## Expected Output 
 - Database reflects the latest frontend state. 
 - Success/Failure toast notifications. 
 
 ## Error Cases 
 - Network interruption during sync. 
 - JSON serialization error. 
 
 ## Future Improvement 
 - Add conflict detection and resolution (e.g., `updated_at`-based checks, last-write-wins policy, or merge UI). 
 - Add optional auto-save with debounce and clear user feedback. 
