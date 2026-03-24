# Feature: Pricing & Billing Entry

## Status
MVP invite-only implementation (manual Pro invite codes).

## Purpose
Provide a clear in-app place for users to view current plan status and upgrade from Free to Pro via invite code redemption.

## User Flow
1. User opens **Pricing** from sidebar.
2. System loads current user's `profiles.plan_tier`.
3. User sees Free vs Pro comparison and current plan badge.
4. Free user enters invite code and clicks **Redeem**.
5. System validates code and upgrades user to Pro when valid.

## Inputs
- Authenticated user session (`authStore` / Supabase auth token).
- `profiles.plan_tier` from Supabase.
- Invite code string.

## Processing Logic
- Frontend route `/pricing` is protected by auth.
- Page queries `profiles` for current user id and reads `plan_tier`.
- Page redeems invite code via `rpc('redeem_invite_code')`.
- On success, `profiles.plan_tier` becomes `pro` and page reflects Pro status.
- Invite code format is validated as 8-character alphanumeric (`A-Z0-9`).
- Default code expiry is 3 days from creation.
- Code is single-use and becomes bound to one account after redemption.

## Database Tables
- `profiles` (read/update `plan_tier` through secure RPC path)
- `invite_codes` (validation and redemption counts)

## Expected Output
- Plan comparison UI with current plan indicator.
- Working invite-code redemption for Free users.

## Error Cases
- Missing session or expired token -> route protection redirects to `/auth`.
- Missing `profiles` row -> show fallback to Free and an error hint.
- Invalid/expired invite code -> show redeem failure message.
- Already-used code by another account -> show redeem failure message.
