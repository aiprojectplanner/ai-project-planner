# Feature: Pricing & Billing Entry

## Status
MVP initial implementation (checkout entry only).

## Purpose
Provide a clear in-app place for users to view current plan status and start upgrading from Free to Pro.

## User Flow
1. User opens **Pricing** from sidebar.
2. System loads current user's `profiles.plan_tier`.
3. User sees Free vs Pro comparison and current plan badge.
4. User clicks **Upgrade to Pro** to open Lemon Squeezy checkout URL.

## Inputs
- Authenticated user session (`authStore` / Supabase auth token).
- `profiles.plan_tier` from Supabase.
- `VITE_LEMON_SQUEEZY_CHECKOUT_URL` from frontend env.

## Processing Logic
- Frontend route `/pricing` is protected by auth.
- Page queries `profiles` for current user id and reads `plan_tier`.
- If checkout URL is configured, clicking upgrade opens Lemon Squeezy checkout in a new tab.
- If checkout URL is missing, page shows a configuration error message.

## Database Tables
- `profiles` (read `plan_tier`)

## Expected Output
- Plan comparison UI with current plan indicator.
- Working checkout CTA for Free users.

## Error Cases
- Missing session or expired token -> route protection redirects to `/auth`.
- Missing `profiles` row -> show fallback to Free and an error hint.
- Missing checkout URL env -> disable upgrade action with message.
