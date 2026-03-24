-- Refine invite code rules:
-- 1) default expiry is 3 days
-- 2) format must be 8-char alphanumeric (A-Z0-9)
-- 3) one-time redemption binds code to one account
-- 4) manual invalid/restore still via is_active

begin;

-- Ensure invite_codes table has required columns.
alter table if exists public.invite_codes
  add column if not exists redeemed_by uuid references auth.users(id),
  add column if not exists redeemed_at timestamptz;

-- Keep code normalized uppercase and enforce 8-char alphanumeric format.
update public.invite_codes
set code = upper(trim(code))
where code <> upper(trim(code));

-- Set default expiry to 3 days for newly created codes.
alter table public.invite_codes
  alter column expires_at set default (now() + interval '3 days');

-- Enforce one-account binding per code via unique redeemed_by + code uniqueness.
-- (code is already primary key; this ensures one user cannot redeem many one-time codes accidentally if needed to query relation)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invite_codes_code_format_chk'
  ) then
    alter table public.invite_codes
      add constraint invite_codes_code_format_chk
      check (code ~ '^[A-Z0-9]{8}$');
  end if;
end $$;

-- Replace redeem function with strict one-time account binding logic.
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

  if normalized_code !~ '^[A-Z0-9]{8}$' then
    return query select false, 'Invite code format is invalid.';
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

  -- Bind code to account exactly once.
  update public.invite_codes ic
  set redeemed_count = coalesce(ic.redeemed_count, 0) + 1,
      redeemed_by = current_user_id,
      redeemed_at = now()
  where ic.code = normalized_code
    and ic.is_active = true
    and (ic.expires_at is null or ic.expires_at > now())
    and coalesce(ic.redeemed_count, 0) = 0
    and ic.redeemed_by is null;

  if not found then
    -- Optional: if code already bound to this same user, treat as idempotent success.
    if exists (
      select 1
      from public.invite_codes
      where code = normalized_code
        and redeemed_by = current_user_id
    ) then
      update public.profiles
      set plan_tier = 'pro',
          updated_at = now()
      where id = current_user_id;

      return query select true, 'Invite code already bound to your account.';
      return;
    end if;

    return query select false, 'Invalid, expired, or already used invite code.';
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
