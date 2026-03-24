# Feature: Landing Page

## Status
Initial public marketing page implementation.

## Purpose
Provide a public-facing entry page that communicates value quickly and drives visitors to start using AI Project Planner.

## User Flow
1. Unauthenticated visitor lands on `/`.
2. Visitor scrolls through Hero, Problem, Solution, Demo, and CTA sections.
3. Visitor clicks "Try it free" or "Start planning".
4. Visitor is redirected to `/auth` to continue.

## Content Structure
1. Hero Section
2. Problem Section
3. Solution Section
4. Demo Section
5. CTA Section

## Interaction Logic
- Top navigation anchors scroll to sections.
- "Try it free" and "Start planning" trigger route navigation to `/auth`.
- Demo section supports "Play demo" and "Reset demo" interactions.
- Demo section supports multiple scenarios via tabs (SaaS / E-commerce / Growth). Playback applies to the currently selected scenario.

## Expected Output
- Public route `/` renders the full landing page for non-authenticated users.
- Authenticated users visiting `/` are redirected to `/dashboard`.

## Error Cases
- Section anchor not found: ignore action safely.
- Demo interaction failures should not block page rendering.
