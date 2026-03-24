-- Enforce Free-plan project limit at the database policy layer.
-- Scope: projects table insert policy only (non-destructive).
--
-- Behavior:
-- - Authenticated users can insert into projects only when:
--   1) auth.uid() = user_id
--   2) current project count for this user is less than 3
--
-- Notes:
-- - This migration does not modify existing rows.
-- - Update/Delete policies are not changed here.

begin;

create or replace function public.can_create_project_for_user(target_user_id uuid)
returns boolean
language sql
stable
as $$
  select
    auth.uid() = target_user_id
    and (
      select count(*)
      from public.projects p
      where p.user_id = target_user_id
    ) < 3;
$$;

do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'projects'
      and policyname = 'insert_own_projects'
  ) then
    execute 'drop policy "insert_own_projects" on public.projects';
  end if;
end $$;

create policy "insert_own_projects"
on public.projects
for insert
to authenticated
with check (public.can_create_project_for_user(user_id));

commit;
