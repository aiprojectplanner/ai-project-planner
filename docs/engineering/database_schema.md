# Database Schema 
 
 ## Tables 
 
 ### projects 
 - `id`: UUID (Primary Key) 
 - `user_id`: UUID (Foreign Key to auth.users) 
 - `title`: Text 
 - `tasks`: JSONB 
 - `created_at`: Timestamp 
 - `updated_at`: Timestamp 

### profiles
- `id`: UUID (Primary Key, references `auth.users.id`)
- `email`: Text
- `plan_tier`: Text (`free` or `pro`, default `free`)
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

### invite_codes
- `code`: Text (Primary Key)
- `is_active`: Boolean
- `max_redemptions`: Integer
- `redeemed_count`: Integer
- `redeemed_by`: UUID (nullable, references `auth.users.id`)
- `redeemed_at`: Timestamp with timezone (nullable)
- `expires_at`: Timestamp with timezone (nullable)
- `created_at`: Timestamp with timezone
 
 ## RLS Policies 
 - **Manage own projects**: Users can only read, insert, update, and delete their own projects where `auth.uid() = user_id`. 
- **Manage own profile**: Users can read/update their own `profiles` row where `auth.uid() = id`.

## Migration Notes
- Proposed migration: `supabase/migrations/20260324_enforce_free_project_limit.sql`
- Purpose: enforce Free-plan create limit (`max 3` projects per user) at DB policy layer for `INSERT` on `projects`.
- Function introduced: `public.can_create_project_for_user(target_user_id uuid)` (used by insert policy `with check`).
- This migration is non-destructive and does not alter existing project rows.
- Proposed migration: `supabase/migrations/20260324_add_profiles_plan_tier.sql`
- Purpose: add `profiles` table with `plan_tier`, RLS policies, signup trigger, and backfill for existing users.
- Proposed migration: `supabase/migrations/20260324_invite_code_pro_access.sql`
- Purpose: add invite-code redemption flow, lock down direct profile plan escalation, and provide secure `redeem_invite_code` RPC.
- Proposed migration: `supabase/migrations/20260324_refine_invite_code_rules.sql`
- Purpose: enforce 8-char alphanumeric format, 3-day default expiry, and one-time account binding for invite codes.
