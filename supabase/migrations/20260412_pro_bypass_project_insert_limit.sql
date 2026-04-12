-- Pro users: bypass the 3-project insert cap enforced by can_create_project_for_user.
-- Keeps Free at max 3 projects; aligns RLS with profiles.plan_tier and client logic.

begin;

create or replace function public.can_create_project_for_user(target_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select
    auth.uid() = target_user_id
    and (
      coalesce(
        (select p.plan_tier from public.profiles p where p.id = target_user_id),
        'free'
      ) = 'pro'
      or (
        select count(*)::int
        from public.projects pr
        where pr.user_id = target_user_id
      ) < 3
    );
$$;

commit;
