-- Temporary Pro access via invite codes (manual distribution).
-- This migration adds a secure redemption path and prevents client-side direct plan escalation.

begin;

create table if not exists public.invite_codes (
  code text primary key,
  is_active boolean not null default true,
  max_redemptions integer not null default 1 check (max_redemptions > 0),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invite_codes'
      and policyname = 'deny_all_invite_codes'
  ) then
    create policy "deny_all_invite_codes"
      on public.invite_codes
      for all
      to authenticated
      using (false)
      with check (false);
  end if;
end $$;

-- Remove direct profile updates by authenticated clients (prevents self-upgrade to pro).
drop policy if exists "update_own_profile" on public.profiles;

create or replace function public.redeem_invite_code(input_code text)
returns table(ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text;
  current_user_id uuid;
  current_tier text;
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    return query select false, 'Unauthorized.';
    return;
  end if;

  normalized_code := upper(trim(input_code));
  if normalized_code = '' then
    return query select false, 'Invite code is required.';
    return;
  end if;

  select plan_tier
  into current_tier
  from public.profiles
  where id = current_user_id;

  if current_tier is null then
    return query select false, 'Profile not found.';
    return;
  end if;

  if current_tier = 'pro' then
    return query select true, 'You already have Pro access.';
    return;
  end if;

  update public.invite_codes ic
  set redeemed_count = ic.redeemed_count + 1
  where ic.code = normalized_code
    and ic.is_active = true
    and (ic.expires_at is null or ic.expires_at > now())
    and ic.redeemed_count < ic.max_redemptions;

  if not found then
    return query select false, 'Invalid or expired invite code.';
    return;
  end if;

  update public.profiles
  set plan_tier = 'pro',
      updated_at = now()
  where id = current_user_id;

  return query select true, 'Invite code redeemed. Pro access enabled.';
end;
$$;

grant execute on function public.redeem_invite_code(text) to authenticated;

commit;
