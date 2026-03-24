# Project Status

This document tracks the current implementation state of the project based primarily on the actual codebase (`src/`, `api/`). Strategic intent is referenced from `docs/strategy/PRODUCT_SCOPE.md` and `docs/roadmap/ROADMAP.md`.

## Current Product Stage
MVP (early testing). Core flows (auth, dashboard, manual editor, AI generation) are implemented, but key monetization and enforcement rules (Free vs Pro gating and limits) are not yet enforced beyond the UI.

## Implemented Features

### Authentication
- Supabase Auth sign-in/sign-up via the unified `/auth` page.
- Session stored and synchronized into a Zustand store (`authStore`) with route protection.

Code references:
- `src/pages/Auth.jsx`
- `src/store/authStore.js`
- `src/App.jsx`

### Dashboard
- Lists user projects from Supabase.
- Sorts by `created_at` DESC.
- Supports project deletion from the dashboard.
- Displays Free plan usage indicator in the UI.

Code references:
- `src/pages/Dashboard.jsx`

### Project CRUD
- Create project (insert) and update project (update) to Supabase `projects`.
- Load a selected project into the editor store.
- Delete a project from the dashboard list (implemented in UI).

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

## Partially Implemented

### Free Plan Limits (UI + persistence boundary)
- A Free plan limit concept exists in UI messaging and dashboard gating.
- The app now enforces `max 3 projects` before insert in `projectStore.saveProject` (manual editor save and AI auto-save creation path).
- Enforcement is still not implemented in the database policy layer (RLS/policies), so direct external writes are not restricted by this rule yet.

Evidence:
- Strategy: `docs/strategy/PRODUCT_SCOPE.md` defines Free vs Pro and the 3-project limit.
- Roadmap: `docs/roadmap/ROADMAP.md` marks enforcement as not done.
- Code: `src/pages/Dashboard.jsx` (UI gating) and `src/store/projectStore.js` (insert-time limit check).

### Pro Gating for AI Generation (Not enforced)
- Strategy states AI generation is Pro-only.
- Current code allows any authenticated user to use AI Planner.

Evidence:
- Strategy: `docs/strategy/PRODUCT_SCOPE.md` (AI generation not included in Free tier).
- Code: `src/pages/AIPlanner.jsx` does not check plan tier before calling `/api/generate-plan`.

## Not Yet Implemented
Referenced in strategy/roadmap but not present in current implementation:
- Subscription integration (Lemon Squeezy).
- Export formats (PDF/Excel/Markdown/Image).
- Multi-language (i18n).
- Task dependencies and automated timeline shifting.
- AI optimization features (risk analysis, resource estimator).
- Project renaming from Dashboard.

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
- Free plan limits are not enforced consistently (UI gating only).
- AI Planner is not gated behind Pro despite strategy stating it should be.
- Several roadmap items exist as UI placeholders or documentation-only items (Analytics, User Center, exports, subscription).

## Next Recommended Tasks

### P0 (critical)
- Define and implement an authoritative enforcement layer for Free vs Pro (project limits and AI gating) at the persistence boundary (not UI-only).
- Add a minimal server-side verification for AI generation access (align with Pro definition).

### P1 (important)
- Align project rename functionality with roadmap intent (decide where renaming happens: dashboard vs editor, and implement consistently).
- Create an explicit placeholder spec for Analytics to prevent scope drift if it remains disabled.

### P2 (future)
- Subscription integration (Lemon Squeezy) and export functionality.
- Task dependency scheduling and automated timeline shifting.
- i18n support.
