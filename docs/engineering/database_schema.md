# Database Schema 
 
 ## Tables 
 
 ### projects 
 - `id`: UUID (Primary Key) 
 - `user_id`: UUID (Foreign Key to auth.users) 
 - `title`: Text 
 - `tasks`: JSONB 
 - `created_at`: Timestamp 
 - `updated_at`: Timestamp 
 
 ## RLS Policies 
 - **Manage own projects**: Users can only read, insert, update, and delete their own projects where `auth.uid() = user_id`. 

## Migration Notes
- Proposed migration: `supabase/migrations/20260324_enforce_free_project_limit.sql`
- Purpose: enforce Free-plan create limit (`max 3` projects per user) at DB policy layer for `INSERT` on `projects`.
- Function introduced: `public.can_create_project_for_user(target_user_id uuid)` (used by insert policy `with check`).
- This migration is non-destructive and does not alter existing project rows.
