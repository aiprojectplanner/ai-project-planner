# Project Status

This document tracks the current implementation state of the project based primarily on the actual codebase (`src/`, `api/`). Strategic intent is referenced from `docs/strategy/PRODUCT_SCOPE.md` and `docs/roadmap/ROADMAP.md`.

## Current Product Stage
MVP (early testing). Core flows (auth, dashboard, manual editor, AI generation, bilingual UI) are implemented. Free-tier project creation is enforced in the client persistence path; database-level enforcement requires applying the documented Supabase migration on the target project.

## Implemented Features

### Public Landing Page
- Unauthenticated users see a public marketing landing page at `/`.
- Landing includes 5 sections: Hero, Problem, Solution, Demo, CTA.
- CTA buttons route users to `/auth` for sign-in/sign-up.
- Authenticated users visiting `/` are redirected to `/dashboard`.

Code references:
- `src/pages/Landing.jsx`
- `src/App.jsx`

### Authentication
- Supabase Auth sign-in/sign-up via the unified `/auth` page.
- Session stored and synchronized into a Zustand store (`authStore`) with route protection.

Code references:
- `src/pages/Auth.jsx`
- `src/store/authStore.js`
- `src/App.jsx`

### Dashboard
- Main authenticated dashboard route is `/dashboard`.
- Lists user projects from Supabase.
- Sorts by `created_at` DESC.
- Supports project deletion from the dashboard.
- Supports inline project rename from dashboard cards.
- Displays Free plan usage indicator in the UI.

Code references:
- `src/pages/Dashboard.jsx`

### Project CRUD
- Create project (insert) and update project (update) to Supabase `projects`.
- Load a selected project into the editor store.
- Delete a project from the dashboard list (implemented in UI).
- Rename project title from dashboard card (update by id).

Code references:
- `src/store/projectStore.js`
- `src/pages/Dashboard.jsx`

### Task CRUD
- Add task, edit task fields (name/start/end/dep), delete task.
- Date validation ensures `end >= start` and keeps tasks editable.

Code references:
- `src/store/projectStore.js`
- `src/pages/ProjectEditor.jsx`

### Timeline / Gantt
- Renders a simple week-based header and task bars based on task start/end dates.
- Uses a custom lightweight Gantt visualization rather than an external library.

Code references:
- `src/pages/ProjectEditor.jsx`

### Export
- Project Editor supports client-side export for JSON and Markdown.
- Export is generated from current editor state and downloaded via browser blob URL.

Code references:
- `src/pages/ProjectEditor.jsx`

### AI Planner
- AI Planner UI submits an idea to `POST /api/generate-plan`.
- Backend calls OpenRouter using a priority-ordered model list (`OPENROUTER_MODELS`, or `OPENROUTER_MODEL`, or code default) and returns JSON `{ projectTitle, timeline }` when a model succeeds.
- Frontend imports the plan into `projectStore`, auto-saves to Supabase, then navigates to `/editor`.
- AI Planner is behind authentication (same as Dashboard and Editor); unauthenticated users are redirected to `/auth`.
- Frontend avoids blind `response.json()` and provides clearer errors for non-OK/non-JSON responses.

Code references:
- `src/pages/AIPlanner.jsx`
- `api/generate-plan.js`
- `src/store/projectStore.js`

### Pricing
- Protected `/pricing` route is available in the sidebar.
- Page reads `profiles.plan_tier` and displays current plan (Free/Pro).
- Free users can redeem invite codes to enable Pro during promotion stage.
- Automated payment checkout and webhook sync are intentionally deferred.

Code references:
- `src/pages/Pricing.jsx`
- `src/App.jsx`

### Internationalization (i18n)
- UI supports English (`en`) and Simplified Chinese (`zh`).
- Language preference is stored in `localStorage` (`app.locale`).
- Language switcher appears in the authenticated header and sidebar, on the landing page header, on the auth page, and in the project editor header.

Code references:
- `src/i18n/I18nProvider.jsx`, `src/i18n/messages.js`, `src/i18n/useI18n.js`
- `src/components/LanguageSwitcher.jsx`
- `src/main.jsx` (provider wiring)

## Partially Implemented

### Free Plan Limits (client + optional database policy)
- UI messaging and dashboard gating reflect the Free plan limit.
- The app enforces `max 3 projects` before insert in `projectStore.saveProject` (manual editor save and AI auto-save creation path).
- **Database enforcement**: migration `supabase/migrations/20260324_enforce_free_project_limit.sql` defines an RLS insert policy using `public.can_create_project_for_user`. It must be applied to the Supabase project for the limit to be authoritative for all clients and direct SQL/API access.

Evidence:
- Strategy: `docs/strategy/PRODUCT_SCOPE.md` defines Free vs Pro and the 3-project limit.
- Code: `src/pages/Dashboard.jsx` (UI gating) and `src/store/projectStore.js` (insert-time limit check).

### Pro Gating for AI Generation (server enforced)
- Strategy states AI generation is Pro-only.
- Server implementation gates `POST /api/generate-plan` with bearer auth + `profiles.plan_tier === 'pro'`.

Evidence:
- Strategy: `docs/strategy/PRODUCT_SCOPE.md` (AI generation not included in Free tier).
- Code: `api/generate-plan.js` validates auth token and checks `profiles.plan_tier`.

## Not Yet Implemented
Referenced in strategy/roadmap but not present in current implementation:
- Subscription integration webhook sync (Lemon Squeezy/Stripe -> `profiles.plan_tier`).
- Export formats (PDF/Excel/Image) beyond JSON/Markdown.
- Task dependencies and automated timeline shifting.
- AI optimization features (risk analysis, resource estimator).

References:
- `docs/strategy/PRODUCT_SCOPE.md`
- `docs/roadmap/ROADMAP.md`

## Technical Stack

### Frontend
- React 18 + Vite
- React Router
- Zustand state management
- Tailwind CSS styling
- Lucide icons

Evidence:
- `package.json`
- `src/App.jsx`

### Backend
- Vercel Serverless Functions (`/api/*`)
- Node.js runtime

Evidence:
- `api/generate-plan.js`
- `vercel.json`

### Database
- Supabase (PostgreSQL). RLS configuration must be verified.

Evidence:
- `src/lib/supabaseClient.js`
- `src/store/projectStore.js`

### AI Integration
- OpenRouter gateway; model selection and failover are driven by `OPENROUTER_MODELS` / `OPENROUTER_MODEL` (see `api/generate-plan.js` and `.env.example`).

Evidence:
- `api/generate-plan.js`

## Known Gaps
- Apply Supabase migrations (including free project insert policy) on production/staging so limits match the codebase assumptions.
- Several roadmap items remain placeholders or documentation-only (Analytics, User Center, subscription checkout).

## Next Recommended Tasks

### P0 (critical)
- Apply `20260324_enforce_free_project_limit.sql` (and related profile/invite migrations if not yet applied) to the live Supabase project; verify RLS behavior in SQL Editor.

### P1 (important)
- Create an explicit placeholder spec for Analytics to prevent scope drift if it remains disabled.
- Expand i18n coverage for any new screens and for API error message mapping where feasible.

### P2 (future)
- Subscription integration (Lemon Squeezy) and additional export formats (PDF/Excel/Image).
- Task dependency scheduling and automated timeline shifting.
- Optional: restore deferred "non-working day" calendar behavior in the editor behind a future toggle.
